import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import { GestionoAPI, type GestionoInvoiceItem } from "@/lib/gestiono";
import { computeTotals } from "@/lib/invoices";
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
} from "@/lib/supabase/types";

/**
 * Genera el link de pago (Stripe, hospedado por Gestiono) de una factura que
 * vive en Supabase.
 *
 * Gestiono no tiene "payment links" sueltos: el link es el enlace compartido de
 * una factura suya. Como nuestras facturas viven en Supabase, hay que espejarlas
 * primero. Por eso este endpoint escribe en la contabilidad de Gestiono, y por
 * eso es idempotente: el segundo clic devuelve el link ya creado en vez de
 * duplicar la factura.
 *
 * El body solo trae `invoiceId`. Los importes se releen en el servidor por la
 * misma razón que en /api/invoice-send: si el navegador pudiera dictar el monto,
 * cualquiera con sesión podría emitir un link que cobre lo que quiera.
 */

/** Solo se le cobra por link a un cliente; a un colaborador se le paga. */
const PAYABLE_PARTY = "client";

/** Mismo valor por defecto que usa el formulario de facturación del dashboard. */
const DEFAULT_UNIT = "UNIT";

/**
 * Fecha en ISO 8601 completo, que es lo que acepta Gestiono.
 *
 * Confirmado a la mala: "YYYY-MM-DD" devuelve "Fecha de creación invalida",
 * mientras que un ISO con hora pasa la validación de formato. Se normaliza con
 * `Date` porque Postgres puede devolver el timestamptz con espacio en vez de "T".
 *
 * Va en UTC a propósito: es el mismo instante, sin el desfase de un día que
 * produce truncar a fecha local.
 */
