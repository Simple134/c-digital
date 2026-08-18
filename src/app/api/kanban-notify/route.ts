import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import { fmtDueDate } from "@/lib/delivery";
import { siteOrigin } from "@/lib/site";

/**
 * Avisa por correo a quien acaba de recibir una tarea del Kanban.
 *
 *   kind: "assignee" → al miembro del equipo que quedó como responsable.
 *   kind: "client"   → al cliente, cuando la tarjeta pasa a esperar algo suyo.
 *
 * Lo dispara el tablero después de guardar el cambio, nunca antes: el correo es
 * best-effort y jamás debe hacer fallar la escritura en la base de datos.
 *
 * El body solo trae `cardId`: todos los datos del correo se releen en el
 * servidor. Si el cliente pudiera dictar destinatario o texto, este endpoint
 * sería un relay de correo abierto a cualquiera con una sesión.
 */

type NotifyKind = "assignee" | "client";

type NotifyResult = {
  sent: boolean;
  /** Motivo por el que no se envió, para que el tablero lo muestre. */
  reason?: string;
  /** A quién se le avisó, para el mensaje de confirmación. */
  recipientName?: string;
};

function esc(v: string | null | undefined): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildEmailHtml(opts: {
  kind: NotifyKind;
  recipientName: string;
  cardTitle: string;
  description: string | null;
  columnTitle: string;
  priority: string | null;
  dueDate: string | null;
  clientName: string | null;
  boardUrl: string;
}): string {
  const {
    kind,
    recipientName,
    cardTitle,
    description,
    columnTitle,
    priority,
    dueDate,
    clientName,
    boardUrl,
  } = opts;

  const intro =
    kind === "assignee"
      ? "Se te asignó una nueva tarea"
      : "Hay una tarea que necesita algo de tu parte";

  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:4px 0;color:#888;width:150px;">${esc(label)}</td><td style="padding:4px 0;font-weight:600;">${esc(value)}</td></tr>`
      : "";

  const dueBlock = dueDate
    ? `<div style="margin:20px 0;padding:16px;background:#fff8e1;border:1px solid #d4980055;border-radius:8px;">
         <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#8a6d00;margin-bottom:6px;">Fecha límite</div>
         <div style="font-size:16px;font-weight:700;color:#8a6d00;">${esc(fmtDueDate(dueDate))}</div>
       </div>`
    : "";

  const cta =
    kind === "client"
      ? `<a href="${esc(boardUrl)}" style="display:inline-block;background:#0a0a0a;color:#00e5a0;padding:12px 20px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Ver el estado del proyecto</a>`
      : `<a href="${esc(boardUrl)}" style="display:inline-block;background:#0a0a0a;color:#00e5a0;padding:12px 20px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Abrir el tablero</a>`;

  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#0a0a0a;color:#fff;padding:24px;">
        <div style="font-size:20px;font-weight:800;">C Digital<span style="color:#00e5a0;">.</span></div>
        <div style="font-size:13px;color:#00e5a0;margin-top:4px;">${esc(intro)}</div>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;font-size:14px;">Hola ${esc(recipientName)},</p>
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:8px;">Tarea</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:8px;">${esc(cardTitle)}</div>
        ${description ? `<p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.5;">${esc(description)}</p>` : ""}
        ${dueBlock}
        <table style="width:100%;font-size:14px;margin-bottom:20px;">
          ${row("Estado", columnTitle)}
          ${row("Prioridad", priority)}
          ${kind === "assignee" ? row("Cliente", clientName) : ""}
        </table>
        ${cta}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #eee;font-size:11px;color:#aaa;">C Digital · Gestión de proyectos · estudiocdigital.com</div>
    </div>
  </body></html>`;
}

export async function POST(request: NextRequest) {
  // 1) Solo usuarios con sesión. El middleware no cubre /api, así que la
  // verificación va aquí o el endpoint queda abierto.
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

  let body: { cardId?: string; kind?: NotifyKind };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { cardId, kind } = body;
  if (!cardId || (kind !== "assignee" && kind !== "client")) {
    return NextResponse.json(
      { error: "Faltan cardId o kind válido" },
      { status: 400 },
    );
  }

  // 2) Comprobar que este usuario puede ver la tarjeta, con el cliente que sí
  // respeta RLS. Hoy la política de kanban_cards da lectura a todo el rol
  // `authenticated`, así que este chequeo no rechaza a nadie; se deja porque el
  // paso siguiente usa la service role key y bypassa RLS por completo. Si algún
  // día las tarjetas se restringen por equipo o cliente, el endpoint queda
  // correcto sin tocarlo, en vez de convertirse en una fuga silenciosa.
  const { data: visible } = await supabase
    .from("kanban_cards")
    .select("id")
    .eq("id", cardId)
    .maybeSingle();
  if (!visible) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // 3) Releer los datos del correo. Aquí sí con el admin client: hace falta
  // leer `clients` y `team_members` sin depender de las políticas del usuario.
  const admin = createAdminClient();
  const { data: card, error: cardError } = await admin
    .from("kanban_cards")
    .select(
      "id, title, description, priority, due_date, assignee_id, client_id, assigned_to_client, column_id",
    )
    .eq("id", cardId)
    .maybeSingle();

  if (cardError) {
    console.error("[kanban-notify] Error al leer la tarjeta:", cardError);
    return NextResponse.json({ error: "Error de lectura" }, { status: 500 });
  }
  if (!card) {
    return NextResponse.json(
      { error: "Tarjeta no encontrada" },
      { status: 404 },
    );
  }

  const { data: column } = await admin
    .from("kanban_columns")
    .select("title")
    .eq("id", card.column_id)
    .maybeSingle();

  // Origen de configuración, nunca `request.nextUrl.origin`: ese deriva del
  // header Host, que el emisor de la petición controla. Ver src/lib/site.ts.
  const origin = siteOrigin();
  let recipientEmail: string | null = null;
  let recipientName = "";
  let boardUrl = `${origin}/dashboard`;
  let clientName: string | null = null;

  if (card.client_id) {
    const { data: client } = await admin
      .from("clients")
      .select("name, email, public_token")
      .eq("id", card.client_id)
      .maybeSingle();
    clientName = client?.name ?? null;

    if (kind === "client") {
      if (!client) {
        return NextResponse.json<NotifyResult>({
          sent: false,
          reason: "La tarjeta no tiene cliente.",
        });
      }
      recipientEmail = client.email;
      recipientName = client.name;
      // El cliente no entra al dashboard: se le manda a su link público.
      boardUrl = `${origin}/proyecto/${client.public_token}`;
      if (!recipientEmail) {
        return NextResponse.json<NotifyResult>({
          sent: false,
          reason: `${client.name} no tiene correo configurado.`,
          recipientName: client.name,
        });
      }
    }
  } else if (kind === "client") {
    return NextResponse.json<NotifyResult>({
      sent: false,
      reason: "La tarjeta no tiene cliente.",
    });
  }

  if (kind === "assignee") {
    if (!card.assignee_id) {
      return NextResponse.json<NotifyResult>({
        sent: false,
        reason: "La tarjeta no tiene responsable.",
      });
    }
    const { data: member } = await admin
      .from("team_members")
      .select("name, email, auth_user_id")
      .eq("id", card.assignee_id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json<NotifyResult>({
        sent: false,
        reason: "No se encontró el responsable.",
      });
    }
    // Autoasignación: quien está logueado ya sabe que tomó la tarea.
    if (member.auth_user_id && member.auth_user_id === user.id) {
      return NextResponse.json<NotifyResult>({
        sent: false,
        reason: "self",
        recipientName: member.name,
      });
    }
    if (!member.email) {
      return NextResponse.json<NotifyResult>({
        sent: false,
        reason: `${member.name} no tiene correo configurado.`,
        recipientName: member.name,
      });
    }
    recipientEmail = member.email;
    recipientName = member.name;
  }

  const from = process.env.RESEND_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    console.warn(
      "[kanban-notify] Resend no configurado (falta RESEND_API_KEY o RESEND_FROM); se omite el aviso.",
    );
    return NextResponse.json<NotifyResult>({
      sent: false,
      reason: "El servicio de correo no está configurado.",
    });
  }

  // Resend no lanza en los errores de la API: los devuelve en `error`. Sin
  // revisarlo, un remitente inválido o un dominio sin verificar se ve
  // exactamente igual que un envío correcto. Fue justo lo que pasó con
  // RESEND_FROM configurado como dominio suelto en lugar de dirección.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from,
      to: [recipientEmail!],
      subject:
        kind === "assignee"
          ? `Nueva tarea asignada: ${card.title}`
          : `Necesitamos algo de tu parte: ${card.title}`,
      html: buildEmailHtml({
        kind,
        recipientName,
        cardTitle: card.title,
        description: card.description,
        columnTitle: column?.title ?? "",
        priority: card.priority,
        dueDate: card.due_date,
        clientName,
        boardUrl,
      }),
    });
    if (sendError) {
      console.error("[kanban-notify] Resend rechazó el envío:", sendError);
      return NextResponse.json<NotifyResult>({
        sent: false,
        // El mensaje del proveedor se propaga tal cual: es un panel interno y
        // "Invalid `from` field" ahorra horas frente a un "no se pudo enviar".
        reason: `Resend rechazó el envío — ${sendError.message}`,
        recipientName,
      });
    }
  } catch (emailError) {
    console.error("[kanban-notify] Error al enviar con Resend:", emailError);
    return NextResponse.json<NotifyResult>({
      sent: false,
      reason: "El correo no se pudo enviar (fallo de red o de la API).",
      recipientName,
    });
  }

  return NextResponse.json<NotifyResult>({ sent: true, recipientName });
}
