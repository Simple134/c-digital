"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kanban, dropColumnHandler, dropHandler } from "react-kanban-kit";
import type { BoardData, BoardItem } from "react-kanban-kit";
import { fmtDateTime } from "@/lib/format";
import type { createClient } from "@/lib/supabase/client";
import type {
  Client,
  KanbanCard,
  KanbanColumn,
  TeamMember,
} from "@/lib/supabase/types";

type Supabase = ReturnType<typeof createClient>;

/** Valores que producen los modales de crear/editar tarjeta. */
type CardFormValues = {
  title: string;
  description: string;
  priority: string;
  assignee_id: string;
  client_id: string;
  assigned_to_client: boolean;
  image_url: string | null;
  image_path: string | null;
};

const BUCKET = "kanban-attachments";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// Valor especial del filtro de responsable: tareas que esperan al cliente.
const CLIENT_FILTER = "__client__";

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
          client_id: card.client_id,
          assigned_to_client: card.assigned_to_client,
          image_url: card.image_url,
          image_path: card.image_path,
          created_at: card.created_at,
        },
      };
    }
  }

  return data;
}

export default function KanbanBoard({ supabase }: { supabase: Supabase }) {
  const [data, setData] = useState<BoardData | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Modales: qué columna recibe una tarjeta nueva / si se crea una columna.
  const [cardModalColumn, setCardModalColumn] = useState<BoardItem | null>(
    null,
  );
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<BoardItem | null>(null);
  const [editingColumn, setEditingColumn] = useState<BoardItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [cols, cards, team, clientRows] = await Promise.all([
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
      supabase
        .from("clients")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);
    if (cols.error || cards.error || team.error || clientRows.error) {
      setError(
        (cols.error ?? cards.error ?? team.error ?? clientRows.error)
          ?.message ?? "Error al cargar",
      );
      setLoading(false);
      return;
    }
    setMembers((team.data as TeamMember[]) ?? []);
    setClients((clientRows.data as Client[]) ?? []);
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

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Cuando se elige un cliente y/o un miembro del equipo, el tablero solo
  // muestra las tarjetas que cumplen ambos filtros (las columnas siguen
  // siendo las mismas para todos).
  const visibleData = useMemo(() => {
    if (!data || (!selectedClientId && !selectedMemberId)) return data;
    const next: BoardData = { root: data.root };
    for (const colId of data.root.children) {
      const col = data[colId];
      const visibleChildren = col.children.filter((cardId) => {
        const content = data[cardId]?.content;
        if (selectedClientId && content?.client_id !== selectedClientId)
          return false;
        if (selectedMemberId === CLIENT_FILTER) {
          if (!content?.assigned_to_client) return false;
        } else if (selectedMemberId && content?.assignee_id !== selectedMemberId)
          return false;
        return true;
      });
      next[colId] = {
        ...col,
        children: visibleChildren,
        totalChildrenCount: visibleChildren.length,
      };
      for (const cardId of visibleChildren) next[cardId] = data[cardId];
    }
    return next;
  }, [data, selectedClientId, selectedMemberId]);

  async function copyPublicLink() {
    if (!selectedClient) return;
    const url = `${window.location.origin}/proyecto/${selectedClient.public_token}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

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
            client_id: item.content?.client_id ?? null,
            // Sin esto el upsert al arrastrar perdería la marca de "pendiente
            // del cliente" (volvería al default false).
            assigned_to_client: item.content?.assigned_to_client ?? false,
            image_url: item.content?.image_url ?? null,
            image_path: item.content?.image_path ?? null,
            // created_at se omite a propósito: el UPDATE del upsert solo toca
            // las columnas presentes, así que la fecha original se conserva.
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

  const persistColumnOrder = useCallback(
    async (next: BoardData) => {
      const rows = next.root.children.map((columnId, index) => ({
        id: columnId,
        title: next[columnId].title,
        sort_order: index,
      }));
      if (rows.length === 0) return;
      const { error } = await supabase.from("kanban_columns").upsert(rows);
      if (error) setError(error.message);
    },
    [supabase],
  );

  const handleColumnMove = useCallback(
    (move: { columnId: string; fromIndex: number; toIndex: number }) => {
      setData((current) => {
        if (!current) return current;
        const next = dropColumnHandler(move, current) as BoardData;
        void persistColumnOrder(next);
        return next;
      });
    },
    [persistColumnOrder],
  );

  /**
   * Sube una imagen al bucket y devuelve su path + URL pública. Devuelve null
   * si falla (el mensaje ya queda en `error`), para que quien llame decida si
   * continúa sin imagen o aborta.
   */
  const uploadImage = useCallback(
    async (file: File) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError("Formato no admitido. Usa PNG, JPG, WebP o GIF.");
        return null;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError("La imagen supera los 5 MB.");
        return null;
      }
      // El nombre original puede traer acentos o espacios: solo conservamos la
      // extensión y generamos un nombre opaco.
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError(uploadError.message);
        return null;
      }
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { image_path: path, image_url: pub.publicUrl };
    },
    [supabase],
  );

  /** Borra el objeto del bucket. Los fallos no se propagan: la fila ya cambió. */
  const removeImageObject = useCallback(
    async (path: string | null | undefined) => {
      if (!path) return;
      await supabase.storage.from(BUCKET).remove([path]);
    },
    [supabase],
  );

  async function createCard(values: CardFormValues) {
    if (!cardModalColumn) return;
    const clientId = selectedClientId || values.client_id || null;
    const { error } = await supabase.from("kanban_cards").insert({
      column_id: cardModalColumn.id,
      title: values.title,
      description: values.description || null,
      priority: values.priority || null,
      assignee_id: values.assignee_id || null,
      client_id: clientId,
      // Solo tiene sentido esperar al cliente si la tarjeta le pertenece.
      assigned_to_client: clientId ? values.assigned_to_client : false,
      image_url: values.image_url,
      image_path: values.image_path,
      sort_order: cardModalColumn.children.length,
    });
    if (error) {
      setError(error.message);
      // La imagen ya está en el bucket pero no hay fila que la referencie:
      // se limpia para no dejar huérfanos.
      await removeImageObject(values.image_path);
      return;
    }
    setCardModalColumn(null);
    load();
  }

  async function updateCard(cardId: string, values: CardFormValues) {
    const patch = {
      title: values.title,
      description: values.description || null,
      priority: values.priority || null,
      assignee_id: values.assignee_id || null,
      client_id: values.client_id || null,
      assigned_to_client: values.client_id ? values.assigned_to_client : false,
      image_url: values.image_url,
      image_path: values.image_path,
    };
    const previousPath = data?.[cardId]?.content?.image_path as
      | string
      | null
      | undefined;
    const { error } = await supabase
      .from("kanban_cards")
      .update(patch)
      .eq("id", cardId);
    if (error) {
      setError(error.message);
      return;
    }
    // La fila ya apunta a la imagen nueva (o a ninguna): el objeto anterior
    // queda sin referencias.
    if (previousPath && previousPath !== values.image_path) {
      await removeImageObject(previousPath);
    }
    setEditingCard(null);
    setData((current) => {
      if (!current || !current[cardId]) return current;
      const { title, ...content } = patch;
      return {
        ...current,
        [cardId]: {
          ...current[cardId],
          title,
          // Se mezcla sobre el content anterior para no perder campos que el
          // formulario no edita (created_at).
          content: { ...current[cardId].content, ...content },
        },
      };
    });
  }

  async function assignClient(cardId: string, clientId: string) {
    // Quitar el cliente también quita la marca de "pendiente del cliente":
    // sin cliente no hay a quién esperar.
    const patch = clientId
      ? { client_id: clientId }
      : { client_id: null, assigned_to_client: false };
    const { error } = await supabase
      .from("kanban_cards")
      .update(patch)
      .eq("id", cardId);
    if (error) {
      setError(error.message);
      return;
    }
    setData((current) => {
      if (!current || !current[cardId]) return current;
      return {
        ...current,
        [cardId]: {
          ...current[cardId],
          content: { ...current[cardId].content, ...patch },
        },
      };
    });
  }

  /** Alterna "pendiente del cliente" desde la propia tarjeta, sin abrir el modal. */
  async function toggleAssignedToClient(cardId: string, next: boolean) {
    const { error } = await supabase
      .from("kanban_cards")
      .update({ assigned_to_client: next })
      .eq("id", cardId);
    if (error) {
      setError(error.message);
      return;
    }
    setData((current) => {
      if (!current || !current[cardId]) return current;
      return {
        ...current,
        [cardId]: {
          ...current[cardId],
          content: { ...current[cardId].content, assigned_to_client: next },
        },
      };
    });
  }

  async function createClientRecord(name: string) {
    const count = clients.length;
    const { data: created, error } = await supabase
      .from("clients")
      .insert({ name, sort_order: count })
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setClientModalOpen(false);
    setClients((current) => [...current, created as Client]);
    setSelectedClientId((created as Client).id);
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

  async function updateColumn(columnId: string, title: string) {
    const { error } = await supabase
      .from("kanban_columns")
      .update({ title })
      .eq("id", columnId);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingColumn(null);
    setData((current) => {
      if (!current || !current[columnId]) return current;
      return {
        ...current,
        [columnId]: {
          ...current[columnId],
          title,
        },
      };
    });
  }

  async function deleteCard(cardId: string) {
    if (!window.confirm("¿Eliminar esta tarjeta?")) return;
    const imagePath = data?.[cardId]?.content?.image_path as
      | string
      | null
      | undefined;
    const { error } = await supabase
      .from("kanban_cards")
      .delete()
      .eq("id", cardId);
    if (error) return setError(error.message);
    await removeImageObject(imagePath);
    load();
  }

  if (loading) return <p style={{ color: "#888" }}>Cargando tablero…</p>;
  if (error) return <p style={styles.errorBox}>{error}</p>;
  if (!data || !visibleData) return null;

  return (
    <div
      className="cdg-kanban"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={styles.toolbar}>
        <select
          style={styles.clientPicker}
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">Todos (vista interna)</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          style={styles.clientPicker}
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
        >
          <option value="">Todo el equipo</option>
          <option value={CLIENT_FILTER}>⏳ Pendiente del cliente</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button style={styles.ghostBtn} onClick={() => setClientModalOpen(true)}>
          + Nuevo cliente
        </button>
        {selectedClient && (
          <button style={styles.ghostBtn} onClick={copyPublicLink}>
            {linkCopied ? "¡Link copiado!" : "Copiar link público"}
          </button>
        )}
      </div>

      <div
        className="cdg-kanban-board"
        style={{ flex: 1, minHeight: 0, height: "calc(100vh - 220px)" }}
      >
      <Kanban
        dataSource={visibleData}
        configMap={{
          card: {
            isDraggable: true,
            render: ({ data: card }) => (
              <Card
                card={card}
                members={members}
                clients={clients}
                showClientSelector={!selectedClientId}
                onDelete={() => deleteCard(card.id)}
                onAssignClient={(clientId) => assignClient(card.id, clientId)}
                onToggleAssignedToClient={(next) =>
                  toggleAssignedToClient(card.id, next)
                }
                onEdit={() => setEditingCard(card)}
              />
            ),
          },
        }}
        onCardMove={handleCardMove}
        allowColumnDrag
        onColumnMove={handleColumnMove}
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
            <span style={styles.columnTitle} title="Arrastra para mover columna">
              {column.title}
            </span>
            <span style={styles.columnActions}>
              <button
                type="button"
                style={styles.columnEditBtn}
                title="Editar columna"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingColumn(column);
                }}
              >
                ✎
              </button>
              <span style={styles.count}>{column.totalChildrenCount}</span>
            </span>
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
      </div>

      {cardModalColumn && (
        <CardModal
          columnTitle={cardModalColumn.title}
          members={members}
          clients={clients}
          lockedClientId={selectedClientId || undefined}
          onClose={() => setCardModalColumn(null)}
          onCreate={createCard}
          onUpload={uploadImage}
          onRemoveObject={removeImageObject}
        />
      )}

      {editingCard && (
        <EditCardModal
          card={editingCard}
          members={members}
          clients={clients}
          onClose={() => setEditingCard(null)}
          onSave={(values) => updateCard(editingCard.id, values)}
          onUpload={uploadImage}
          onRemoveObject={removeImageObject}
        />
      )}

      {columnModalOpen && (
        <ColumnModal
          title="Nueva columna"
          submitLabel="Crear columna"
          savingLabel="Creando…"
          onClose={() => setColumnModalOpen(false)}
          onCreate={createColumn}
        />
      )}

      {editingColumn && (
        <ColumnModal
          title="Editar columna"
          submitLabel="Guardar cambios"
          savingLabel="Guardando…"
          initialTitle={editingColumn.title}
          onClose={() => setEditingColumn(null)}
          onCreate={(title) => updateColumn(editingColumn.id, title)}
        />
      )}

      {clientModalOpen && (
        <ClientModal
          onClose={() => setClientModalOpen(false)}
          onCreate={createClientRecord}
        />
      )}
    </div>
  );
}

/* ---------------- Card ---------------- */

function Card({
  card,
  members,
  clients,
  showClientSelector,
  onDelete,
  onAssignClient,
  onToggleAssignedToClient,
  onEdit,
}: {
  card: BoardItem;
  members: TeamMember[];
  clients: Client[];
  showClientSelector: boolean;
  onDelete: () => void;
  onAssignClient: (clientId: string) => void;
  onToggleAssignedToClient: (next: boolean) => void;
  onEdit: () => void;
}) {
  const priority = card.content?.priority as string | undefined;
  const accent = priority ? (PRIORITY_COLOR[priority] ?? "#555") : "#555";
  const assignee = members.find((m) => m.id === card.content?.assignee_id);
  const clientId = card.content?.client_id as string | null | undefined;
  const client = clients.find((c) => c.id === clientId);
  const waitingOnClient = Boolean(card.content?.assigned_to_client);
  const createdAt = fmtDateTime(card.content?.created_at as string | undefined);
  return (
    <div
      style={{
        ...styles.card,
        ...(waitingOnClient ? styles.cardWaitingClient : null),
      }}
      onClick={onEdit}
    >
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
      {typeof card.content?.image_url === "string" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.content.image_url} alt="" style={styles.cardThumb} />
      )}
      {card.content?.description && (
        <p style={styles.cardDesc}>{card.content.description}</p>
      )}
      {createdAt && (
        <span style={styles.createdAt} title={`Creada el ${createdAt}`}>
          {createdAt}
        </span>
      )}
      <div style={styles.cardMeta}>
        {priority && (
          <span
            style={{ ...styles.priority, color: accent, borderColor: accent }}
          >
            {priority}
          </span>
        )}
        {waitingOnClient ? (
          <span style={styles.clientBadge} title="Esperando al cliente">
            ⏳ {client?.name ?? "Cliente"}
          </span>
        ) : (
          assignee && <Avatar member={assignee} />
        )}
      </div>
      {clientId && (
        <Switch
          small
          checked={waitingOnClient}
          onChange={onToggleAssignedToClient}
          label="Pendiente del cliente"
          // La tarjeta entera abre el modal al hacer clic: el switch no debe.
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {showClientSelector && (
        <select
          style={styles.clientSelect}
          value={(card.content?.client_id as string) ?? ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onAssignClient(e.target.value)}
        >
          <option value="">Sin cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
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

/**
 * Switch sobre un checkbox real: la apariencia la dan `.cdg-switch-track` y su
 * pseudo-elemento en globals.css, pero el input sigue ahí (oculto) para no
 * perder el foco por teclado ni la semántica para lectores de pantalla.
 */
function Switch({
  checked,
  onChange,
  label,
  small,
  onClick,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  small?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <label
      className={`cdg-switch${small ? " cdg-switch--sm" : ""}`}
      onClick={onClick}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="cdg-switch-track" />
      <span className="cdg-switch-label">{label}</span>
    </label>
  );
}

/**
 * Campo compartido por los modales de crear y editar: marca la tarjeta como
 * responsabilidad del cliente. Solo se renderiza cuando hay un cliente.
 */
function ClientResponsibleField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div style={styles.field}>
      <span style={styles.label}>Responsable</span>
      <Switch
        checked={checked}
        onChange={onChange}
        label="Pendiente del cliente"
      />
      <span style={styles.help}>
        La tarea espera algo de su parte (accesos, contenido, aprobación).
        Aparecerá destacada en su link público.
      </span>
    </div>
  );
}

/**
 * Campo de imagen de referencia. Sube el archivo al bucket en el momento de
 * elegirlo (no al guardar) para poder mostrar la previsualización real y para
 * que el modal solo tenga que persistir dos strings.
 */
function ImageField({
  imageUrl,
  onUpload,
  onChange,
  onRemoveObject,
}: {
  imageUrl: string | null;
  onUpload: (file: File) => Promise<{ image_path: string; image_url: string } | null>;
  onChange: (next: { image_url: string | null; image_path: string | null }) => void;
  onRemoveObject: (path: string | null) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const result = await onUpload(file);
    setUploading(false);
    if (!result) return;
    // Si ya se había subido una imagen en esta misma sesión del modal, la
    // anterior nunca llegó a la base de datos: se borra aquí.
    if (pendingPath) void onRemoveObject(pendingPath);
    setPendingPath(result.image_path);
    onChange(result);
  }

  function clear() {
    if (pendingPath) void onRemoveObject(pendingPath);
    setPendingPath(null);
    // El objeto ya guardado en la fila se borra al guardar, no aquí: si el
    // usuario cancela el modal la imagen original debe seguir existiendo.
    onChange({ image_url: null, image_path: null });
    if (inputRef.current) inputRef.current.value = "";
  }

  const dropzoneClass = [
    "cdg-upload",
    dragging ? "is-dragging" : "",
    uploading ? "is-busy" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div style={styles.field}>
      <span style={styles.label}>Imagen de referencia</span>

      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" style={styles.imagePreview} />
          <span style={styles.imageActions}>
            <button
              type="button"
              className="cdg-image-action"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Subiendo…" : "Reemplazar"}
            </button>
            <button
              type="button"
              className="cdg-image-action cdg-image-action--danger"
              disabled={uploading}
              onClick={clear}
            >
              Quitar
            </button>
          </span>
        </>
      ) : (
        <div
          className={dropzoneClass}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void pick(e.dataTransfer.files?.[0]);
          }}
        >
          <span className="cdg-upload-icon">🖼️</span>
          <span className="cdg-upload-title">
            {uploading ? "Subiendo…" : "Arrastra una imagen o haz clic"}
          </span>
          <span className="cdg-upload-hint">
            PNG, JPG, WebP o GIF · hasta 5 MB
          </span>
        </div>
      )}

      {/* Único input del campo: lo disparan tanto el dropzone como el botón
          "Reemplazar", así que vive fuera de ambos. */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        hidden
        onChange={(e) => pick(e.target.files?.[0])}
      />

      <span style={styles.help}>
        El cliente la verá en su link público.
      </span>
    </div>
  );
}

function CardModal({
  columnTitle,
  members,
  clients,
  lockedClientId,
  onClose,
  onCreate,
  onUpload,
  onRemoveObject,
}: {
  columnTitle: string;
  members: TeamMember[];
  clients: Client[];
  lockedClientId?: string;
  onClose: () => void;
  onCreate: (v: CardFormValues) => Promise<void>;
  onUpload: (file: File) => Promise<{ image_path: string; image_url: string } | null>;
  onRemoveObject: (path: string | null) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [clientId, setClientId] = useState("");
  const [assignedToClient, setAssignedToClient] = useState(false);
  const [image, setImage] = useState<{
    image_url: string | null;
    image_path: string | null;
  }>({ image_url: null, image_path: null });
  const [saving, setSaving] = useState(false);

  // El cliente efectivo: el fijado por el filtro del tablero o el elegido aquí.
  const effectiveClientId = lockedClientId ?? clientId;

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee_id: assigneeId,
      client_id: clientId,
      assigned_to_client: assignedToClient,
      ...image,
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

        <ImageField
          imageUrl={image.image_url}
          onUpload={onUpload}
          onChange={setImage}
          onRemoveObject={onRemoveObject}
        />

        {!lockedClientId && (
          <label style={styles.field}>
            <span style={styles.label}>Cliente</span>
            <select
              style={styles.input}
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                if (!e.target.value) setAssignedToClient(false);
              }}
            >
              <option value="">Sin cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {effectiveClientId && (
          <ClientResponsibleField
            checked={assignedToClient}
            onChange={setAssignedToClient}
          />
        )}
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

function EditCardModal({
  card,
  members,
  clients,
  onClose,
  onSave,
  onUpload,
  onRemoveObject,
}: {
  card: BoardItem;
  members: TeamMember[];
  clients: Client[];
  onClose: () => void;
  onSave: (v: CardFormValues) => Promise<void>;
  onUpload: (file: File) => Promise<{ image_path: string; image_url: string } | null>;
  onRemoveObject: (path: string | null) => Promise<void>;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(
    (card.content?.description as string) ?? "",
  );
  const [priority, setPriority] = useState(
    (card.content?.priority as string) ?? "",
  );
  const [assigneeId, setAssigneeId] = useState(
    (card.content?.assignee_id as string) ?? "",
  );
  const [clientId, setClientId] = useState(
    (card.content?.client_id as string) ?? "",
  );
  const [assignedToClient, setAssignedToClient] = useState(
    Boolean(card.content?.assigned_to_client),
  );
  const [image, setImage] = useState<{
    image_url: string | null;
    image_path: string | null;
  }>({
    image_url: (card.content?.image_url as string | null) ?? null,
    image_path: (card.content?.image_path as string | null) ?? null,
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee_id: assigneeId,
      client_id: clientId,
      assigned_to_client: assignedToClient,
      ...image,
    });
    setSaving(false);
  }

  return (
    <Modal title="Editar tarjeta" onClose={onClose}>
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

        <label style={styles.field}>
          <span style={styles.label}>Cliente</span>
          <select
            style={styles.input}
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              if (!e.target.value) setAssignedToClient(false);
            }}
          >
            <option value="">Sin cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {clientId && (
          <ClientResponsibleField
            checked={assignedToClient}
            onChange={setAssignedToClient}
          />
        )}

        <ImageField
          imageUrl={image.image_url}
          onUpload={onUpload}
          onChange={setImage}
          onRemoveObject={onRemoveObject}
        />

        {card.content?.created_at && (
          <span style={styles.help}>
            Creada el {fmtDateTime(card.content.created_at as string)}
          </span>
        )}
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
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </Modal>
  );
}

function ColumnModal({
  title: modalTitle,
  initialTitle = "",
  submitLabel,
  savingLabel,
  onClose,
  onCreate,
}: {
  title: string;
  initialTitle?: string;
  submitLabel: string;
  savingLabel: string;
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate(title.trim());
    setSaving(false);
  }

  return (
    <Modal title={modalTitle} onClose={onClose}>
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
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </Modal>
  );
}

function ClientModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    await onCreate(name.trim());
    setSaving(false);
  }

  return (
    <Modal title="Nuevo cliente" onClose={onClose}>
      <div style={styles.modalBody}>
        <label style={styles.field}>
          <span style={styles.label}>Nombre del cliente</span>
          <input
            style={styles.input}
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <span style={styles.help}>
            Se genera automáticamente su link público (/proyecto/&lt;token&gt;)
            y quedará seleccionado en el tablero al crearlo.
          </span>
        </label>
      </div>
      <div style={styles.modalFooter}>
        <button onClick={onClose} style={styles.ghostBtn}>
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={saving || !name.trim()}
          style={{
            ...styles.primaryBtn,
            opacity: saving || !name.trim() ? 0.5 : 1,
          }}
        >
          {saving ? "Creando…" : "Crear cliente"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Styles ---------------- */

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  clientPicker: {
    padding: "9px 12px",
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    outline: "none",
    minWidth: 220,
  },
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
    gap: 10,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "grab",
    userSelect: "none",
  },
  columnTitle: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  columnActions: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  columnEditBtn: {
    width: 24,
    height: 24,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    color: "#aaa",
    fontSize: 13,
    lineHeight: 1,
    cursor: "pointer",
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
  cardWaitingClient: {
    borderColor: "#7a5c1a",
    background: "#1d1a12",
  },
  clientBadge: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#e6b800",
    border: "1px solid #7a5c1a",
    borderRadius: 6,
    padding: "2px 8px",
    marginLeft: "auto",
  },
  cardThumb: {
    width: "100%",
    maxHeight: 120,
    objectFit: "cover",
    borderRadius: 6,
    display: "block",
  },
  imagePreview: {
    width: "100%",
    maxHeight: 180,
    objectFit: "contain",
    background: "#111",
    borderRadius: 8,
    border: "1px solid #2a2a2a",
  },
  imageActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  createdAt: {
    fontSize: 10,
    color: "#666",
    letterSpacing: 0.3,
  },
  cardDesc: { color: "#999", fontSize: 12, margin: 0, lineHeight: 1.4 },
  clientSelect: {
    width: "100%",
    padding: "5px 8px",
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    color: "#aaa",
    fontSize: 11,
    outline: "none",
  },
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
  help: { fontSize: 12, color: "#666" },
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
