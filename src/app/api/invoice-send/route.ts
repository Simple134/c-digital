import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDateTime } from "@/lib/format";
import {
  computeTotals,
  fmtMoney,
  itemTotal,
  STATUS_LABEL,
} from "@/lib/invoices";
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

function esc(v: string | null | undefined): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildEmailHtml(opts: {
  invoice: Invoice;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  url: string;
}): string {
  const { invoice, items, payments, url } = opts;
  const cur = invoice.currency;
  const t = computeTotals(invoice, items, payments);

  const itemRows = items
    .map(
      (it) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #222;font-style:italic;color:#ddd;">${esc(it.concept)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #222;color:#bbb;">${Number(it.quantity)} ${esc(it.unit)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #222;text-align:right;">${esc(fmtMoney(itemTotal(it), cur))}</td>
      </tr>`,
    )
    .join("");

  const paymentRows = payments.length
    ? `<div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:28px 0 10px;">Abonos recibidos</div>
       <table style="width:100%;font-size:13px;border-collapse:collapse;">
         ${payments
           .map(
             (p) => `<tr>
               <td style="padding:6px 0;color:#ddd;">${esc(p.method)}</td>
               <td style="padding:6px 0;color:#888;">${esc(fmtDateTime(p.paid_at))}</td>
               <td style="padding:6px 0;text-align:right;color:#00e5a0;">${esc(fmtMoney(Number(p.amount), cur))}</td>
             </tr>`,
           )
           .join("")}
       </table>`
    : "";

  const balanceBlock =
    t.balance > 0
      ? `<div style="margin-top:20px;padding:14px 16px;background:#1a1500;border:1px solid #4a3d00;border-radius:8px;">
           <span style="font-size:12px;color:#c9a800;text-transform:uppercase;letter-spacing:.05em;">Saldo pendiente</span>
           <div style="font-size:22px;font-weight:700;color:#e6b800;margin-top:4px;">${esc(fmtMoney(t.balance, cur))}</div>
         </div>`
      : `<div style="margin-top:20px;padding:14px 16px;background:#03210f;border:1px solid #0a5c38;border-radius:8px;color:#00e5a0;font-weight:700;">
           Factura saldada. ¡Gracias!
         </div>`;

  return `<!DOCTYPE html><html><body style="margin:0;background:#050505;font-family:Helvetica,Arial,sans-serif;padding:24px;">
    <div style="max-width:640px;margin:0 auto;background:#0a0a0a;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden;color:#fff;">
      <div style="padding:28px 28px 0;">
        <div style="font-size:12px;color:#bbb;">${invoice.party_type === "client" ? "Cliente:" : "Colaborador:"}</div>
        <div style="font-size:22px;margin-top:2px;">${esc(invoice.party_name)}</div>
        <div style="font-size:12px;color:#888;margin-top:14px;">Fecha: ${esc(fmtDateTime(invoice.issued_at))}</div>
        <h1 style="font-size:26px;margin:22px 0 18px;">Factura #${esc(invoice.number)}</h1>
      </div>

      <div style="padding:0 28px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:1px solid #333;color:#fff;">Concepto</th>
            <th style="text-align:left;padding-bottom:8px;border-bottom:1px solid #333;color:#fff;">Cantidad</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:1px solid #333;color:#fff;">Total</th>
          </tr>
          ${itemRows}
        </table>

        <div style="text-align:right;margin-top:20px;font-size:13px;color:#bbb;">
          Descuento: ${esc(fmtMoney(t.discount, cur))}
          ${t.tax > 0 ? `<br/>ITBIS (${Number(invoice.tax_rate)}%): ${esc(fmtMoney(t.tax, cur))}` : ""}
        </div>
        <div style="text-align:right;font-size:24px;font-weight:700;margin-top:6px;">Total: ${esc(fmtMoney(t.total, cur))}</div>
        <div style="text-align:right;font-size:12px;color:#888;margin-top:4px;">Estado: ${esc(STATUS_LABEL[t.status])}</div>

        ${paymentRows}
        ${balanceBlock}

        ${invoice.description ? `<div style="margin-top:26px;"><div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:6px;">Descripción</div><p style="margin:0;font-size:13px;color:#ccc;line-height:1.5;">${esc(invoice.description)}</p></div>` : ""}
        ${invoice.note ? `<p style="margin:14px 0 0;font-size:13px;color:#999;"><strong style="color:#ccc;">Nota:</strong> ${esc(invoice.note)}</p>` : ""}

        <div style="margin:30px 0;">
          <a href="${esc(url)}" style="display:inline-block;background:#00e5a0;color:#000;padding:12px 22px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Ver factura y descargar PDF</a>
        </div>
      </div>

      <div style="padding:20px 28px;border-top:1px solid #1e1e1e;">
        <div style="font-size:30px;font-weight:300;">C Digital<span style="color:#00e5a0;">.</span></div>
        <div style="font-size:11px;color:#666;margin-top:6px;">C Digital · estudiocdigital.com</div>
      </div>
    </div>
  </body></html>`;
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
