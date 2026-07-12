"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { createClient } from "@/lib/supabase/client";
import type {
  MeetingRequest,
  MeetingRequestStatus,
} from "@/lib/supabase/types";

type Supabase = ReturnType<typeof createClient>;

const STATUSES: {
  value: MeetingRequestStatus;
  label: string;
  color: string;
}[] = [
  { value: "nuevo", label: "Nuevo", color: "#5aa9ff" },
  { value: "contactado", label: "Contactado", color: "#00d9ff" },
  { value: "en_seguimiento", label: "En seguimiento", color: "#e6b800" },
  { value: "cerrado", label: "Cerrado", color: "#00e5a0" },
  { value: "descartado", label: "Descartado", color: "#888" },
];

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Enlace de WhatsApp: usa los dígitos del teléfono (RD = código país 1).
function waLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const full = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${full}`;
}

export default function MeetingRequests({ supabase }: { supabase: Supabase }) {
  const [rows, setRows] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MeetingRequestStatus | "todos">("todos");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("meeting_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setRows((data as MeetingRequest[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: MeetingRequestStatus) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase
      .from("meeting_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      alert("Error al actualizar el estado: " + error.message);
      load();
    }
  }

  async function saveNotes(id: string, admin_notes: string) {
    const { error } = await supabase
      .from("meeting_requests")
      .update({ admin_notes, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      alert("Error al guardar la nota: " + error.message);
      return false;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, admin_notes } : r)),
    );
    return true;
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este registro? Esta acción no se puede deshacer."))
      return;
    const { error } = await supabase
      .from("meeting_requests")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const visible =
    filter === "todos" ? rows : rows.filter((r) => r.status === filter);

  const counts = STATUSES.map((s) => ({
    ...s,
    count: rows.filter((r) => r.status === s.value).length,
  }));

  return (
    <div>
      {/* Filtros por estado */}
      <div style={styles.filters}>
        <button
          onClick={() => setFilter("todos")}
          style={{
            ...styles.filterChip,
            ...(filter === "todos" ? styles.filterChipActive : {}),
          }}
        >
          Todos ({rows.length})
        </button>
        {counts.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            style={{
              ...styles.filterChip,
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
            <MeetingCard
              key={row.id}
              row={row}
              expanded={expanded === row.id}
              onToggle={() =>
                setExpanded((e) => (e === row.id ? null : row.id))
              }
              onStatus={(s) => updateStatus(row.id, s)}
              onSaveNotes={(n) => saveNotes(row.id, n)}
              onDelete={() => remove(row.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Meeting card ---------------- */

function MeetingCard({
  row,
  expanded,
  onToggle,
  onStatus,
  onSaveNotes,
  onDelete,
}: {
  row: MeetingRequest;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: MeetingRequestStatus) => void;
  onSaveNotes: (n: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [noteDraft, setNoteDraft] = useState(row.admin_notes ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const statusMeta =
    STATUSES.find((s) => s.value === row.status) ?? STATUSES[0];
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
    row.meeting_date && row.meeting_time
      ? `${row.meeting_date} · ${row.meeting_time}`
      : (row.meeting_date ?? "Sin fecha");

  const detailPairs: [string, string | null][] = [
    ["Cargo / posición", row.role],
    ["Sector", row.sector],
    ["Etapa del negocio", row.stage],
    ["Presencia digital", row.digital?.length ? row.digital.join(", ") : null],
    ["Principal desafío", row.challenge],
    [
      "Servicios de interés",
      row.services?.length ? row.services.join(", ") : null,
    ],
    ["Presupuesto", row.budget],
    ["Información extra", row.note],
  ];

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{row.name}</span>
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
          {fmtDate(row.created_at)}
        </div>
      </div>

      {/* Reunión + Meet */}
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

      {/* Controles de seguimiento */}
      <div style={styles.controls}>
        <label style={styles.controlLabel}>Estado</label>
        <select
          value={row.status}
          onChange={(e) => onStatus(e.target.value as MeetingRequestStatus)}
          style={styles.select}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button onClick={onToggle} style={styles.ghostBtn}>
          {expanded ? "Ocultar detalle" : "Ver detalle"}
        </button>
        <button onClick={onDelete} style={styles.dangerBtn}>
          Eliminar
        </button>
      </div>

      {/* Nota de seguimiento */}
      <div style={{ marginTop: 12 }}>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Notas de seguimiento internas…"
          style={styles.noteInput}
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
      {expanded && (
        <div style={styles.detail}>
          {detailPairs
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
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
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
  list: { display: "flex", flexDirection: "column", gap: 14 },
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
};
