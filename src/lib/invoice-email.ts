import {
  computeTotals,
  fmtMoney,
  itemTotal,
  STATUS_LABEL,
} from "@/lib/invoices";
import { fmtDateTime } from "@/lib/format";
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
} from "@/lib/supabase/types";

export function esc(v: string | null | undefined): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildEmailHtml(opts: {
  invoice: Invoice;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  url: string;
  /** Si viene, el correo es un recordatorio de pago y no el envío inicial. */
  reminder?: { headline: string; installment?: number };
}): string {
  const { invoice, items, payments, url, reminder } = opts;
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
    ? `<div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:28px 0 10px;">Pagos recibidos</div>
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

  const installmentBlock =
    reminder?.installment && t.balance > 0
      ? `<div style="margin-top:20px;padding:14px 16px;background:#03210f;border:1px solid #0a5c38;border-radius:8px;">
           <span style="font-size:12px;color:#00e5a0;text-transform:uppercase;letter-spacing:.05em;">Cuota a pagar hoy</span>
           <div style="font-size:22px;font-weight:700;color:#00e5a0;margin-top:4px;">${esc(fmtMoney(reminder.installment, cur))}</div>
         </div>`
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
      ${reminder ? `<div style="padding:16px 28px;background:#1a1500;border-bottom:1px solid #4a3d00;color:#e6b800;font-size:15px;font-weight:700;">${esc(reminder.headline)}${invoice.due_date ? ` · Fecha de pago: ${esc(invoice.due_date)}` : ""}</div>` : ""}
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
        ${installmentBlock}
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
