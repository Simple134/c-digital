import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelAuth } from "@/lib/supabase/guards";
import { siteOrigin } from "@/lib/site";

/**
 * Un contacto invita a otra persona a compartir su mismo panel (mismo
 * `client_id`): ambos ven los mismos proyectos, tareas y facturas. La fila en
 * `client_contacts` se crea de una vez (sin auth_user_id); el invitado la
 * reclama al registrarse en /panel/registro con ese correo.
 */
export async function POST(request: NextRequest) {
  const { client, contact, reason } = await getPanelAuth();
  if (!client) {
    return reason === "sin-sesion"
      ? NextResponse.json(
          { error: "Tu sesión expiró. Vuelve a iniciar sesión." },
          { status: 401 },
        )
      : NextResponse.json(
          {
            error:
              "Tu cuenta no está vinculada a ningún cliente. Escríbenos para activarla.",
          },
          { status: 403 },
        );
  }

  let body: { name?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const name = String(body.name ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Completa un nombre y un correo válidos." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("client_contacts")
    .select("id, client_id")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.client_id === client.id
            ? "Ese correo ya tiene acceso a este panel."
            : "Ese correo ya está en uso por otra cuenta.",
      },
      { status: 409 },
    );
  }

  const { data: created, error } = await admin
    .from("client_contacts")
    .insert({
      client_id: client.id,
      name,
      email,
      invited_by: contact.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[panel/contacts] Error al invitar:", error);
    return NextResponse.json(
      { error: "No se pudo crear la invitación." },
      { status: 500 },
    );
  }

  let emailSent = false;
  const from = process.env.RESEND_FROM;
  if (process.env.RESEND_API_KEY && from) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const registerUrl = `${siteOrigin()}/panel/registro?email=${encodeURIComponent(email)}`;
      const { error: sendError } = await resend.emails.send({
        from,
        to: [email],
        subject: `${contact.name} te invitó al panel de ${client.name}`,
        html: buildInviteHtml({
          inviterName: contact.name,
          clientName: client.name,
          registerUrl,
        }),
      });
      emailSent = !sendError;
      if (sendError) {
        console.error("[panel/contacts] Resend rechazó el envío:", sendError);
      }
    } catch (emailError) {
      console.error("[panel/contacts] Error al enviar con Resend:", emailError);
    }
  } else {
    console.warn(
      "[panel/contacts] Resend no configurado (falta RESEND_API_KEY o RESEND_FROM).",
    );
  }

  return NextResponse.json({ ok: true, id: created.id, emailSent });
}

function esc(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildInviteHtml(opts: {
  inviterName: string;
  clientName: string;
  registerUrl: string;
}) {
  const { inviterName, clientName, registerUrl } = opts;
  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#0a0a0a;color:#fff;padding:24px;">
        <div style="font-size:20px;font-weight:800;">C Digital<span style="color:#00e5a0;">.</span></div>
        <div style="font-size:13px;color:#00e5a0;margin-top:4px;">Te invitaron a un panel de cliente</div>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 6px;font-size:14px;">Hola,</p>
        <p style="margin:0 0 18px;font-size:14px;color:#555;line-height:1.5;">
          ${esc(inviterName)} te invitó a compartir el panel de <strong>${esc(clientName)}</strong>:
          desde ahí podrán ver juntos el avance de sus proyectos, tareas y facturas.
          Crea tu cuenta con este mismo correo y la contraseña que elijas:
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
