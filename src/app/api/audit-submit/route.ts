import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { AREAS, levelLabels, type Level } from "@/app/form/audit-data";

type Answer = { level: Level; text: string };

interface AuditPayload {
  name: string;
  business: string;
  phone?: string;
  email: string;
  sector?: string;
  selected_areas: string[];
  answers: Record<string, Record<string, Answer>>;
  notes: Record<string, string>;
  priorities: string[];
  scores: Record<string, Level>;
}

const LEVEL_COLOR: Record<Level, string> = {
  green: "#00b37a",
  yellow: "#d49800",
  red: "#cc2222",
};
const LEVEL_BG: Record<Level, string> = {
  green: "#e6f9f3",
  yellow: "#fff8e1",
  red: "#fff0f0",
};

function esc(v: string): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Construye el HTML del correo de notificación de nuevo lead.
function buildEmailHtml(p: AuditPayload): string {
  const areaTitle = (id: string) => AREAS.find((a) => a.id === id)?.title ?? id;

  const rows = p.selected_areas
    .map((id) => {
      const level = p.scores[id] ?? "red";
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#222;">${esc(areaTitle(id))}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">
          <span style="background:${LEVEL_BG[level]};color:${LEVEL_COLOR[level]};font-size:11px;padding:3px 10px;border-radius:99px;">${levelLabels[level]}</span>
        </td>
      </tr>`;
    })
    .join("");

  const prioridades = p.priorities.length
    ? p.priorities.map((id) => esc(areaTitle(id))).join(" → ")
    : "No indicadas";

  const detalle = p.selected_areas
    .map((id) => {
      const area = AREAS.find((a) => a.id === id);
      if (!area) return "";
      const answers = p.answers[id] || {};
      const qs = area.qs
        .map((q, qi) => {
          const ans = answers[qi];
          const lvl = ans?.level ?? "red";
          return `<div style="margin-bottom:8px;">
            <div style="font-size:12px;color:#555;margin-bottom:3px;">${esc(q.text)}</div>
            <div style="font-size:12px;color:#111;padding:6px 10px;border-radius:6px;background:${LEVEL_BG[lvl]};border:1px solid ${LEVEL_COLOR[lvl]}33;">${esc(ans?.text ?? "Sin respuesta")}</div>
          </div>`;
        })
        .join("");
      const nota = (p.notes[id] || "").trim();
      const notaHtml = nota
        ? `<div style="margin-top:8px;font-size:12px;color:#444;"><strong>Apuntes:</strong> ${esc(nota)}</div>`
        : "";
      return `<div style="margin-bottom:20px;">
        <div style="font-size:14px;font-weight:700;color:#0a0a0a;margin-bottom:8px;">${esc(area.title)}</div>
        ${qs}${notaHtml}
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#111;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#0a0a0a;color:#fff;padding:24px;">
        <div style="font-size:20px;font-weight:800;">C Digital<span style="color:#00e5a0;">.</span></div>
        <div style="font-size:13px;color:#00e5a0;margin-top:4px;">Nuevo lead — Auditoría Digital</div>
      </div>
      <div style="padding:24px;">
        <table style="width:100%;font-size:14px;margin-bottom:20px;">
          <tr><td style="padding:4px 0;color:#888;width:120px;">Nombre</td><td style="padding:4px 0;font-weight:600;">${esc(p.name)}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Empresa</td><td style="padding:4px 0;font-weight:600;">${esc(p.business)}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">WhatsApp</td><td style="padding:4px 0;">${esc(p.phone ?? "—")}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Correo</td><td style="padding:4px 0;">${esc(p.email)}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Sector</td><td style="padding:4px 0;">${esc(p.sector ?? "—")}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Prioridades</td><td style="padding:4px 0;">${prioridades}</td></tr>
        </table>
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:8px;">Áreas evaluadas</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">${rows}</table>
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:12px;">Respuestas por área</div>
        ${detalle}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #eee;font-size:11px;color:#aaa;">C Digital · Auditoría Digital Gratuita · estudiocdigital.com</div>
    </div>
  </body></html>`;
}

export async function POST(request: NextRequest) {
  let payload: AuditPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (
    !payload.name?.trim() ||
    !payload.business?.trim() ||
    !payload.email?.trim()
  ) {
    return NextResponse.json(
      { error: "Faltan campos requeridos (nombre, empresa, correo)" },
      { status: 400 },
    );
  }

  // 1) Guardar el lead en Supabase (crítico). Cliente SSR sin sesión → rol
  // anon; la política RLS permite INSERT a anon.
  const supabase = await createClient();

  // Nota: no encadenamos .select() porque el RETURNING requeriría permiso de
  // SELECT, que el rol público no tiene (los leads son privados por RLS).
  const { error: dbError } = await supabase.from("form_submissions").insert({
    name: payload.name.trim(),
    business: payload.business.trim(),
    phone: payload.phone ?? null,
    email: payload.email.trim(),
    sector: payload.sector ?? null,
    selected_areas: payload.selected_areas ?? [],
    answers: payload.answers ?? {},
    notes: payload.notes ?? {},
    priorities: payload.priorities ?? [],
    scores: payload.scores ?? {},
  });

  if (dbError) {
    console.error("Error al guardar el lead en Supabase:", dbError);
    return NextResponse.json(
      { error: "No se pudo guardar el registro" },
      { status: 500 },
    );
  }

  // 2) Notificar por correo (best-effort: si falla, el lead ya quedó guardado).
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
        subject: `Nuevo lead — ${payload.name} (${payload.business})`,
        html: buildEmailHtml(payload),
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

  return NextResponse.json({ success: true }, { status: 200 });
}
