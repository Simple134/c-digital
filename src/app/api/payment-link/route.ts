import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  GestionoAPI,
  type GestionoCurrency,
  type GestionoInvoiceItem,
} from "@/lib/gestiono";

const ITBIS_RATE = 0.18;

/** Lo que envía el frontend: servicios en lenguaje de negocio, no de contabilidad. */
interface RequestedService {
  nombre: string;
  /** Opcional: si no viene, se asume 1. */
  cantidad?: number;
  /** Precio unitario sin ITBIS. */
  precio: number;
  /** Unidad de medida ("hora", "mes"…). Si no viene, "UNIT". */
  unidad?: string;
}

interface PaymentLinkBody {
  servicios: RequestedService[];
  cliente: {
    nombre: string;
    correo: string;
    rnc?: string;
  };
  moneda?: GestionoCurrency;
  descripcion?: string;
  /**
   * Vencimiento en "YYYY-MM-DD". Si no viene, la factura no lleva vencimiento.
   * Debe ser posterior a la emisión: Gestiono rechaza el resto con
   * "Fecha de vencimiento invalida".
   */
  vence?: string;
  /** Enviar el link por correo al cliente además de devolverlo. */
  enviarPorCorreo?: boolean;
  /** Sumar 18% de ITBIS a cada precio. Por defecto no se aplica. */
  incluirItbis?: boolean;
}

/**
 * Traduce los servicios solicitados a las líneas (`elements`) de la factura.
 *
 * El ITBIS (18%) se aplica solo cuando lo pedimos explícitamente
 * (`incluirItbis`), y se suma al precio unitario en vez de ir como línea de
 * impuesto aparte: así el cliente ve en el link exactamente el monto que va a
 * pagar y basta una sola llamada a Gestiono. La contrapartida es que la
 * factura no discrimina el impuesto — si contabilidad lo necesita separado,
 * hay que adjuntarlo con POST /v1/record/pending/element/taxes.
 *
 * No enlazamos `resourceId`: los servicios van como descripción libre.
 */
function buildInvoiceItems(
  servicios: RequestedService[],
  incluirItbis: boolean,
): GestionoInvoiceItem[] {
  return servicios.map((servicio) => {
    const cantidad = servicio.cantidad ?? 1;

    if (!Number.isFinite(servicio.precio) || servicio.precio < 0) {
      throw new Error(`Precio inválido para "${servicio.nombre}"`);
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new Error(`Cantidad inválida para "${servicio.nombre}"`);
    }

    const precio = incluirItbis
      ? Math.round(servicio.precio * (1 + ITBIS_RATE) * 100) / 100
      : servicio.precio;

    // `unit` es obligatorio en Gestiono (confirmado contra la API: sin él
    // responde 400 con `elements.0.unit: Required`).
    return {
      description: servicio.nombre,
      quantity: cantidad,
      price: precio,
      unit: servicio.unidad?.trim() || "UNIT",
    };
  });
}

export async function POST(request: NextRequest) {
  // El middleware no cubre /api: la sesión se verifica aquí o el endpoint queda
  // abierto a internet. Sin esto, cualquiera podría crear facturas en nuestra
  // contabilidad de Gestiono y usar `enviarPorCorreo` como relay de correo.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PaymentLinkBody;

    if (!Array.isArray(body.servicios) || body.servicios.length === 0) {
      return NextResponse.json(
        { error: "Debes enviar al menos un servicio" },
        { status: 400 },
      );
    }

    if (!body.cliente?.nombre || !body.cliente?.correo) {
      return NextResponse.json(
        { error: "Faltan nombre y correo del cliente" },
        { status: 400 },
      );
    }

    // Preferimos los nombres sin NEXT_PUBLIC_: esa clave privada firma todas
    // las peticiones y no debe poder terminar en el bundle del navegador.
    // El fallback mantiene compatibilidad hasta que se renombren en .env/Vercel.
    // Se construye antes de tocar Gestiono: un precio o cantidad inválidos son
    // culpa de la petición (400), no un fallo del servidor.
    let items: GestionoInvoiceItem[];
    try {
      items = buildInvoiceItems(body.servicios, body.incluirItbis ?? false);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Servicios inválidos",
        },
        { status: 400 },
      );
    }

    const publicKey =
      process.env.NEXT_PUBLIC_GESTIONO_PUBLIC_KEY;
    // Sin fallback a NEXT_PUBLIC_*: firma cada petición y no debe poder
    // terminar en el bundle del navegador.
    const privateKey = process.env.NEXT_PUBLIC_GESTIONO_SECRET_KEY;
    const organizationId =
      process.env.NEXT_PUBLIC_GESTIONO_ORGANIZATION_ID;
    const divisionId = process.env.GESTIONO_DIVISION_ID;

    if (!publicKey || !privateKey || !organizationId || !divisionId) {
      console.error("Faltan credenciales o GESTIONO_DIVISION_ID");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    const gestionoAPI = new GestionoAPI(publicKey, privateKey, organizationId);

    const result = await gestionoAPI.createPaymentLink({
      divisionId: Number(divisionId),
      currency: body.moneda ?? "DOP",
      items,
      description: body.descripcion,
      dueDate: body.vence,
      note: body.descripcion ?? "",
      contact: {
        name: body.cliente.nombre,
        type: "CLIENT",
        taxId: body.cliente.rnc,
        contact: [{ type: "EMAIL", data: body.cliente.correo }],
      },
      sendToEmails: body.enviarPorCorreo ? [body.cliente.correo] : undefined,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("Error al crear link de pago:", error);

    return NextResponse.json(
      {
        error: "No se pudo crear el link de pago",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
