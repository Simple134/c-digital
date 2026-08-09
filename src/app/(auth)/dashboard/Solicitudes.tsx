"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { fmtDateTime } from "@/lib/format";
import type { createClient } from "@/lib/supabase/client";
import type {
  FormSubmission,
  MeetingRequest,
  FormSubmissionStatus,
  AuditLevel,
} from "@/lib/supabase/types";
import { AREAS, levelLabels } from "@/app/form/audit-data";
import useIsMobile from "./useIsMobile";

type Supabase = ReturnType<typeof createClient>;

// Une los dos orígenes de solicitudes en un solo tipo etiquetado para
// mostrarlos en una sola lista, distinguidos por la etiqueta `kind`.
type Row =
  ({ kind: "audit" } & FormSubmission) | ({ kind: "meeting" } & MeetingRequest);

const KIND_META = {
  audit: { label: "Auditoría", color: "#5a8cff" },
  meeting: { label: "Reunión", color: "#00e5a0" },
};

const STATUSES: {
  value: FormSubmissionStatus;
  label: string;
  color: string;
}[] = [
  { value: "nuevo", label: "Nuevo", color: "#5aa9ff" },
  { value: "contactado", label: "Contactado", color: "#00d9ff" },
  { value: "en_seguimiento", label: "En seguimiento", color: "#e6b800" },
  { value: "cerrado", label: "Cerrado", color: "#00e5a0" },
  { value: "descartado", label: "Descartado", color: "#888" },
];

const LEVEL_COLOR: Record<AuditLevel, string> = {
  green: "#00e5a0",
  yellow: "#e6b800",
  red: "#ff8080",
};

const areaTitle = (id: string) => AREAS.find((a) => a.id === id)?.title ?? id;

