import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildEmailHtml } from "@/lib/invoice-email";
import { computeTotals, fmtMoney } from "@/lib/invoices";
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
} from "@/lib/supabase/types";

/**
 * Recordatorios de pago por fecha de vencimiento.
 *
 * Hay tres etapas: a 5 días o menos (2-5), el día anterior (1) y el mismo día
 * (0). Cada una se manda una sola vez por factura; `reminders_sent` guarda las
 * ya enviadas. Si la factura se crea o se edita cuando ya está dentro de una
 * ventana, la etapa correspondiente sale de inmediato en vez de esperar al cron.
 * Al cambiar la fecha de vencimiento la lista se reinicia (ver InvoiceEditor).
 *
 * Facturas recurrentes (`pay_days` no vacío): ignoran las etapas anteriores y
 * mandan un solo correo con la cuota los días del mes indicados (15, 30...),
 * mientras quede saldo. Un día mayor al último del mes cae en el último día.
 */

export type ReminderStage = 5 | 1 | 0;

const TZ = "America/Santo_Domingo";

/** Fecha de hoy (YYYY-MM-DD) en hora dominicana, no en la del servidor (UTC). */
export function todayInSantoDomingo(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Etapa que toca hoy para una fecha de vencimiento, o null si aún no/ya pasó. */
export function reminderStage(
  dueDate: string,
  today = todayInSantoDomingo(),
): ReminderStage | null {
  const days = Math.round(
    (Date.parse(`${dueDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86_400_000,
  );
  if (days < 0 || days > 5) return null;
  return days === 0 ? 0 : days === 1 ? 1 : 5;
}

/** ¿Hoy toca cobrar según los días del mes configurados? */
export function isPayDay(payDays: number[], today = todayInSantoDomingo()) {
  const [y, m, d] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return payDays.some((pd) => Math.min(pd, lastDay) === d);
}

function headline(dueDate: string, today: string): string {
  const days = Math.round(
    (Date.parse(`${dueDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86_400_000,
  );
  if (days === 0) return "Recordatorio de pago: tu factura vence hoy";
  if (days === 1) return "Recordatorio de pago: tu factura vence mañana";
  return `Recordatorio de pago: tu factura vence en ${days} días`;
}

export type ReminderResult =
  { sent: true; recipient: string } | { sent: false; reason: string };

/** Manda el recordatorio de una factura si le toca y aún no se envió esa etapa. */
export async function sendInvoiceReminder(
  admin: SupabaseClient,
  invoiceId: string,
  origin: string,
): Promise<ReminderResult> {
  const { data: invoice } = await admin
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle<Invoice>();
  if (!invoice) return { sent: false, reason: "Factura no encontrada" };
  if (!invoice.due_date && !(invoice.pay_days ?? []).length)
    return { sent: false, reason: "Sin fecha de pago" };

  const today = todayInSantoDomingo();
  const recurring = (invoice.pay_days ?? []).length > 0;
  let stage: ReminderStage | null = null;
  if (recurring) {
    if (!isPayDay(invoice.pay_days, today))
      return { sent: false, reason: "Hoy no es día de pago" };
    if (invoice.last_installment_on === today)
      return { sent: false, reason: "Ya enviado" };
  } else {
    stage = reminderStage(invoice.due_date!, today);
    if (stage === null) return { sent: false, reason: "Fuera de la ventana" };
    if ((invoice.reminders_sent ?? []).includes(stage))
      return { sent: false, reason: "Ya enviado" };
  }
  if (!invoice.party_email) return { sent: false, reason: "Sin correo" };

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

  // Una factura saldada no se recuerda.
  const { balance } = computeTotals(invoice, items, payments);
  if (balance <= 0) return { sent: false, reason: "Factura saldada" };

  const from = process.env.RESEND_FROM;
  if (!process.env.RESEND_API_KEY || !from)
    return { sent: false, reason: "Correo no configurado" };

  const installment = recurring
    ? Math.min(Number(invoice.installment_amount) || balance, balance)
    : undefined;
  const head = recurring
    ? "Recordatorio de pago: hoy toca tu cuota"
    : headline(invoice.due_date!, today);
  const subject = recurring
    ? `Cuota de ${fmtMoney(installment!, invoice.currency)} · Factura #${invoice.number} · C Digital`
    : `${head.replace("Recordatorio de pago: tu factura", `Factura #${invoice.number}`)} · C Digital`;
  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from,
      to: [invoice.party_email],
      subject,
      html: buildEmailHtml({
        invoice,
        items,
        payments,
        url: `${origin}/factura/${invoice.public_token}`,
        reminder: { headline: head, installment },
      }),
    });
  } catch (e) {
    console.error("[invoice-reminders] Error al enviar con Resend:", e);
    return { sent: false, reason: "El correo no se pudo enviar" };
  }

  // Se marca después de enviar: si esto falla, el peor caso es un duplicado
  // en la próxima corrida y no un recordatorio que nunca salió.
  await admin
    .from("invoices")
    .update(
      recurring
        ? { last_installment_on: today }
        : { reminders_sent: [...(invoice.reminders_sent ?? []), stage] },
    )
    .eq("id", invoice.id);

  return { sent: true, recipient: invoice.party_email };
}
