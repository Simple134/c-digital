import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import { buildEmailHtml } from "@/lib/invoice-email";
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
} from "@/lib/supabase/types";

/**
 * Envía una factura por correo al cliente o al colaborador.
 *
 * El body solo trae `invoiceId`: importes, destinatario y conceptos se releen
 * en el servidor. Si el navegador pudiera dictar el contenido, este endpoint
 * sería un relay de correo abierto a cualquiera con sesión — y encima permitiría
 * mandar facturas con montos que no están en la base de datos.
 */

type SendResult = { sent: boolean; reason?: string; recipient?: string };

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

  let body: { invoiceId?: string; to?: string };
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
    .maybeSingle();

  if (!invoice) {
    return NextResponse.json(
      { error: "Factura no encontrada" },
      { status: 404 },
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

  // El destinatario alternativo se permite (reenviar a contabilidad, por
  // ejemplo) pero se valida: `to` viene del navegador.
  const override = body.to?.trim();
  if (override && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(override)) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }
  const recipient = override || (invoice as Invoice).party_email;
  if (!recipient) {
    return NextResponse.json<SendResult>({
      sent: false,
      reason: `${(invoice as Invoice).party_name} no tiene correo configurado.`,
    });
  }

  const from = process.env.RESEND_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    console.warn("[invoice-send] Resend no configurado; se omite el envío.");
    return NextResponse.json<SendResult>({
      sent: false,
      reason: "El servicio de correo no está configurado.",
    });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from,
      to: [recipient],
      subject: `Factura #${(invoice as Invoice).number} · C Digital`,
      html: buildEmailHtml({
        invoice: invoice as Invoice,
        items: (itemsRes.data as InvoiceItem[]) ?? [],
        payments: (paymentsRes.data as InvoicePayment[]) ?? [],
        url: `${request.nextUrl.origin}/factura/${(invoice as Invoice).public_token}`,
      }),
    });
  } catch (emailError) {
    console.error("[invoice-send] Error al enviar con Resend:", emailError);
    return NextResponse.json<SendResult>({
      sent: false,
      reason: "El correo no se pudo enviar.",
    });
  }

  return NextResponse.json<SendResult>({ sent: true, recipient });
}
