import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import {
  createMeetingEvent,
  isGoogleCalendarConfigured,
} from "@/lib/google-calendar";

interface AgendarPayload {
  name: string;
  role?: string;
  email: string;
  phone?: string;
  business?: string;
  sector?: string;
  stage?: string;
  digital?: string[];
  challenge?: string;
  services?: string[];
  budget?: string;
  note?: string;
  // Fecha (YYYY-MM-DD) y hora legible ("10:00 AM") elegidas en el calendario.
  meeting_date?: string;
  meeting_time?: string;
  // Instante de inicio en ISO calculado en el cliente (hora local real).
  meeting_start?: string;
}

function esc(v: string): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Construye el HTML del correo de notificación de nueva reunión agendada.
function buildEmailHtml(p: AgendarPayload, meetLink: string | null): string {
  const row = (label: string, value?: string | null) =>
    value
      ? `<tr><td style="padding:4px 0;color:#888;width:150px;">${esc(label)}</td><td style="padding:4px 0;font-weight:600;">${esc(value)}</td></tr>`
      : "";

  const listRow = (label: string, arr?: string[]) =>
    arr && arr.length ? row(label, arr.join(", ")) : "";

  const fecha =
    p.meeting_date && p.meeting_time
      ? `${p.meeting_date} — ${p.meeting_time}`
      : "No indicada";

  const meetBlock = meetLink
    ? `<div style="margin:20px 0;padding:16px;background:#e6f9f3;border:1px solid #00b37a55;border-radius:8px;">
         <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#00875a;margin-bottom:6px;">Reunión de Google Meet</div>
         <a href="${esc(meetLink)}" style="color:#00875a;font-weight:700;font-size:15px;text-decoration:none;">${esc(meetLink)}</a>
       </div>`
    : `<div style="margin:20px 0;padding:12px;background:#fff8e1;border:1px solid #d4980055;border-radius:8px;font-size:13px;color:#8a6d00;">
         El enlace de Meet no se generó automáticamente (revisa la configuración de Google). Coordina la reunión manualmente.
       </div>`;

  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#0a0a0a;color:#fff;padding:24px;">
        <div style="font-size:20px;font-weight:800;">C Digital<span style="color:#00e5a0;">.</span></div>
        <div style="font-size:13px;color:#00e5a0;margin-top:4px;">Nueva consulta agendada</div>
      </div>
      <div style="padding:24px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:8px;">Fecha solicitada</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:4px;">${esc(fecha)}</div>
        ${meetBlock}
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:8px;">Datos del contacto</div>
        <table style="width:100%;font-size:14px;margin-bottom:20px;">
          ${row("Nombre", p.name)}
          ${row("Cargo / posición", p.role)}
          ${row("Correo", p.email)}
          ${row("WhatsApp", p.phone)}
          ${row("Empresa", p.business)}
          ${row("Sector", p.sector)}
          ${row("Etapa del negocio", p.stage)}
          ${listRow("Presencia digital", p.digital)}
          ${row("Principal desafío", p.challenge)}
          ${listRow("Servicios de interés", p.services)}
          ${row("Presupuesto", p.budget)}
          ${row("Información extra", p.note)}
        </table>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #eee;font-size:11px;color:#aaa;">C Digital · Agendar consulta · estudiocdigital.com</div>
    </div>
  </body></html>`;
}

export async function POST(request: NextRequest) {
  let payload: AgendarPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!payload.name?.trim() || !payload.email?.trim()) {
    return NextResponse.json(
      { error: "Faltan campos requeridos (nombre, correo)" },
      { status: 400 },
    );
  }

  // 1) Crear el evento de Google Meet (best-effort) ANTES de guardar. Así el
  // link y el id del evento se persisten en el mismo INSERT. La política RLS
  // de meeting_requests solo permite INSERT al rol anon (no UPDATE ni SELECT),
  // por lo que un update posterior fallaría en producción.
  let meetLink: string | null = null;
  let calendarEventId: string | null = null;
  const teamEmail =
    process.env.RESEND_TO?.split(",")[0]?.trim() ?? "diazc6001@gmail.com";

  if (payload.meeting_start && isGoogleCalendarConfigured()) {
    try {
      const event = await createMeetingEvent({
        summary: `Consulta C Digital — ${payload.name}${payload.business ? ` (${payload.business})` : ""}`,
        description: [
          `Consulta agendada desde estudiocdigital.com`,
          payload.role ? `Cargo: ${payload.role}` : "",
          payload.sector ? `Sector: ${payload.sector}` : "",
          payload.challenge ? `Desafío: ${payload.challenge}` : "",
          payload.services?.length
            ? `Servicios: ${payload.services.join(", ")}`
            : "",
          payload.budget ? `Presupuesto: ${payload.budget}` : "",
          payload.note ? `Nota: ${payload.note}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        startISO: payload.meeting_start,
        durationMinutes: 30,
        attendees: [payload.email.trim(), teamEmail],
      });
      meetLink = event.meetLink;
      calendarEventId = event.eventId;
    } catch (calErr) {
      console.error("Error al crear el evento de Google Meet:", calErr);
    }
  }

  // 2) Guardar la solicitud en Supabase (crítico). Cliente SSR sin sesión →
  // rol anon; la política RLS permite INSERT público. IMPORTANTE: no encadenar
  // .select()/.single(), porque RETURNING exige política SELECT (solo
  // authenticated) y provocaría un error 42501 de RLS bajo el rol anon.
  const supabase = await createClient();

  const { error: dbError } = await supabase.from("meeting_requests").insert({
    name: payload.name.trim(),
    role: payload.role ?? null,
    email: payload.email.trim(),
    phone: payload.phone ?? null,
    business: payload.business ?? null,
    sector: payload.sector ?? null,
    stage: payload.stage ?? null,
    digital: payload.digital ?? [],
    challenge: payload.challenge ?? null,
    services: payload.services ?? [],
    budget: payload.budget ?? null,
    note: payload.note ?? null,
    meeting_date: payload.meeting_date ?? null,
    meeting_time: payload.meeting_time ?? null,
    meeting_start: payload.meeting_start ?? null,
    meet_link: meetLink,
    calendar_event_id: calendarEventId,
  });

  if (dbError) {
    console.error("Error al guardar la reunión en Supabase:", dbError);
    return NextResponse.json(
      { error: "No se pudo guardar el registro" },
      { status: 500 },
    );
  }

  // 3) Notificar por correo (best-effort).
  const from = process.env.RESEND_FROM;
  const to = (process.env.RESEND_TO ?? "diazc6001@gmail.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (process.env.RESEND_API_KEY && from) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from,
        to,
        subject: `Nueva consulta — ${payload.name}${payload.meeting_date ? ` · ${payload.meeting_date} ${payload.meeting_time ?? ""}` : ""}`,
        html: buildEmailHtml(payload, meetLink),
        replyTo: payload.email,
      });
    } catch (emailError) {
      console.error("Error al enviar el correo con Resend:", emailError);
    }
  } else {
    console.warn(
      "Resend no configurado (falta RESEND_API_KEY o RESEND_FROM); se omite el correo.",
    );
  }

  return NextResponse.json({ success: true, meetLink }, { status: 200 });
}