// Enlace de WhatsApp: usa los dígitos del teléfono (RD = código país 1).
function waLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const full = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${full}`;
}

const tableFor = (kind: Row["kind"]) =>
  kind === "audit" ? "form_submissions" : "meeting_requests";

export default function Solicitudes({ supabase }: { supabase: Supabase }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FormSubmissionStatus | "todos">("todos");
  const [kindFilter, setKindFilter] = useState<Row["kind"] | "todos">("todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [audits, meetings] = await Promise.all([
      supabase
        .from("form_submissions")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("meeting_requests")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (audits.error) setError(audits.error.message);
    else if (meetings.error) setError(meetings.error.message);

    const merged: Row[] = [
      ...((audits.data as FormSubmission[]) ?? []).map((r): Row => ({
        kind: "audit",
        ...r,
      })),
      ...((meetings.data as MeetingRequest[]) ?? []).map((r): Row => ({
        kind: "meeting",
        ...r,
      })),
    ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    setRows(merged);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(row: Row, status: FormSubmissionStatus) {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status } : r)),
    );
    const { error } = await supabase
      .from(tableFor(row.kind))
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) {
      alert("Error al actualizar el estado: " + error.message);
      load();
    }
  }

  async function saveNotes(row: Row, admin_notes: string) {
    const { error } = await supabase
      .from(tableFor(row.kind))
      .update({ admin_notes, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) {
      alert("Error al guardar la nota: " + error.message);
      return false;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, admin_notes } : r)),
    );
    return true;
  }

  async function remove(row: Row) {
    if (!confirm("¿Eliminar este registro? Esta acción no se puede deshacer."))
      return;
    const { error } = await supabase
      .from(tableFor(row.kind))
      .delete()
      .eq("id", row.id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  const visible = rows
    .filter((r) => filter === "todos" || r.status === filter)
    .filter((r) => kindFilter === "todos" || r.kind === kindFilter);

  const counts = STATUSES.map((s) => ({
    ...s,
    count: rows.filter((r) => r.status === s.value).length,
  }));

  return (
    <div>
      {/* Filtro por origen */}
      <div style={styles.filters}>
        {(["todos", "audit", "meeting"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            style={{
              ...styles.filterChip,
              ...(isMobile ? styles.touchChip : {}),
              ...(kindFilter === k ? styles.filterChipActive : {}),
            }}
          >
            {k === "todos"
              ? `Todos (${rows.length})`
              : `${KIND_META[k].label} (${rows.filter((r) => r.kind === k).length})`}
          </button>
        ))}
      </div>

      {/* Filtros por estado */}
      <div style={styles.filters}>
        <button
          onClick={() => setFilter("todos")}
          style={{
            ...styles.filterChip,
            ...(isMobile ? styles.touchChip : {}),
            ...(filter === "todos" ? styles.filterChipActive : {}),
          }}
        >
          Todos los estados ({rows.length})
        </button>
        {counts.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            style={{
              ...styles.filterChip,
              ...(isMobile ? styles.touchChip : {}),
              ...(filter === s.value
                ? {
                    ...styles.filterChipActive,
                    borderColor: s.color,
                    color: s.color,
                  }
                : {}),
            }}
          >
            <span style={{ ...styles.dot, background: s.color }} />
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {error && <p style={styles.errorBox}>{error}</p>}

      {loading ? (
        <p style={{ color: "#888" }}>Cargando…</p>
      ) : visible.length === 0 ? (
        <p style={{ color: "#666" }}>No hay registros en esta vista.</p>
      ) : (
        <div style={styles.list}>
          {visible.map((row) => (
            <RequestCard
              key={`${row.kind}-${row.id}`}
              row={row}
              expanded={expanded === row.id}
              onToggle={() =>
                setExpanded((e) => (e === row.id ? null : row.id))
              }
              onStatus={(s) => updateStatus(row, s)}
              onSaveNotes={(n) => saveNotes(row, n)}
              onDelete={() => remove(row)}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Request card ---------------- */

function RequestCard({
  row,
  expanded,
  onToggle,
  onStatus,
  onSaveNotes,
  onDelete,
  isMobile,
}: {
  row: Row;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: FormSubmissionStatus) => void;
  onSaveNotes: (n: string) => Promise<boolean>;
  onDelete: () => void;
  isMobile: boolean;
}) {
  const [noteDraft, setNoteDraft] = useState(row.admin_notes ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const statusMeta =
    STATUSES.find((s) => s.value === row.status) ?? STATUSES[0];
  const kindMeta = KIND_META[row.kind];
  const wa = waLink(row.phone);

  async function handleSaveNote() {
    setSavingNote(true);
    const ok = await onSaveNotes(noteDraft);
    setSavingNote(false);
    if (ok) {
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  }

  const meetingLabel =
    row.kind === "meeting"
      ? row.meeting_date && row.meeting_time
        ? `${row.meeting_date} · ${row.meeting_time}`
        : (row.meeting_date ?? "Sin fecha")
      : null;

  const meetingDetailPairs: [string, string | null][] =
    row.kind === "meeting"
      ? [
          ["Cargo / posición", row.role],
          ["Sector", row.sector],
          ["Etapa del negocio", row.stage],
          [
            "Presencia digital",
            row.digital?.length ? row.digital.join(", ") : null,
          ],
          ["Principal desafío", row.challenge],
          [
            "Servicios de interés",
            row.services?.length ? row.services.join(", ") : null,
          ],
          ["Presupuesto", row.budget],
          ["Información extra", row.note],
        ]
      : [];

  return (
    <div style={{ ...styles.card, padding: isMobile ? 14 : 20 }}>
      <div
        style={{
          ...styles.cardTop,
          ...(isMobile ? { flexDirection: "column", gap: 6 } : null),
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>{row.name}</span>
            <span
              style={{
                ...styles.kindBadge,
                color: kindMeta.color,
                borderColor: kindMeta.color + "55",
                background: kindMeta.color + "18",
              }}
            >
              {kindMeta.label}
            </span>
            <span
              style={{
                ...styles.statusBadge,
                color: statusMeta.color,
                borderColor: statusMeta.color + "55",
                background: statusMeta.color + "18",
              }}
            >
              {statusMeta.label}
            </span>
          </div>
          <div style={{ color: "#999", fontSize: 13, marginTop: 3 }}>
            {row.business || "—"}
            {row.sector ? ` · ${row.sector}` : ""}
          </div>
        </div>
        <div style={{ color: "#666", fontSize: 12, whiteSpace: "nowrap" }}>
          {fmtDateTime(row.created_at)}
        </div>
      </div>

      {/* Reunión + Meet (solo solicitudes de reunión) */}
      {row.kind === "meeting" && (
        <div style={styles.meetingRow}>
          <span style={styles.meetingBadge}>📅 {meetingLabel}</span>
          {row.meet_link ? (
            <a
              href={row.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.meetBtn}
            >
              🎥 Unirse a Meet
            </a>
          ) : (
            <span style={{ color: "#8a6d00", fontSize: 12 }}>
              Meet no generado
            </span>
          )}
        </div>
      )}

      {/* Contacto + acciones rápidas */}
      <div style={styles.contactRow}>
        <a href={`mailto:${row.email}`} style={styles.contactLink}>
          ✉ {row.email}
        </a>
        {row.phone && (
          <span style={{ color: "#aaa", fontSize: 13 }}>📱 {row.phone}</span>
        )}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.waBtn}
          >
            WhatsApp
          </a>
        )}
      </div>

      {/* Áreas evaluadas (solo auditorías) */}
      {row.kind === "audit" && row.selected_areas?.length > 0 && (
        <div style={styles.chips}>
          {row.selected_areas.map((id) => {
            const lvl = row.scores?.[id] ?? "red";
            return (
              <span
                key={id}
                style={{
                  ...styles.areaChip,
                  color: LEVEL_COLOR[lvl],
                  borderColor: LEVEL_COLOR[lvl] + "55",
                }}
              >
                {areaTitle(id)} · {levelLabels[lvl]}
              </span>
            );
          })}
        </div>
      )}

      {row.kind === "audit" && row.priorities?.length > 0 && (
        <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
          <strong style={{ color: "#00e5a0" }}>Prioridades:</strong>{" "}
          {row.priorities.map(areaTitle).join(" → ")}
        </div>
      )}

      {/* Controles de seguimiento */}
      <div style={styles.controls}>
        <label style={styles.controlLabel}>Estado</label>
        <select
          value={row.status}
          onChange={(e) => onStatus(e.target.value as FormSubmissionStatus)}
          style={{ ...styles.select, ...(isMobile ? styles.touchInput : null) }}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={onToggle}
          style={{ ...styles.ghostBtn, ...(isMobile ? styles.touchBtn : null) }}
        >
          {expanded ? "Ocultar detalle" : "Ver detalle"}
        </button>
        <button
          onClick={onDelete}
          style={{
            ...styles.dangerBtn,
            ...(isMobile ? { ...styles.touchBtn, marginLeft: 0 } : null),
          }}
        >
          Eliminar
        </button>
      </div>

      {/* Nota de seguimiento */}
      <div style={{ marginTop: 12 }}>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Notas de seguimiento internas…"
          style={{
            ...styles.noteInput,
            ...(isMobile ? { fontSize: 16 } : null),
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 6,
          }}
        >
          <button
            onClick={handleSaveNote}
            disabled={savingNote || noteDraft === (row.admin_notes ?? "")}
            style={{
              ...styles.saveNoteBtn,
              opacity:
                savingNote || noteDraft === (row.admin_notes ?? "") ? 0.5 : 1,
            }}
          >
            {savingNote ? "Guardando…" : "Guardar nota"}
          </button>
          {noteSaved && (
            <span style={{ color: "#00e5a0", fontSize: 12 }}>✓ Guardada</span>
          )}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && row.kind === "meeting" && (
        <div style={styles.detail}>
          {meetingDetailPairs
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
                <div style={{ fontSize: 13, color: "#ddd", marginTop: 2 }}>
                  {value}
                </div>
              </div>
            ))}
        </div>
      )}

      {expanded && row.kind === "audit" && (
        <div style={styles.detail}>
          {row.selected_areas.map((id) => {
            const area = AREAS.find((a) => a.id === id);
            if (!area) return null;
            const answers = row.answers?.[id] || {};
            const note = (row.notes?.[id] || "").trim();
            return (
              <div key={id} style={{ marginBottom: 18 }}>
                <div style={styles.detailArea}>{area.title}</div>
                {area.qs.map((q, qi) => {
                  const ans = answers[qi];
                  const lvl = ans?.level ?? "red";
                  return (
                    <div key={qi} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {q.text}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#ddd",
                          padding: "6px 10px",
                          borderRadius: 6,
                          marginTop: 3,
                          background: "#141414",
                          borderLeft: `3px solid ${LEVEL_COLOR[lvl]}`,
                        }}
                      >
                        {ans?.text ?? "Sin respuesta"}
                      </div>
                    </div>
                  );
                })}
                {note && (
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>
                    <strong>Apuntes del cliente:</strong> {note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 999,
    border: "1px solid #2a2a2a",
    background: "transparent",
    color: "#999",
    fontSize: 13,
    cursor: "pointer",
  },
  filterChipActive: {
    background: "#1e1e1e",
    color: "#fff",
    borderColor: "#3a3a3a",
  },
  dot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  errorBox: {
    background: "#2a1515",
    border: "1px solid #5a2a2a",
    color: "#ff9090",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
  },
  list: { display: "flex", flexDirection: "column", gap: 14, marginTop: 8 },
  card: {
    background: "#121212",
    border: "1px solid #232323",
    borderRadius: 12,
    padding: 20,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  kindBadge: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 999,
    border: "1px solid",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statusBadge: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 999,
    border: "1px solid",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  meetingRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  meetingBadge: {
    fontSize: 13,
    color: "#ddd",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "5px 12px",
  },
  meetBtn: {
    background: "#00e5a0",
    color: "#000",
    fontSize: 12,
    fontWeight: 700,
    padding: "5px 14px",
    borderRadius: 8,
    textDecoration: "none",
  },
  contactRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
  },
  contactLink: { color: "#00d9ff", fontSize: 13, textDecoration: "none" },
  waBtn: {
    background: "#00e5a0",
    color: "#000",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 6,
    textDecoration: "none",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 },
  areaChip: {
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 999,
    border: "1px solid",
    background: "#0e0e0e",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #232323",
  },
  controlLabel: { fontSize: 12, color: "#888" },
  // Variantes táctiles: 16px evita el zoom de iOS al enfocar; 40px de alto es
  // el mínimo cómodo para el dedo.
  touchInput: { fontSize: 16, minHeight: 40 },
  touchBtn: { minHeight: 40, fontSize: 14 },
  touchChip: { minHeight: 40, padding: "8px 14px" },
  select: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    color: "#fff",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 13,
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    color: "#ccc",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  dangerBtn: {
    background: "transparent",
    border: "1px solid #5a2a2a",
    color: "#ff9090",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
    marginLeft: "auto",
  },
  noteInput: {
    width: "100%",
    minHeight: 60,
    resize: "vertical",
    background: "#0e0e0e",
    border: "1px solid #2a2a2a",
    color: "#eee",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "inherit",
  },
  saveNoteBtn: {
    background: "#1e1e1e",
    border: "1px solid #3a3a3a",
    color: "#fff",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  detail: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #232323",
  },
  detailArea: {
    fontSize: 14,
    fontWeight: 700,
    color: "#00e5a0",
    marginBottom: 10,
  },
};
