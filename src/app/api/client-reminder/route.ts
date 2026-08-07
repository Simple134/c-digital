import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDueDate } from "@/lib/delivery";
import { siteOrigin } from "@/lib/site";

/**
 * Recordatorio al cliente con todo lo que está esperando de su parte.
 *
 * A diferencia de /api/kanban-notify, que avisa de UNA tarjeta al momento de
 * asignarla, esto manda un resumen de todas las pendientes. Se dispara a mano
 * desde la ficha del cliente: es un empujón, y quien lo manda decide cuándo.
 *
 * Solo entran las tarjetas con `assigned_to_client = true` que no estén en una
 * columna terminal. Las demás tareas del proyecto son trabajo nuestro y meterlas
 * en un recordatorio diluiría justo lo que se le está pidiendo.
 *
 * El body solo trae `clientId`: destinatario y contenido se releen en el
 * servidor. Si el navegador pudiera dictar el `to`, esto sería un relay de
 * correo abierto a cualquiera con sesión.
 */

type ReminderResult = {
  sent: boolean;
  reason?: string;
  recipientName?: string;
  /** Cuántas tareas se listaron, para la confirmación en el panel. */
  taskCount?: number;
};

function esc(v: string | null | undefined): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildReminderHtml(opts: {
  clientName: string;
  tasks: {
    title: string;
    description: string | null;
    dueDate: string | null;
    columnTitle: string;
  }[];
  boardUrl: string;
}): string {
  const { clientName, tasks, boardUrl } = opts;

  const rows = tasks
    .map(
      (t) => `
      <tr>
        <td style="padding:14px 0;border-top:1px solid #eee;">
          <div style="font-size:15px;font-weight:700;">${esc(t.title)}</div>
          ${t.description ? `<div style="font-size:13px;color:#666;margin-top:4px;line-height:1.5;">${esc(t.description)}</div>` : ""}
          <div style="font-size:12px;color:#888;margin-top:6px;">
            ${esc(t.columnTitle)}${t.dueDate ? ` · <span style="color:#8a6d00;font-weight:700;">Fecha límite: ${esc(fmtDueDate(t.dueDate))}</span>` : ""}
          </div>
        </td>
      </tr>`,
    )
    .join("");

  const count = tasks.length;
  const headline =
    count === 1
      ? "Hay 1 cosa esperando por ti"
      : `Hay ${count} cosas esperando por ti`;

  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#0a0a0a;color:#fff;padding:24px;">
        <div style="font-size:20px;font-weight:800;">C Digital<span style="color:#00e5a0;">.</span></div>
        <div style="font-size:13px;color:#00e5a0;margin-top:4px;">${esc(headline)}</div>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 6px;font-size:14px;">Hola ${esc(clientName)},</p>
        <p style="margin:0 0 18px;font-size:14px;color:#555;line-height:1.5;">
          Para seguir avanzando con tu proyecto necesitamos lo siguiente de tu parte:
        </p>
        <table style="width:100%;">${rows}</table>
        <div style="margin-top:24px;">
          <a href="${esc(boardUrl)}" style="display:inline-block;background:#0a0a0a;color:#00e5a0;padding:12px 20px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Ver el estado del proyecto</a>
        </div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #eee;font-size:11px;color:#aaa;">C Digital · Gestión de proyectos · estudiocdigital.com</div>
    </div>
  </body></html>`;
}

export async function POST(request: NextRequest) {
  // 1) Solo con sesión: el middleware no cubre /api.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

  // 2) Que este usuario pueda ver al cliente, con el cliente que respeta RLS.
  // Hoy la política da acceso a todo el rol `authenticated` y no rechaza a
  // nadie; se deja porque el paso siguiente usa la service role key y bypassa
  // RLS. Si algún día los clientes se reparten por equipo, esto sigue correcto
  // en vez de volverse una fuga.
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
    .select("name, email, public_token")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError) {
    console.error("[client-reminder] Error al leer el cliente:", clientError);
    return NextResponse.json({ error: "Error de lectura" }, { status: 500 });
  }
  if (!client) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 },
    );
  }
  if (!client.email) {
    return NextResponse.json<ReminderResult>({
      sent: false,
      reason: `${client.name} no tiene correo configurado.`,
      recipientName: client.name,
    });
  }

  // 3) Las pendientes del cliente. `completed_at` no basta como filtro: una
  // tarjeta puede estar en una columna terminal sin haberse sellado, así que
  // también se excluyen las columnas `is_done`.
  const [{ data: cards }, { data: columns }] = await Promise.all([
    admin
      .from("kanban_cards")
      .select("title, description, due_date, column_id, completed_at")
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
      description: card.description as string | null,
      dueDate: card.due_date as string | null,
      columnTitle: columnById.get(card.column_id as string)?.title ?? "",
    }));

  if (pending.length === 0) {
    return NextResponse.json<ReminderResult>({
      sent: false,
      reason: `${client.name} no tiene tareas pendientes de su parte.`,
      recipientName: client.name,
      taskCount: 0,
    });
  }

  const from = process.env.RESEND_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    console.warn(
      "[client-reminder] Resend no configurado (falta RESEND_API_KEY o RESEND_FROM).",
    );
    return NextResponse.json<ReminderResult>({
      sent: false,
      reason: "El servicio de correo no está configurado.",
    });
  }

  // Resend devuelve los errores de la API en `error` en vez de lanzarlos: sin
  // revisarlo, un remitente inválido se ve igual que un envío correcto.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from,
      to: [client.email],
      subject:
        pending.length === 1
          ? `Recordatorio: 1 tarea pendiente de tu parte`
          : `Recordatorio: ${pending.length} tareas pendientes de tu parte`,
      html: buildReminderHtml({
        clientName: client.name,
        tasks: pending,
        // El cliente no entra al dashboard: va a su link público. El origen sale
        // de configuración, nunca del header Host. Ver src/lib/site.ts.
        boardUrl: `${siteOrigin()}/proyecto/${client.public_token}`,
      }),
    });
    if (sendError) {
      console.error("[client-reminder] Resend rechazó el envío:", sendError);
      return NextResponse.json<ReminderResult>({
        sent: false,
        reason: `Resend rechazó el envío — ${sendError.message}`,
        recipientName: client.name,
      });
    }
  } catch (emailError) {
    console.error("[client-reminder] Error al enviar con Resend:", emailError);
    return NextResponse.json<ReminderResult>({
      sent: false,
      reason: "El correo no se pudo enviar (fallo de red o de la API).",
      recipientName: client.name,
    });
  }

  return NextResponse.json<ReminderResult>({
    sent: true,
    recipientName: client.name,
    taskCount: pending.length,
  });
}
