import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import { fmtDueDate } from "@/lib/delivery";
import { sendSms } from "@/lib/sms";
import { siteOrigin } from "@/lib/site";

/**
 * Recordatorio por SMS al cliente de sus pendientes, hermano de
 * /api/client-reminder (que hace lo mismo por correo). Mismo criterio de qué
 * cuenta como pendiente y las mismas comprobaciones de autorización.
 */

type SmsReminderResult = {
  sent: boolean;
  reason?: string;
  recipientName?: string;
  taskCount?: number;
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!(await isTeamMember())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: { clientId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { clientId } = body;
  if (!clientId) {
    return NextResponse.json({ error: "Falta clientId" }, { status: 400 });
  }

  const { data: allowed } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("name, phone, public_token")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError) {
    console.error(
      "[client-sms-reminder] Error al leer el cliente:",
      clientError,
    );
    return NextResponse.json({ error: "Error de lectura" }, { status: 500 });
  }
  if (!client) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 },
    );
  }
  if (!client.phone) {
    return NextResponse.json<SmsReminderResult>({
      sent: false,
      reason: `${client.name} no tiene teléfono configurado.`,
      recipientName: client.name,
    });
  }

  const [{ data: cards }, { data: columns }] = await Promise.all([
    admin
      .from("kanban_cards")
      .select("title, due_date, column_id, completed_at")
      .eq("client_id", clientId)
      .eq("assigned_to_client", true)
      .order("sort_order", { ascending: true }),
    admin.from("kanban_columns").select("id, title, is_done"),
  ]);

  const columnById = new Map(
    (columns ?? []).map((c) => [
      c.id as string,
      c as { title: string; is_done: boolean },
    ]),
  );

  const pending = (cards ?? [])
    .filter((card) => {
      if (card.completed_at) return false;
      return !columnById.get(card.column_id as string)?.is_done;
    })
    .map((card) => ({
      title: card.title as string,
      dueDate: card.due_date as string | null,
    }));

  if (pending.length === 0) {
    return NextResponse.json<SmsReminderResult>({
      sent: false,
      reason: `${client.name} no tiene tareas pendientes de su parte.`,
      recipientName: client.name,
      taskCount: 0,
    });
  }

  const boardUrl = `${siteOrigin()}/proyecto/${client.public_token}`;
  const lines = pending
    .slice(0, 5)
    .map(
      (t) => `• ${t.title}${t.dueDate ? ` (vence ${fmtDueDate(t.dueDate)})` : ""}`,
    );
  const extra = pending.length > 5 ? `\n+${pending.length - 5} más` : "";
  const headline =
    pending.length === 1
      ? "Tienes 1 pendiente con nosotros:"
      : `Tienes ${pending.length} pendientes con nosotros:`;

  const smsBody = `C Digital: ${headline}\n${lines.join("\n")}${extra}\n\nVer detalles: ${boardUrl}`;

  const result = await sendSms({ to: client.phone, body: smsBody });
  if (!result.sent) {
    return NextResponse.json<SmsReminderResult>({
      sent: false,
      reason: result.reason,
      recipientName: client.name,
    });
  }

  return NextResponse.json<SmsReminderResult>({
    sent: true,
    recipientName: client.name,
    taskCount: pending.length,
  });
}
