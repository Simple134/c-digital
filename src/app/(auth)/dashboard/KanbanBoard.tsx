"use client";

import { useCallback, useEffect, useState } from "react";
import { Kanban, dropHandler } from "react-kanban-kit";
import type { BoardData, BoardItem } from "react-kanban-kit";
import type { createClient } from "@/lib/supabase/client";
import type {
  KanbanCard,
  KanbanColumn,
  TeamMember,
} from "@/lib/supabase/types";

type Supabase = ReturnType<typeof createClient>;

const PRIORITIES = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

// Mapea la prioridad a un color de acento. Buen punto para personalizar según
// tus propias etiquetas/estados.
const PRIORITY_COLOR: Record<string, string> = {
  alta: "#ff8080",
  media: "#e6b800",
  baja: "#5aa9ff",
};

/**
 * Transforma las filas normalizadas de Supabase (columnas + tarjetas) en el
 * formato plano-anidado que espera react-kanban-kit: un mapa `{ [id]: item }`
 * donde `root.children` lista las columnas y cada columna lista los ids de sus
 * tarjetas. Los datos propios de la tarjeta se guardan en `content` para poder
 * reconstruir la fila al persistir.
 */
function buildBoardData(
  columns: KanbanColumn[],
  cards: KanbanCard[],
): BoardData {
  const data: BoardData = {
    root: {
      id: "root",
      title: "root",
      parentId: null,
      children: columns.map((c) => c.id),
      totalChildrenCount: columns.length,
    },
  };

  for (const col of columns) {
    const colCards = cards.filter((c) => c.column_id === col.id);
    data[col.id] = {
      id: col.id,
      title: col.title,
      parentId: "root",
      children: colCards.map((c) => c.id),
      totalChildrenCount: colCards.length,
    };
    for (const card of colCards) {
      data[card.id] = {
        id: card.id,
        title: card.title,
        parentId: col.id,
        children: [],
        totalChildrenCount: 0,
        type: "card",
        content: {
          description: card.description,
          priority: card.priority,
          assignee_id: card.assignee_id,
        },
      };
    }
  }

  return data;
}