function toIsoInstant(value: string): string | undefined {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Traduce las líneas de la factura de Supabase a `elements[]` de Gestiono.
 *
 * El mapeo se confirmó contra la API real (la doc declara `elements[]` como
 * `Type: unknown`): los cuatro campos son los que el validador acepta, y `unit`
 * es obligatorio. Nuestras líneas ya lo traen, así que se pasa tal cual — un
 * "hora" o "mes" escrito en el dashboard llega igual a la factura de Gestiono.
 */
function buildGestionoElements(
  items: Pick<InvoiceItem, "concept" | "unit_price" | "quantity" | "unit">[],
): GestionoInvoiceItem[] {
  return items.map((it) => ({
    description: it.concept,
    quantity: Number(it.quantity),
    price: Number(it.unit_price),
    unit: it.unit?.trim() || DEFAULT_UNIT,
  }));
}

export async function POST(request: NextRequest) {
  // El middleware no cubre /api: la sesión se verifica aquí o queda abierto.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  // Los clientes del panel tambien tienen sesion: esto es solo para el equipo.
  if (!(await isTeamMember())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: { invoiceId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.invoiceId) {
    return NextResponse.json({ error: "Falta invoiceId" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: invoice } = await admin
    .from("invoices")
    .select("*")
    .eq("id", body.invoiceId)
    .maybeSingle<Invoice>();

  if (!invoice) {
    return NextResponse.json(
      { error: "Factura no encontrada" },
      { status: 404 },
    );
  }

  // Idempotencia: si ya se espejó, se devuelve el mismo link. Sin esto, cada
  // clic crearía otra factura en Gestiono y otra cuenta por cobrar duplicada.
  if (invoice.gestiono_share_url) {
    return NextResponse.json({
      shareUrl: invoice.gestiono_share_url,
      pendingRecordId: invoice.gestiono_pending_record_id,
      amount: invoice.gestiono_link_amount,
      reused: true,
    });
  }

  if (invoice.party_type !== PAYABLE_PARTY) {
    return NextResponse.json(
      {
        error:
          "Solo las facturas a clientes admiten link de pago; a un colaborador se le paga, no se le cobra.",
      },
      { status: 400 },
    );
  }

  const [itemsRes, paymentsRes] = await Promise.all([
    admin
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("sort_order", { ascending: true }),
    admin
      .from("invoice_payments")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("paid_at", { ascending: true }),
  ]);

  const items = (itemsRes.data as InvoiceItem[]) ?? [];
  const payments = (paymentsRes.data as InvoicePayment[]) ?? [];

  if (items.length === 0) {
    return NextResponse.json(
      { error: "La factura no tiene conceptos" },
      { status: 400 },
    );
  }

  const totals = computeTotals(invoice, items, payments);

  if (totals.balance <= 0) {
    return NextResponse.json(
      { error: "La factura ya está cobrada por completo" },
      { status: 400 },
    );
  }

  // El link cobra el SALDO PENDIENTE, no el total: es lo que el cliente espera
  // pagar. Consecuencia asumida: cuando hay abonos, la factura espejo en
  // Gestiono refleja solo el resto y no coincide con la de Supabase. Por eso se
  // manda como una sola línea con el saldo — desglosar conceptos que suman más
  // que el monto cobrado sería una factura incoherente.
  const hasPayments = totals.paid > 0;

  const elements: GestionoInvoiceItem[] = hasPayments
    ? [
        {
          description: `Factura #${invoice.number} — saldo pendiente`,
          quantity: 1,
          price: totals.balance,
          unit: DEFAULT_UNIT,
        },
      ]
    : buildGestionoElements(items);

  const publicKey = process.env.NEXT_PUBLIC_GESTIONO_PUBLIC_KEY;
  // Sin fallback a NEXT_PUBLIC_*: esta clave firma cada petición a Gestiono y
  // un nombre con ese prefijo puede acabar en el bundle del navegador. Preferimos
  // que la ruta falle en claro antes que leer el secreto desde una variable
  // publicable.
  const privateKey = process.env.NEXT_PUBLIC_GESTIONO_SECRET_KEY;
  const organizationId = process.env.NEXT_PUBLIC_GESTIONO_ORGANIZATION_ID;
  const divisionId = process.env.GESTIONO_DIVISION_ID;

  if (!publicKey || !privateKey || !organizationId || !divisionId) {
    console.error("Faltan credenciales de Gestiono o GESTIONO_DIVISION_ID");
    return NextResponse.json(
      { error: "Error de configuración del servidor" },
      { status: 500 },
    );
  }

  const gestionoAPI = new GestionoAPI(publicKey, privateKey, organizationId);

  try {
    // Los dos pasos van separados a propósito, en vez de usar
    // `createPaymentLink`: el id de la factura se guarda EN CUANTO existe. Si
    // luego falla el pedido del link, el próximo clic reutiliza esa factura en
    // vez de crear otra. Antes, un fallo en el paso 2 dejaba una factura
    // huérfana en Gestiono y el reintento duplicaba la cuenta por cobrar.
    let pendingRecordId = invoice.gestiono_pending_record_id;

    if (!pendingRecordId) {
      pendingRecordId = await gestionoAPI.createInvoice({
        divisionId: Number(divisionId),
        currency: invoice.currency,
        items: elements,
        description: `Factura #${invoice.number}`,
        // La emisión va en `date`. `dueDate` se omite a propósito: nuestras
        // facturas no tienen vencimiento, y Gestiono rechaza cualquier valor
        // que no sea posterior a la emisión.
        date: toIsoInstant(invoice.issued_at),
        // El snapshot fiscal congelado en la factura es la fuente: si el cliente
        // se renombró después de emitir, se cobra a nombre de quien se facturó.
        contact: {
          name: invoice.party_name,
          type: "CLIENT",
          taxId: invoice.party_tax_id ?? undefined,
          contact: invoice.party_email
            ? [{ type: "EMAIL", data: invoice.party_email }]
            : undefined,
        },
      });

      const { error: idError } = await admin
        .from("invoices")
        .update({
          gestiono_pending_record_id: pendingRecordId,
          gestiono_link_amount: totals.balance,
        })
        .eq("id", invoice.id);

      // Si esto falla, la factura existe en Gestiono pero no quedó registrada:
      // hay que abortar antes de seguir, o el reintento la duplica.
      if (idError) {
        console.error(
          `Factura ${pendingRecordId} creada en Gestiono pero no se pudo registrar en Supabase:`,
          idError,
        );
        return NextResponse.json(
          {
            error:
              "La factura se creó en Gestiono pero no se pudo registrar acá. Anotá el id y revisá antes de reintentar.",
            pendingRecordId,
          },
          { status: 500 },
        );
      }
    }

    // Link de pago con tarjeta, no de "ver factura": Gestiono son dos entidades
    // distintas bajo /shared/… y solo el UUID de esta sirve para cobrar.
    const shareUrl = await gestionoAPI.getPaymentLinkUrl(pendingRecordId);

    const result = { pendingRecordId, shareUrl };

    const { error: saveError } = await admin
      .from("invoices")
      .update({
        gestiono_share_url: result.shareUrl,
        gestiono_linked_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    if (saveError) {
      console.error(
        `Link de pago creado (pendingRecordId ${result.pendingRecordId}) pero no se pudo guardar en Supabase:`,
        saveError,
      );
    }

    return NextResponse.json({
      shareUrl: result.shareUrl,
      pendingRecordId: result.pendingRecordId,
      amount: totals.balance,
      reused: false,
      saved: !saveError,
    });
  } catch (error) {
    console.error("Error al crear el link de pago en Gestiono:", error);
    return NextResponse.json(
      {
        error: "No se pudo crear el link de pago",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 502 },
    );
  }
}
