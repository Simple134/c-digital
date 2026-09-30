import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import { siteOrigin } from "@/lib/site";
import { sendInvoiceReminder } from "@/lib/invoice-reminders";

/**
 * Recordatorios de pago.
 *
 * GET  — lo dispara el cron diario de Vercel (Authorization: Bearer CRON_SECRET)
 *        y recorre todas las facturas con vencimiento en los próximos 5 días.
 * POST — lo llama el editor de facturas tras guardar, para que una factura
 *        creada ya dentro de la ventana avise de inmediato. Solo equipo.
 *
 * En ambos casos el destinatario y el contenido salen de la base de datos.
 */

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: due } = await admin
    .from("invoices")
    .select("id")
    .not("due_date", "is", null);

  let sent = 0;
  for (const { id } of (due as { id: string }[]) ?? []) {
    const r = await sendInvoiceReminder(admin, id, siteOrigin());
    if (r.sent) sent++;
  }
  return NextResponse.json({ checked: due?.length ?? 0, sent });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isTeamMember())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    invoiceId?: string;
  };
  if (!body.invoiceId) {
    return NextResponse.json({ error: "Falta invoiceId" }, { status: 400 });
  }
  const result = await sendInvoiceReminder(
    createAdminClient(),
    body.invoiceId,
    siteOrigin(),
  );
  return NextResponse.json(result);
}