export default function KanbanBoard({ supabase }: { supabase: Supabase }) {
  const [data, setData] = useState<BoardData | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales: qué columna recibe una tarjeta nueva / si se crea una columna.
  const [cardModalColumn, setCardModalColumn] = useState<BoardItem | null>(
    null,
  );
  const [columnModalOpen, setColumnModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [cols, cards, team] = await Promise.all([
      supabase
        .from("kanban_columns")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("kanban_cards")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("team_members")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);
    if (cols.error || cards.error || team.error) {
      setError(
        (cols.error ?? cards.error ?? team.error)?.message ?? "Error al cargar",
      );
      setLoading(false);
      return;
    }
    setMembers((team.data as TeamMember[]) ?? []);
    setData(
      buildBoardData(
        (cols.data as KanbanColumn[]) ?? [],
        (cards.data as KanbanCard[]) ?? [],
      ),
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Persiste el orden de una columna: reescribe `sort_order = índice` para cada
   * tarjeta según su posición en `children`, y fija `column_id` a esa columna
   * (útil cuando la tarjeta acaba de moverse desde otra columna).
   */
  const persistColumns = useCallback(
    async (columnIds: string[], next: BoardData) => {
      const rows = columnIds.flatMap((columnId) =>
        next[columnId].children.map((cardId, index) => {
          const item = next[cardId];
          return {
            id: item.id,
            column_id: columnId,
            title: item.title,
            description: item.content?.description ?? null,
            priority: item.content?.priority ?? null,
            assignee_id: item.content?.assignee_id ?? null,
            sort_order: index,
          };
        }),
      );
      if (rows.length === 0) return;
      const { error } = await supabase.from("kanban_cards").upsert(rows);
      if (error) setError(error.message);
    },
    [supabase],
  );

  const handleCardMove = useCallback(
    (move: {
      cardId: string;
      fromColumnId: string;
      toColumnId: string;
      taskAbove: string | null;
      taskBelow: string | null;
    }) => {
      setData((current) => {
        if (!current) return current;
        const next = dropHandler(move, current) as BoardData;
        const affected =
          move.fromColumnId === move.toColumnId
            ? [move.toColumnId]
            : [move.fromColumnId, move.toColumnId];
        // dropHandler no sincroniza totalChildrenCount: sin esto la columna
        // destino oculta la tarjeta recién movida y el origen deja un esqueleto.
        for (const colId of affected) {
          const col = next[colId];
          next[colId] = { ...col, totalChildrenCount: col.children.length };
        }
        // Refleja el nuevo padre de la tarjeta movida.
        if (next[move.cardId]) {
          next[move.cardId] = {
            ...next[move.cardId],
            parentId: move.toColumnId,
          };
        }
        // Persiste origen y destino (o solo uno si es reordenamiento interno).
        void persistColumns(affected, next);
        return next;
      });
    },
    [persistColumns],
  );

  async function createCard(values: {
    title: string;
    description: string;
    priority: string;
    assignee_id: string;
  }) {
    if (!cardModalColumn) return;
    const { error } = await supabase.from("kanban_cards").insert({
      column_id: cardModalColumn.id,
      title: values.title,
      description: values.description || null,
      priority: values.priority || null,
      assignee_id: values.assignee_id || null,
      sort_order: cardModalColumn.children.length,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setCardModalColumn(null);
    load();
  }

  async function createColumn(title: string) {
    const count = data?.root.children.length ?? 0;
    const { error } = await supabase
      .from("kanban_columns")
      .insert({ title, sort_order: count });
    if (error) {
      setError(error.message);
      return;
    }
    setColumnModalOpen(false);
    load();
  }

  async function deleteCard(cardId: string) {
    if (!window.confirm("¿Eliminar esta tarjeta?")) return;
    const { error } = await supabase
      .from("kanban_cards")
      .delete()
      .eq("id", cardId);
    if (error) return setError(error.message);
    load();
  }

  if (loading) return <p style={{ color: "#888" }}>Cargando tablero…</p>;
  if (error) return <p style={styles.errorBox}>{error}</p>;
  if (!data) return null;

  return (
    <div className="cdg-kanban" style={{ height: "calc(100vh - 160px)" }}>
      <Kanban
        dataSource={data}
        configMap={{
          card: {
            isDraggable: true,
            render: ({ data: card }) => (
              <Card
                card={card}
                members={members}
                onDelete={() => deleteCard(card.id)}
              />
            ),
          },
        }}
        onCardMove={handleCardMove}
        allowColumnAdder
        renderColumnAdder={() => (
          <button
            style={styles.addColumnBtn}
            onClick={() => setColumnModalOpen(true)}
          >
            + Añadir columna
          </button>
        )}
        renderColumnHeader={(column) => (
          <div style={styles.columnHeader}>
            <span>{column.title}</span>
            <span style={styles.count}>{column.totalChildrenCount}</span>
          </div>
        )}
        allowListFooter={() => true}
        renderListFooter={(column) => (
          <button
            style={styles.addCardBtn}
            onClick={() => setCardModalColumn(column)}
          >
            + Añadir tarjeta
          </button>
        )}
        rootStyle={{ background: "transparent", height: "100%" }}
      />

      {cardModalColumn && (
        <CardModal
          columnTitle={cardModalColumn.title}
          members={members}
          onClose={() => setCardModalColumn(null)}
          onCreate={createCard}
        />
      )}

      {columnModalOpen && (
        <ColumnModal
          onClose={() => setColumnModalOpen(false)}
          onCreate={createColumn}
        />
      )}
    </div>
  );
}

/* ---------------- Card ---------------- */

function Card({
  card,
  members,
  onDelete,
}: {
  card: BoardItem;
  members: TeamMember[];
  onDelete: () => void;
}) {
  const priority = card.content?.priority as string | undefined;
  const accent = priority ? (PRIORITY_COLOR[priority] ?? "#555") : "#555";
  const assignee = members.find((m) => m.id === card.content?.assignee_id);
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{card.title}</span>
        <button
          style={styles.cardDelete}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Eliminar tarjeta"
        >
          ✕
        </button>
      </div>
      {card.content?.description && (
        <p style={styles.cardDesc}>{card.content.description}</p>
      )}
      <div style={styles.cardMeta}>
        {priority && (
          <span
            style={{ ...styles.priority, color: accent, borderColor: accent }}
          >
            {priority}
          </span>
        )}
        {assignee && <Avatar member={assignee} />}
      </div>
    </div>
  );
}

function Avatar({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span style={styles.assignee} title={member.name}>
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photo} alt="" style={styles.avatarImg} />
      ) : (
        <span style={styles.avatarInitials}>{initials}</span>
      )}
      {member.name.split(" ")[0]}
    </span>
  );
}

/* ---------------- Modales ---------------- */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CardModal({
  columnTitle,
  members,
  onClose,
  onCreate,
}: {
  columnTitle: string;
  members: TeamMember[];
  onClose: () => void;
  onCreate: (v: {
    title: string;
    description: string;
    priority: string;
    assignee_id: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee_id: assigneeId,
    });
    setSaving(false);
  }

  return (
    <Modal title={`Nueva tarjeta · ${columnTitle}`} onClose={onClose}>
      <div style={styles.modalBody}>
        <label style={styles.field}>
          <span style={styles.label}>Título</span>
          <input
            style={styles.input}
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Descripción</span>
          <textarea
            style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Prioridad</span>
          <select
            style={styles.input}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">Sin prioridad</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Asignar a</span>
          <select
            style={styles.input}
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.role ? ` — ${m.role}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.modalFooter}>
        <button onClick={onClose} style={styles.ghostBtn}>
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={saving || !title.trim()}
          style={{
            ...styles.primaryBtn,
            opacity: saving || !title.trim() ? 0.5 : 1,
          }}
        >
          {saving ? "Creando…" : "Crear tarjeta"}
        </button>
      </div>
    </Modal>
  );
}

function ColumnModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate(title.trim());
    setSaving(false);
  }

  return (
    <Modal title="Nueva columna" onClose={onClose}>
      <div style={styles.modalBody}>
        <label style={styles.field}>
          <span style={styles.label}>Título</span>
          <input
            style={styles.input}
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
      </div>
      <div style={styles.modalFooter}>
        <button onClick={onClose} style={styles.ghostBtn}>
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={saving || !title.trim()}
          style={{
            ...styles.primaryBtn,
            opacity: saving || !title.trim() ? 0.5 : 1,
          }}
        >
          {saving ? "Creando…" : "Crear columna"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Styles ---------------- */

const styles: Record<string, React.CSSProperties> = {
  errorBox: {
    background: "#2a1515",
    border: "1px solid #4a2020",
    color: "#ff9b9b",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  count: {
    fontSize: 12,
    color: "#888",
    background: "#1e1e1e",
    borderRadius: 20,
    padding: "2px 9px",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    cursor: "grab",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardDelete: {
    background: "transparent",
    border: "none",
    color: "#666",
    fontSize: 12,
    cursor: "pointer",
    lineHeight: 1,
    flexShrink: 0,
  },
  cardDesc: { color: "#999", fontSize: 12, margin: 0, lineHeight: 1.4 },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  priority: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: "2px 8px",
  },
  assignee: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#bbb",
    marginLeft: "auto",
  },
  avatarImg: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarInitials: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#2a2a2a",
    color: "#ddd",
    fontSize: 9,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addCardBtn: {
    width: "100%",
    padding: "9px 12px",
    background: "transparent",
    border: "1px dashed #2a2a2a",
    borderRadius: 8,
    color: "#888",
    fontSize: 13,
    cursor: "pointer",
    marginTop: 6,
  },
  addColumnBtn: {
    padding: "11px 18px",
    background: "#121212",
    border: "1px dashed #2a2a2a",
    borderRadius: 12,
    color: "#888",
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
    height: "fit-content",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 60,
    padding: 20,
  },
  modal: {
    width: "min(460px, 100%)",
    background: "#0e0e0e",
    border: "1px solid #1e1e1e",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 22px",
    borderBottom: "1px solid #1e1e1e",
  },
  modalBody: {
    padding: 22,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalFooter: {
    padding: "16px 22px",
    borderTop: "1px solid #1e1e1e",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#888",
    fontSize: 18,
    cursor: "pointer",
  },
  field: { display: "flex", flexDirection: "column", gap: 7 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#888",
  },
  input: {
    padding: "11px 13px",
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  ghostBtn: {
    padding: "10px 16px",
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#ddd",
    fontSize: 13,
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "10px 18px",
    background: "#fff",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
