import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import { siteOrigin } from "@/lib/site";

/**
 * Invitación al panel de clientes (/panel).
 *
 * Se dispara a mano desde la ficha del cliente en el dashboard. Manda un
 * correo con el enlace a /panel/registro?email=...; el registro en sí valida
 * que el correo exista en `clients`, así que la invitación no crea nada.
 *
 * Igual que /api/client-reminder, el body solo trae `clientId`; destinatario
 * y contenido se releen en el servidor para no ser un relay de correo.
 */

type InviteResult = {
  sent: boolean;
  reason?: string;
  recipientName?: string;
};

function esc(v: string | null | undefined): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildInviteHtml(opts: { clientName: string; registerUrl: string }) {
  const { clientName, registerUrl } = opts;
  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#0a0a0a;color:#fff;padding:24px;">
        <div style="font-size:20px;font-weight:800;">C Digital<span style="color:#00e5a0;">.</span></div>
        <div style="font-size:13px;color:#00e5a0;margin-top:4px;">Tu panel de cliente está listo</div>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 6px;font-size:14px;">Hola ${esc(clientName)},</p>
        <p style="margin:0 0 18px;font-size:14px;color:#555;line-height:1.5;">
          Te habilitamos un panel donde puedes seguir el avance de tu proyecto,
          ver tus facturas y saber qué está pendiente de tu parte.
          Crea tu cuenta con este mismo correo, completando tus datos y la contraseña que elijas:
        </p>
        <div style="margin-top:8px;">
          <a href="${esc(registerUrl)}" style="display:inline-block;background:#0a0a0a;color:#00e5a0;padding:12px 20px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Crear mi cuenta</a>
        </div>
        <p style="margin:18px 0 0;font-size:12px;color:#888;line-height:1.5;">
          Si el botón no funciona, copia este enlace en tu navegador:<br/>
          <span style="color:#555;">${esc(registerUrl)}</span>
        </p>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #eee;font-size:11px;color:#aaa;">C Digital · Panel de clientes · estudiocdigital.com</div>
    </div>
  </body></html>`;
}

export async function POST(request: NextRequest) {
  // Solo con sesión: el middleware no cubre /api.
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

  let body: { clientId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.clientId) {
    return NextResponse.json({ error: "Falta clientId" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("name, email, auth_user_id, active")
    .eq("id", body.clientId)
    .maybeSingle();

  if (clientError) {
    console.error("[panel-invite] Error al leer el cliente:", clientError);
    return NextResponse.json({ error: "Error de lectura" }, { status: 500 });
  }
  if (!client) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 },
    );
  }
  if (!client.email) {
    return NextResponse.json<InviteResult>({
      sent: false,
      reason: `${client.name} no tiene correo configurado.`,
      recipientName: client.name,
    });
  }
  if (!client.active) {
    return NextResponse.json<InviteResult>({
      sent: false,
      reason: `${client.name} está archivado; reactívalo antes de invitarlo.`,
      recipientName: client.name,
    });
  }
  if (client.auth_user_id) {
    return NextResponse.json<InviteResult>({
      sent: false,
      reason: `${client.name} ya tiene cuenta en el panel.`,
      recipientName: client.name,
    });
  }

  const from = process.env.RESEND_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    console.warn(
      "[panel-invite] Resend no configurado (falta RESEND_API_KEY o RESEND_FROM).",
    );
    return NextResponse.json<InviteResult>({
      sent: false,
      reason: "El servicio de correo no está configurado.",
    });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const registerUrl = `${siteOrigin()}/panel/registro?email=${encodeURIComponent(
      client.email,
    )}`;
    const { error: sendError } = await resend.emails.send({
      from,
      to: [client.email],
      subject: "Tu acceso al panel de C Digital",
      html: buildInviteHtml({
        clientName: client.name,
        registerUrl,
      }),
    });
    if (sendError) {
      console.error("[panel-invite] Resend rechazó el envío:", sendError);
      return NextResponse.json<InviteResult>({
        sent: false,
        reason: `Resend rechazó el envío — ${sendError.message}`,
        recipientName: client.name,
      });
    }
  } catch (emailError) {
    console.error("[panel-invite] Error al enviar con Resend:", emailError);
    return NextResponse.json<InviteResult>({
      sent: false,
      reason: "El correo no se pudo enviar (fallo de red o de la API).",
      recipientName: client.name,
    });
  }

  return NextResponse.json<InviteResult>({
    sent: true,
    recipientName: client.name,
  });
}
