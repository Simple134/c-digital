"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import {
  AREAS,
  ICONS,
  SECTORS,
  WHATSAPP_NUMBER,
  calcScore,
  formatPhone,
  levelLabels,
  levelPct,
  levelOrder,
  type Level,
} from "./audit-data";
import { AUDIT_CSS } from "./audit-styles";

// Fuentes del diseño cargadas con next/font (evita CLS y bloqueo de red del CDN).
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});
const inter = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jetmono = JetBrains_Mono({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-jet",
  display: "swap",
});

type Answer = { level: Level; text: string };
type Answers = Record<string, Record<number, Answer>>;

const STEP_LABELS = [
  "01 · Áreas",
  "02 · Preguntas",
  "03 · Tus datos",
  "04 · Diagnóstico",
];
const PROGRESS = [0, 33, 66, 100];

// Escapa valores del usuario antes de interpolarlos en el HTML del PDF.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Renderiza un icono SVG (string estático de nuestros datos, sin entrada de usuario).
function renderIcon(id: string, inlineStyle?: string) {
  const svg = inlineStyle
    ? ICONS[id].replace("<svg", `<svg style="${inlineStyle}"`)
    : ICONS[id];
  return (
    <span
      style={{ display: "inline-flex" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function AuditForm() {
  const [step, setStep] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [lead, setLead] = useState({
    name: "",
    biz: "",
    phone: "",
    email: "",
    sector: "",
  });
  const [priorities, setPriorities] = useState<string[]>([]);
  const [warn, setWarn] = useState({
    select: false,
    questions: false,
    lead: false,
  });
  const [modalArea, setModalArea] = useState<string | null>(null);
  const [barsReady, setBarsReady] = useState(false);
  // Evita registrar el lead más de una vez por sesión (navegación atrás/adelante).
  const submittedRef = useRef(false);

  const levelOf = (id: string): Level => calcScore(answers[id] || {});

  // Cerrar modal con Escape + bloquear scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!modalArea) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalArea(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [modalArea]);

  // Animación de las barras de score al entrar al diagnóstico.
  useEffect(() => {
    if (step !== 3) return;
    setBarsReady(false);
    const t = setTimeout(() => setBarsReady(true), 100);
    return () => clearTimeout(t);
  }, [step]);

  const goTo = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleArea = (id: string) => {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const goToQuestions = () => {
    if (!selectedAreas.length) {
      setWarn((w) => ({ ...w, select: true }));
      return;
    }
    setWarn((w) => ({ ...w, select: false }));
    goTo(1);
  };

  const selectOpt = (areaId: string, qi: number, opt: Answer) => {
    setAnswers((prev) => ({
      ...prev,
      [areaId]: { ...(prev[areaId] || {}), [qi]: opt },
    }));
  };

  const allAnswered = () =>
    selectedAreas.every((id) => {
      const area = AREAS.find((a) => a.id === id)!;
      return area.qs.every((_, i) => answers[id]?.[i]);
    });

  const goToLead = () => {
    if (!allAnswered()) {
      setWarn((w) => ({ ...w, questions: true }));
      return;
    }
    setWarn((w) => ({ ...w, questions: false }));
    goTo(2);
  };

  const generateDiag = () => {
    const { name, biz, phone, email, sector } = lead;
    if (
      !name.trim() ||
      !biz.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !sector
    ) {
      setWarn((w) => ({ ...w, lead: true }));
      return;
    }
    setWarn((w) => ({ ...w, lead: false }));
    setPriorities([]);
    goTo(3);

    // Registrar el lead en Supabase + notificar por correo (una sola vez).
    // Las prioridades se eligen en este paso, después de generar, por lo que
    // no forman parte del registro inicial.
    if (submittedRef.current) return;
    submittedRef.current = true;
    const scores: Record<string, Level> = {};
    selectedAreas.forEach((id) => {
      scores[id] = levelOf(id);
    });
    fetch("/api/audit-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        business: lead.biz,
        phone: lead.phone,
        email: lead.email,
        sector: lead.sector,
        selected_areas: selectedAreas,
        answers,
        notes,
        priorities: [],
        scores,
      }),
    }).catch((err) => console.error("Error al registrar la auditoría:", err));
  };

  const togglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const sortedAreas = [...selectedAreas].sort(
    (a, b) => levelOrder[levelOf(a)] - levelOrder[levelOf(b)],
  );

  const priorityNames = priorities.map(
    (id) => AREAS.find((a) => a.id === id)!.title,
  );

  const waMessage = `Saludos, soy ${lead.name} y busco una propuesta basado en mi diagnóstico digital.`;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  // ── PDF imprimible (misma estructura del prototipo, leyendo del estado) ──
  const printDiag = () => {
    const name = escapeHtml(lead.name);
    const biz = escapeHtml(lead.biz);
    const phone = escapeHtml(lead.phone);
    const email = escapeHtml(lead.email);
    const sector = escapeHtml(lead.sector);
    const date = new Date().toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const levelLabelsL = {
      green: "Sólido",
      yellow: "En desarrollo",
      red: "Crítico",
    };
    const levelColors = { green: "#00b37a", yellow: "#d49800", red: "#cc2222" };
    const levelBg = { green: "#e6f9f3", yellow: "#fff8e1", red: "#fff0f0" };
    const levelBorder = {
      green: "#00b37a40",
      yellow: "#d4980040",
      red: "#cc222240",
    };

    let areasHtml = "";
    sortedAreas.forEach((id) => {
      const area = AREAS.find((a) => a.id === id)!;
      const level = levelOf(id);
      const rec = area.recs[level];
      const col = levelColors[level];
      const bg = levelBg[level];

      let qHtml = "";
      area.qs.forEach((q, qi) => {
        const ans = answers[id]?.[qi];
        const ansLevel = ans ? ans.level : "red";
        const ansText = ans ? ans.text : "Sin respuesta";
        qHtml += `
          <div style="margin-bottom:10px;">
            <div style="font-size:10px;color:#888;margin-bottom:3px;font-family:monospace;letter-spacing:.04em;">P${qi + 1}</div>
            <div style="font-size:12px;color:#444;margin-bottom:6px;line-height:1.5;">${q.text}</div>
            <div style="background:${levelBg[ansLevel]};border:1px solid ${levelBorder[ansLevel]};border-radius:6px;padding:8px 10px;font-size:12px;color:#222;display:flex;gap:8px;align-items:flex-start;line-height:1.4;">
              <span style="width:8px;height:8px;border-radius:50%;background:${levelColors[ansLevel]};flex-shrink:0;margin-top:3px;display:inline-block;"></span>
              <span>${ansText}</span>
            </div>
          </div>`;
      });

      const notesVal = escapeHtml((notes[id] || "").trim());
      const notesBlock = notesVal
        ? `
        <div style="margin-top:14px;padding-top:14px;border-top:1px dashed #e0e0e0;">
          <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:6px;">Apuntes adicionales</div>
          <div style="font-size:12px;color:#444;line-height:1.7;background:#fafafa;border:1px solid #eee;border-radius:6px;padding:10px 12px;white-space:pre-wrap;">${notesVal}</div>
        </div>`
        : "";

      const tagsHtml = rec.tags
        .map(
          (t) =>
            `<span style="font-size:10px;padding:3px 8px;border-radius:99px;background:#f0f0f0;border:1px solid #ddd;color:#555;margin:2px;display:inline-block;">${t}</span>`,
        )
        .join("");

      areasHtml += `
        <div style="border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;margin-bottom:20px;page-break-inside:avoid;">
          <div style="background:${bg};border-bottom:2px solid ${col};padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:28px;height:28px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${ICONS[id].replace("<svg", `<svg style="width:16px;height:16px;stroke:${col};stroke-width:1.5;fill:none"`)}</span>
              <div>
                <div style="font-size:16px;font-weight:700;color:#111;font-family:'Helvetica Neue',sans-serif;">${area.title}</div>
                <div style="font-size:11px;color:#666;">${area.short}</div>
              </div>
            </div>
            <div style="background:${col};color:#fff;font-size:10px;font-weight:600;padding:4px 12px;border-radius:99px;letter-spacing:.05em;font-family:monospace;">
              ${levelLabelsL[level].toUpperCase()}
            </div>
          </div>
          <div style="padding:16px 18px;">
            <div style="margin-bottom:14px;">
              <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:6px;">Diagnóstico</div>
              <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:4px;">${rec.title}</div>
              <div style="font-size:12px;color:#555;line-height:1.6;">${rec.text}</div>
              <div style="margin-top:8px;">${tagsHtml}</div>
            </div>
            <div style="border-top:1px solid #eee;margin:14px 0;"></div>
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:10px;">Respuestas</div>
            ${qHtml}
            ${notesBlock}
          </div>
        </div>`;
    });

    let prioHtml = "";
    if (priorityNames.length) {
      const steps = priorityNames
        .map(
          (n, i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <div style="width:24px;height:24px;border-radius:50%;background:#0a0a0a;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
          <div style="font-size:13px;color:#222;">${n}</div>
        </div>`,
        )
        .join("");
      prioHtml = `
        <div style="border:1px solid #e0e0e0;border-radius:10px;padding:16px 18px;margin-bottom:20px;page-break-inside:avoid;">
          <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:12px;">Prioridades elegidas por el cliente</div>
          ${steps}
        </div>`;
    }

    const summaryRows = sortedAreas
      .map((id) => {
        const area = AREAS.find((a) => a.id === id)!;
        const level = levelOf(id);
        return `<tr>
        <td style="padding:8px 12px;font-size:13px;color:#222;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:6px;">${ICONS[id].replace("<svg", `<svg style="width:14px;height:14px;stroke:#333;stroke-width:1.5;fill:none;flex-shrink:0"`)} ${area.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
          <span style="background:${levelBg[level]};color:${levelColors[level]};border:1px solid ${levelBorder[level]};font-size:10px;padding:3px 9px;border-radius:99px;font-family:monospace;letter-spacing:.05em;">${levelLabelsL[level].toUpperCase()}</span>
        </td>
        <td style="padding:8px 12px;font-size:12px;color:#555;border-bottom:1px solid #f0f0f0;">${area.recs[level].title}</td>
      </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Diagnóstico Digital — ${name} · C Digital</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:13px; color:#111; background:#fff; }
  @page { size:A4; margin:18mm 16mm; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div style="border-bottom:3px solid #0a0a0a;padding-bottom:20px;margin-bottom:24px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="font-size:28px;font-weight:900;letter-spacing:-.5px;color:#0a0a0a;line-height:1;">C Digital<span style="color:#00b37a;">.</span></div>
      <div style="font-size:10px;color:#888;margin-top:4px;font-family:monospace;letter-spacing:.08em;text-transform:uppercase;">Auditoría Digital — Diagnóstico de Resultados</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:10px;color:#888;font-family:monospace;">${date}</div>
      <div style="font-size:10px;color:#888;font-family:monospace;margin-top:2px;">estudiocdigital.com</div>
    </div>
  </div>
</div>
<div style="background:#f8f8f8;border-radius:10px;padding:16px 18px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
  <div>
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:3px;">Nombre</div>
    <div style="font-size:15px;font-weight:700;color:#0a0a0a;">${name}</div>
  </div>
  <div>
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:3px;">Empresa</div>
    <div style="font-size:15px;font-weight:700;color:#0a0a0a;">${biz}</div>
  </div>
  <div>
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:3px;">Sector</div>
    <div style="font-size:13px;color:#333;">${sector}</div>
  </div>
  <div>
    <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:3px;">Contacto</div>
    <div style="font-size:13px;color:#333;">${phone} · ${email}</div>
  </div>
</div>
<div style="margin-bottom:24px;page-break-inside:avoid;">
  <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:10px;">Resumen de áreas evaluadas</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#0a0a0a;">
        <th style="padding:10px 12px;text-align:left;font-size:10px;color:#fff;letter-spacing:.06em;font-family:monospace;font-weight:600;">ÁREA</th>
        <th style="padding:10px 12px;text-align:left;font-size:10px;color:#fff;letter-spacing:.06em;font-family:monospace;font-weight:600;">ESTADO</th>
        <th style="padding:10px 12px;text-align:left;font-size:10px;color:#fff;letter-spacing:.06em;font-family:monospace;font-weight:600;">DIAGNÓSTICO</th>
      </tr>
    </thead>
    <tbody>${summaryRows}</tbody>
  </table>
</div>
${prioHtml}
<div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;font-family:monospace;margin-bottom:14px;">Detalle por área — respuestas y acciones recomendadas</div>
${areasHtml}
<div style="border-top:1px solid #e0e0e0;margin-top:30px;padding-top:14px;display:flex;justify-content:space-between;align-items:center;">
  <div style="font-size:10px;color:#aaa;font-family:monospace;">C Digital · estudiocdigital.com · Auditoría Digital Gratuita</div>
  <div style="font-size:10px;color:#aaa;font-family:monospace;">Este diagnóstico es confidencial y de uso exclusivo del cliente.</div>
</div>
</body>
</html>`;

    // Imprimir desde un iframe oculto: el cliente solo ve el diálogo nativo
    // del navegador, nunca una pestaña intermedia con el HTML.
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.srcdoc = html;

    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) {
        iframe.remove();
        return;
      }
      // Retirar el iframe una vez que se cierra el diálogo de impresión.
      win.addEventListener("afterprint", () => iframe.remove());
      win.focus();
      win.print();
      // Respaldo por si el navegador no dispara "afterprint".
      setTimeout(() => {
        if (document.body.contains(iframe)) iframe.remove();
      }, 60000);
    };

    document.body.appendChild(iframe);
  };

  const modalAreaData = modalArea
    ? AREAS.find((a) => a.id === modalArea)!
    : null;

  return (
    <div
      className={`audit ${bebas.variable} ${inter.variable} ${jetmono.variable}`}
    >
      <style dangerouslySetInnerHTML={{ __html: AUDIT_CSS }} />

      {/* MODAL RESPUESTAS */}
      {modalAreaData && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalArea(null);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {modalAreaData.title} — Mis respuestas
              </div>
              <button
                className="modal-close"
                onClick={() => setModalArea(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {modalAreaData.qs.map((q, qi) => {
                const ans = answers[modalAreaData.id]?.[qi];
                const ansLevel = ans ? ans.level : "red";
                const ansText = ans ? ans.text : "Sin respuesta";
                return (
                  <div className="modal-q" key={qi}>
                    <div className="modal-q-num">Pregunta {qi + 1}</div>
                    <div className="modal-q-text">{q.text}</div>
                    <div className={`modal-answer level-${ansLevel}`}>
                      <div className="modal-dot" />
                      <span>{ansText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="wrap">
        <div className="logo">
          C Digital<span>.</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${PROGRESS[step]}%` }}
          />
        </div>
        <div className="steps-nav">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={`step-pill${i === step ? " active" : i < step ? " done" : ""}`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* STEP 0 — ÁREAS */}
        {step === 0 && (
          <div className="step-section">
            <div className="header">
              <div className="tag">Auditoría Digital Gratuita</div>
              <h1>
                ¿Dónde está
                <br />
                <em>el punto</em>
                <br />
                de quiebre?
              </h1>
              <p>
                Selecciona una o varias áreas que mejor describan lo que está
                pasando en tu negocio ahora mismo. Seremos honestos sobre qué
                necesitas.
              </p>
            </div>
            <div className="selector-grid">
              {AREAS.map((area) => (
                <div
                  key={area.id}
                  className={`obj-card${selectedAreas.includes(area.id) ? " selected" : ""}`}
                  onClick={() => toggleArea(area.id)}
                >
                  <div className="obj-icon">{renderIcon(area.id)}</div>
                  <div className="obj-info">
                    <div className="obj-title">
                      {area.title}
                      {area.featured && (
                        <span
                          style={{
                            fontSize: "9px",
                            background: "#00e5a015",
                            color: "#00e5a0",
                            border: "1px solid #00e5a030",
                            padding: "2px 6px",
                            borderRadius: "2px",
                            fontFamily: "var(--font-jet), monospace",
                            letterSpacing: ".06em",
                            verticalAlign: "middle",
                            marginLeft: "6px",
                          }}
                        >
                          SISTEMA
                        </span>
                      )}
                    </div>
                    <div className="obj-short">{area.short}</div>
                  </div>
                  <div className="obj-check" />
                </div>
              ))}
            </div>
            {warn.select && (
              <p className="warn">
                Selecciona al menos un área para continuar.
              </p>
            )}
            <div className="btn-row">
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Selecciona una o más áreas
              </span>
              <button className="btn btn-primary" onClick={goToQuestions}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 — PREGUNTAS */}
        {step === 1 && (
          <div className="step-section">
            <div className="header">
              <div className="tag">Evaluación por área</div>
              <h1>
                Sé <em>honesto</em>
                <br />
                contigo mismo
              </h1>
              <p>
                No hay respuestas correctas. Este diagnóstico solo es útil si
                refleja la realidad de tu negocio.
              </p>
            </div>
            <div>
              {selectedAreas.map((id) => {
                const area = AREAS.find((a) => a.id === id)!;
                return (
                  <div className="area-block" key={id}>
                    <div className="area-header">
                      <div className="area-icon">{renderIcon(id)}</div>
                      <div>
                        <div className="area-name">{area.title}</div>
                        <div className="area-desc">{area.short}</div>
                      </div>
                    </div>
                    {area.qs.map((q, qi) => (
                      <div className="question" key={qi}>
                        <div className="question-num">
                          Pregunta {qi + 1} de {area.qs.length}
                        </div>
                        <div className="question-text">{q.text}</div>
                        <div className="options">
                          {q.opts.map((o, oi) => {
                            const isSel = answers[id]?.[qi]?.text === o.text;
                            return (
                              <div
                                key={oi}
                                className={`option${isSel ? " selected-opt" : ""}`}
                                onClick={() =>
                                  selectOpt(id, qi, {
                                    level: o.level,
                                    text: o.text,
                                  })
                                }
                              >
                                <div className="option-radio" />
                                {o.text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="notes-block">
                      <div className="notes-label">
                        {renderIcon(
                          "pencil",
                          "width:13px;height:13px;stroke:var(--text-3);stroke-width:1.5;fill:none",
                        )}
                        Apuntes adicionales sobre {area.title}
                      </div>
                      <textarea
                        className="notes-input"
                        value={notes[id] || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [id]: e.target.value,
                          }))
                        }
                        placeholder="Agrega cualquier contexto extra que consideres importante sobre esta área. Por ejemplo: situaciones específicas, intentos anteriores, o detalles que no cubre ninguna pregunta…"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {warn.questions && (
              <p className="warn">
                Responde todas las preguntas para continuar.
              </p>
            )}
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => goTo(0)}>
                ← Atrás
              </button>
              <button className="btn btn-primary" onClick={goToLead}>
                Ver mi diagnóstico →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — DATOS DEL LEAD */}
        {step === 2 && (
          <div className="step-section">
            <div className="header">
              <div className="tag">Casi listo</div>
              <h1>
                ¿A quién le
                <br />
                enviamos el
                <br />
                <em>resultado?</em>
              </h1>
              <p>
                Tu diagnóstico es gratuito. Un estratega de C Digital lo
                revisará y te contactará para profundizar en las áreas críticas.
              </p>
            </div>
            <div className="lead-form">
              <div className="form-row">
                <div className="field">
                  <label>Tu nombre</label>
                  <input
                    name="Name"
                    type="text"
                    placeholder="Nombre completo"
                    value={lead.name}
                    onChange={(e) =>
                      setLead((l) => ({ ...l, name: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Negocio / Empresa</label>
                  <input
                    type="text"
                    placeholder="¿Cómo se llama?"
                    value={lead.biz}
                    onChange={(e) =>
                      setLead((l) => ({ ...l, biz: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>WhatsApp</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="829-000-0000"
                    value={lead.phone}
                    onChange={(e) =>
                      setLead((l) => ({
                        ...l,
                        phone: formatPhone(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={lead.email}
                    onChange={(e) =>
                      setLead((l) => ({ ...l, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label>¿En qué sector opera tu negocio?</label>
                <select
                  value={lead.sector}
                  onChange={(e) =>
                    setLead((l) => ({ ...l, sector: e.target.value }))
                  }
                >
                  <option value="">Selecciona uno</option>
                  {SECTORS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            {warn.lead && (
              <p className="warn">Completa todos los campos para continuar.</p>
            )}
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => goTo(1)}>
                ← Atrás
              </button>
              <button className="btn btn-primary" onClick={generateDiag}>
                Generar diagnóstico →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — DIAGNÓSTICO */}
        {step === 3 && (
          <div className="step-section">
            <div className="diag-header">
              <div className="tag">Diagnóstico completado</div>
              <h2>
                Tu diagnóstico,
                <br />
                <em className="diag-name">{lead.name}</em>
              </h2>
              <p
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                {lead.biz}
                {lead.sector ? ` · ${lead.sector}` : ""}
              </p>
            </div>

            <div className="score-grid">
              {sortedAreas.map((id) => {
                const area = AREAS.find((a) => a.id === id)!;
                const level = levelOf(id);
                return (
                  <div
                    className={`score-card level-${level}`}
                    key={id}
                    title="Ver mis respuestas"
                  >
                    <div className="score-top">
                      <div
                        className="score-area-name"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {renderIcon(
                          id,
                          "width:16px;height:16px;stroke:var(--text-2);stroke-width:1.5;fill:none",
                        )}
                        {area.title}
                      </div>
                      <div className="score-badge">{levelLabels[level]}</div>
                    </div>
                    <div className="score-bar-wrap">
                      <div
                        className="score-bar-fill"
                        style={{
                          width: barsReady ? `${levelPct[level]}%` : "0%",
                        }}
                      />
                    </div>
                    <div className="score-desc">{area.recs[level].title}</div>
                    <button
                      className="view-answers-btn"
                      onClick={() => setModalArea(id)}
                    >
                      ▸ Ver mis respuestas
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="rec-section">
              <div className="rec-section-title">Qué hacer en cada área</div>
              <div>
                {sortedAreas.map((id) => {
                  const area = AREAS.find((a) => a.id === id)!;
                  const level = levelOf(id);
                  const rec = area.recs[level];
                  return (
                    <div className={`rec-card level-${level}`} key={id}>
                      <div className="rec-icon-wrap">{renderIcon(id)}</div>
                      <div className="rec-body">
                        <div className="rec-area">
                          {area.title} · {levelLabels[level]}
                        </div>
                        <div className="rec-title">{rec.title}</div>
                        <div className="rec-text">{rec.text}</div>
                        <div className="rec-actions">
                          {rec.tags.map((t) => (
                            <span className="rec-tag" key={t}>
                              {t}
                            </span>
                          ))}
                        </div>
                        <button
                          className="view-answers-btn"
                          style={{ marginTop: "12px" }}
                          onClick={() => setModalArea(id)}
                        >
                          ▸ Ver mis respuestas en {area.title}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRIORIDAD */}
            <div className="priority-section">
              <div className="priority-title">
                ¿Por dónde quieres{" "}
                <em
                  style={{
                    fontStyle: "normal",
                    background:
                      "linear-gradient(90deg,var(--accent),var(--accent2))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  empezar?
                </em>
              </div>
              <div className="priority-subtitle">
                Elige el área o las áreas que quieres atacar primero. Esto le
                ayudará a nuestro equipo a preparar una propuesta personalizada
                para tu primera reunión.
              </div>
              <div className="priority-grid">
                {sortedAreas.map((id) => {
                  const area = AREAS.find((a) => a.id === id)!;
                  const level = levelOf(id);
                  const prioIdx = priorities.indexOf(id);
                  return (
                    <div
                      key={id}
                      className={`priority-card${prioIdx !== -1 ? " prio-selected" : ""}`}
                      onClick={() => togglePriority(id)}
                    >
                      <div className="prio-num">
                        {prioIdx !== -1 ? prioIdx + 1 : "—"}
                      </div>
                      <div className="prio-icon">
                        {renderIcon(
                          id,
                          "width:16px;height:16px;stroke:var(--text-2);stroke-width:1.5;fill:none",
                        )}
                      </div>
                      <div className="prio-info">
                        <div className="prio-name">{area.title}</div>
                        <div className="prio-short">{area.short}</div>
                      </div>
                      <div className={`prio-level prio-${level}`}>
                        {levelLabels[level]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="prio-hint">Puedes seleccionar más de una</div>
            </div>

            <div className="cta-final">
              <h3>El siguiente paso es tuyo</h3>
              <p>
                Tu diagnóstico ya está en manos de nuestro equipo. En menos de
                24 horas un estratega de C Digital te contactará para construir
                juntos el plan de acción.
              </p>
              {priorityNames.length > 0 && (
                <div className="cta-priority-summary">
                  <strong>Prioridades seleccionadas:</strong>{" "}
                  {priorityNames.join(" → ")}. Le haremos saber a nuestro equipo
                  para preparar la propuesta enfocada en estas áreas.
                </div>
              )}
              <div className="cta-buttons">
                <a
                  className="wa-btn"
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Solicitar propuesta
                </a>
                <button className="btn btn-ghost" onClick={printDiag}>
                  ⬇ Descargar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
