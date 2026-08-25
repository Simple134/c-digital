"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kanban, dropColumnHandler, dropHandler } from "react-kanban-kit";
import type { BoardData, BoardItem } from "react-kanban-kit";
import { fmtDateTime } from "@/lib/format";
import {
  computeDeliveryStats,
  dueBadge,
  dueState,
  fmtDueDate,
  type DeliverableCard,
  type MemberDeliveryStats,
} from "@/lib/delivery";
import type { createClient } from "@/lib/supabase/client";
import type {
  Client,
  KanbanCard,
  KanbanColumn,
  Project,
  TeamMember,
} from "@/lib/supabase/types";
import useIsMobile from "./useIsMobile";

type Supabase = ReturnType<typeof createClient>;

/** Valores que producen los modales de crear/editar tarjeta. */
type CardFormValues = {
  title: string;
  description: string;
  priority: string;
  assignee_id: string;
  client_id: string;
  project_id: string;
  assigned_to_client: boolean;
  image_url: string | null;
  image_path: string | null;
  /** "YYYY-MM-DD" o "" si no se fijó fecha límite. */
  due_date: string;
};

const BUCKET = "kanban-attachments";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

// Valor especial del filtro de responsable: tareas que esperan al cliente.
const CLIENT_FILTER = "__client__";

/** Dueño de una columna. Los dos en null = columna global. */
type ColumnOwner = { clientId: string | null; assigneeId: string | null };

const COLUMNA_GLOBAL: ColumnOwner = { clientId: null, assigneeId: null };

/**
 * Traduce el dueño elegido a las dos columnas de la tabla.
 *
 * Se escriben SIEMPRE las dos, incluso la que va a null: el check
 * `kanban_columns_un_solo_dueno` prohíbe tener cliente y miembro a la vez, así
 * que al pasar una columna de un dueño al otro hay que limpiar el anterior en
 * el mismo UPDATE.
 */
function ownerPatch(owner: ColumnOwner) {
  return { client_id: owner.clientId, assignee_id: owner.assigneeId };
}

/** Valor del <select> de dueño: "" global, "c:<id>" cliente, "m:<id>" miembro. */
function ownerToValue(owner: ColumnOwner) {
  if (owner.clientId) return `c:${owner.clientId}`;
  if (owner.assigneeId) return `m:${owner.assigneeId}`;
  return "";
}

function valueToOwner(value: string): ColumnOwner {
  if (value.startsWith("c:"))
    return { clientId: value.slice(2), assigneeId: null };
  if (value.startsWith("m:"))
    return { clientId: null, assigneeId: value.slice(2) };
  return COLUMNA_GLOBAL;
}

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
          project_id: card.project_id,
          assigned_to_client: card.assigned_to_client,
          image_url: card.image_url,
          image_path: card.image_path,
          due_date: card.due_date,
          completed_at: card.completed_at,
          created_at: card.created_at,
        },
      };
    }
  }

  return data;
}

export default function KanbanBoard({
  supabase,
  // Cliente con el que entrar al tablero, enviado desde la ficha de Clientes:
  // filtra el tablero por él y deja el selector listo para crear su tarea.
  prefillClientId,
  // Proyecto con el que entrar al tablero desde la vista de Proyectos.
  prefillProjectId,
  // Tarjeta concreta a abrir al entrar, cuando el salto viene de una tarea de la
  // ficha del cliente y no del botón general de "asignar tarea".
  prefillCardId,
  onPrefillUsed,
}: {
  supabase: Supabase;
  prefillClientId?: string | null;
  prefillProjectId?: string | null;
  prefillCardId?: string | null;
  onPrefillUsed?: () => void;
}) {
  const [data, setData] = useState<BoardData | null>(null);
  // Se guardan las filas de columnas además del BoardData porque `is_done` no
  // cabe en el modelo de react-kanban-kit y hace falta para sellar las entregas.
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  // Resultado del último aviso por correo. Va aparte de `error` porque `error`
  // reemplaza todo el tablero, y un correo que no salió no debe ocultarlo.
  // `ok` distingue confirmación de fallo: pintar los dos en verde hizo que un
  // "no se pudo enviar" se leyera como un envío exitoso.
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [showStats, setShowStats] = useState(false);
  const [statsDays, setStatsDays] = useState(30);

  // Modales: qué columna recibe una tarjeta nueva / si se crea una columna.
  const [cardModalColumn, setCardModalColumn] = useState<BoardItem | null>(
    null,
  );
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCard, setEditingCard] = useState<BoardItem | null>(null);
  const [editingColumn, setEditingColumn] = useState<BoardItem | null>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [cols, cards, team, clientRows, projectRows] = await Promise.all([
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
      supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);
    if (
      cols.error ||
      cards.error ||
      team.error ||
      clientRows.error ||
      projectRows.error
    ) {
      setError(
        (
          cols.error ??
          cards.error ??
          team.error ??
          clientRows.error ??
          projectRows.error
        )?.message ?? "Error al cargar",
      );
      setLoading(false);
      return;
    }
    setMembers((team.data as TeamMember[]) ?? []);
    setClients((clientRows.data as Client[]) ?? []);
    setProjects((projectRows.data as Project[]) ?? []);
    setColumns((cols.data as KanbanColumn[]) ?? []);
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

  // La tarjeta a abrir se guarda pendiente: cuando llega la prop el tablero
  // todavía puede estar cargando, y `data[cardId]` no existiría aún.
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  useEffect(() => {
    if (!prefillClientId && !prefillProjectId && !prefillCardId) return;
    if (prefillClientId) setSelectedClientId(prefillClientId);
    if (prefillProjectId) setSelectedProjectId(prefillProjectId);
    if (prefillCardId) setPendingCardId(prefillCardId);
    onPrefillUsed?.();
  }, [prefillClientId, prefillProjectId, prefillCardId, onPrefillUsed]);

  useEffect(() => {
    if (!pendingCardId || !data) return;
    const card = data[pendingCardId];
    // Si la tarjeta ya no existe (la borraron entre pantallas) se descarta sin
    // más: abrir un modal vacío sería peor que no abrir nada.
    if (card) setEditingCard(card);
    setPendingCardId(null);
  }, [pendingCardId, data]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Los archivados salen de los selectores pero no del tablero: sus tarjetas
  // viejas siguen existiendo y deben poder verse.
  const activeClients = useMemo(
    () => clients.filter((c) => c.active !== false),
    [clients],
  );

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.status !== "archivado" &&
          (!selectedClientId || p.client_id === selectedClientId),
      ),
    [projects, selectedClientId],
  );

  useEffect(() => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (
      !project ||
      (selectedClientId && project.client_id !== selectedClientId)
    ) {
      setSelectedProjectId("");
    }
  }, [projects, selectedClientId, selectedProjectId]);

  const doneColumnIds = useMemo(
    () => new Set(columns.filter((c) => c.is_done).map((c) => c.id)),
    [columns],
  );

  // Dueño de cada columna a mano. Las filas ya vienen en `columns` (load hace
  // select("*")), así que no hace falta ninguna consulta extra para saber de
  // quién es una columna ni para pintar su etiqueta.
  const columnOwners = useMemo(
    () =>
      new Map(
        columns.map((c) => [
          c.id,
          { clientId: c.client_id ?? null, assigneeId: c.assignee_id ?? null },
        ]),
      ),
    [columns],
  );

  /**
   * Decide si una columna se muestra con los filtros activos.
   *
   * Global (sin dueño) = siempre visible. Con dueño solo se muestra si el
   * filtro apunta justo a él: así al ver un cliente no aparecen las columnas
   * privadas de otro cliente ni las de un miembro. `CLIENT_FILTER` no es un
   * miembro real (es "pendiente del cliente"), por eso no vale como dueño.
   */
  const isColumnVisible = useCallback(
    (columnId: string) => {
      const owner = columnOwners.get(columnId);
      if (!owner || (!owner.clientId && !owner.assigneeId)) return true;
      if (owner.clientId) return owner.clientId === selectedClientId;
      return (
        selectedMemberId !== CLIENT_FILTER &&
        owner.assigneeId === selectedMemberId
      );
    },
    [columnOwners, selectedClientId, selectedMemberId],
  );

  // Cuando se elige un cliente y/o un miembro del equipo, el tablero muestra
  // solo las tarjetas que cumplen ambos filtros y solo las columnas globales
  // más las del propio filtro. Sin filtro se ve todo (incluidas las columnas
  // con dueño) para que nada de trabajo quede escondido.
  const visibleData = useMemo(() => {
    if (!data || (!selectedClientId && !selectedProjectId && !selectedMemberId))
      return data;
    const visibleColumnIds = data.root.children.filter(isColumnVisible);
    const next: BoardData = {
      root: { ...data.root, children: visibleColumnIds },
    };
    for (const colId of visibleColumnIds) {
      const col = data[colId];
      const visibleChildren = col.children.filter((cardId) => {
        const content = data[cardId]?.content;
        if (selectedClientId && content?.client_id !== selectedClientId)
          return false;
        if (selectedProjectId && content?.project_id !== selectedProjectId)
          return false;
        if (selectedMemberId === CLIENT_FILTER) {
          if (!content?.assigned_to_client) return false;
        } else if (
          selectedMemberId &&
          content?.assignee_id !== selectedMemberId
        )
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
  }, [
    data,
    selectedClientId,
    selectedProjectId,
    selectedMemberId,
    isColumnVisible,
  ]);

  /**
   * Tarjetas aplanadas para el reporte. Respeta el filtro de cliente (permite
   * ver el rendimiento dentro de un proyecto) pero no el de responsable: el
   * panel ya desglosa por persona.
   */
  const deliveryStats = useMemo(() => {
    if (!data) return null;
    const cards: DeliverableCard[] = [];
    for (const colId of data.root.children) {
      for (const cardId of data[colId].children) {
        const content = data[cardId]?.content;
        if (!content) continue;
        if (selectedClientId && content.client_id !== selectedClientId)
          continue;
        if (selectedProjectId && content.project_id !== selectedProjectId)
          continue;
        cards.push({
          assignee_id: (content.assignee_id as string | null) ?? null,
          assigned_to_client: Boolean(content.assigned_to_client),
          due_date: (content.due_date as string | null) ?? null,
          completed_at: (content.completed_at as string | null) ?? null,
        });
      }
    }
    return computeDeliveryStats(cards, statsDays);
  }, [data, selectedClientId, selectedProjectId, statsDays]);

  /**
   * Pide al servidor que avise por correo a quien acabó de recibir la tarea.
   *
   * Se llama siempre *después* de que el cambio ya está guardado, y nunca se
   * espera su resultado para actualizar la UI: el correo es un extra, no parte
   * de la operación. Solo se envía el id de la tarjeta — el route handler relee
   * los datos y decide el destinatario, para que este cliente no pueda dirigir
   * correos a direcciones arbitrarias.
   */
  const notifyAssignment = useCallback(
    async (cardId: string, kind: "assignee" | "client") => {
      try {
        const res = await fetch("/api/kanban-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId, kind }),
        });
        const result = (await res.json()) as {
          sent?: boolean;
          reason?: string;
          recipientName?: string;
        };
        if (result.sent) {
          setNotice({
            text: `✓ Aviso enviado a ${result.recipientName ?? "el destinatario"}.`,
            ok: true,
          });
        } else if (result.reason && result.reason !== "self") {
          // "self" es una omisión esperada (te asignaste la tarea tú mismo):
          // avisar de ella sería ruido.
          setNotice({
            text: `⚠ Sin aviso por correo: ${result.reason}`,
            ok: false,
          });
        }
      } catch {
        setNotice({
          text: "⚠ Sin aviso por correo: no se pudo contactar al servidor.",
          ok: false,
        });
      }
    },
    [],
  );

  // El aviso es informativo: se descarta solo para no quedar pegado en pantalla.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

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
            project_id: item.content?.project_id ?? null,
            // Sin esto el upsert al arrastrar perdería la marca de "pendiente
            // del cliente" (volvería al default false).
            assigned_to_client: item.content?.assigned_to_client ?? false,
            image_url: item.content?.image_url ?? null,
            image_path: item.content?.image_path ?? null,
            due_date: item.content?.due_date ?? null,
            // Igual que assigned_to_client: sin enviarlo, el upsert al arrastrar
            // borraría el sello de entrega. handleCardMove ya dejó en `next` el
            // valor correcto para la tarjeta movida.
            completed_at: item.content?.completed_at ?? null,
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
        // Refleja el nuevo padre de la tarjeta movida y sella (o libera) la
        // entrega: entrar a una columna terminal marca `completed_at`, salir de
        // ella lo limpia, y reordenar dentro de la misma columna no lo toca.
        if (next[move.cardId]) {
          const card = next[move.cardId];
          const isDone = doneColumnIds.has(move.toColumnId);
          const wasDone = doneColumnIds.has(move.fromColumnId);
          const previous =
            (card.content?.completed_at as string | null) ?? null;
          const completedAt = isDone
            ? // Si ya venía sellada se respeta la marca original: mover una
              // tarjeta entre dos columnas terminales no reescribe la entrega.
              (previous ?? new Date().toISOString())
            : wasDone
              ? null
              : previous;
          next[move.cardId] = {
            ...card,
            parentId: move.toColumnId,
            content: { ...card.content, completed_at: completedAt },
          };
        }
        // Persiste origen y destino (o solo uno si es reordenamiento interno).
        void persistColumns(affected, next);
        return next;
      });
    },
    [persistColumns, doneColumnIds],
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
    const projectId = selectedProjectId || values.project_id || null;
    const waitingOnClient = clientId ? values.assigned_to_client : false;
    // Se pide el id de vuelta porque los avisos por correo se resuelven en el
    // servidor a partir de la tarjeta ya guardada.
    const { data: created, error } = await supabase
      .from("kanban_cards")
      .insert({
        column_id: cardModalColumn.id,
        title: values.title,
        description: values.description || null,
        priority: values.priority || null,
        assignee_id: values.assignee_id || null,
        client_id: clientId,
        project_id: projectId,
        // Solo tiene sentido esperar al cliente si la tarjeta le pertenece.
        assigned_to_client: waitingOnClient,
        image_url: values.image_url,
        image_path: values.image_path,
        due_date: values.due_date || null,
        // Una tarjeta creada directamente en una columna terminal ya está
        // entregada: sin esto quedaría en "Hecho" pero fuera del reporte.
        completed_at: doneColumnIds.has(cardModalColumn.id)
          ? new Date().toISOString()
          : null,
        sort_order: cardModalColumn.children.length,
      })
      .select("id")
      .single();
    if (error) {
      setError(error.message);
      // La imagen ya está en el bucket pero no hay fila que la referencie:
      // se limpia para no dejar huérfanos.
      await removeImageObject(values.image_path);
      return;
    }
    setCardModalColumn(null);
    // Una tarjeta nueva puede disparar los dos avisos a la vez: al responsable
    // interno y al cliente, si además queda pendiente de él.
    const newId = (created as { id: string } | null)?.id;
    if (newId) {
      if (values.assignee_id) void notifyAssignment(newId, "assignee");
      if (waitingOnClient) void notifyAssignment(newId, "client");
    }
    load();
  }

  async function updateCard(cardId: string, values: CardFormValues) {
    const patch = {
      title: values.title,
      description: values.description || null,
      priority: values.priority || null,
      assignee_id: values.assignee_id || null,
      client_id: values.client_id || null,
      project_id: values.project_id || null,
      assigned_to_client: values.client_id ? values.assigned_to_client : false,
      image_url: values.image_url,
      image_path: values.image_path,
      due_date: values.due_date || null,
    };
    // Estado anterior, para avisar solo de cambios reales de responsabilidad:
    // guardar el modal sin tocar el responsable no debe generar otro correo.
    const before = data?.[cardId]?.content;
    const previousAssignee = (before?.assignee_id as string | null) ?? null;
    const previouslyWaitingOnClient = Boolean(before?.assigned_to_client);
    const previousPath = data?.[cardId]?.content?.image_path as
      string | null | undefined;
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
    if (patch.assignee_id && patch.assignee_id !== previousAssignee) {
      void notifyAssignment(cardId, "assignee");
    }
    if (patch.assigned_to_client && !previouslyWaitingOnClient) {
      void notifyAssignment(cardId, "client");
    }
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
      ? { client_id: clientId, project_id: null }
      : { client_id: null, project_id: null, assigned_to_client: false };
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

  async function assignProject(cardId: string, projectId: string) {
    const project = projects.find((p) => p.id === projectId);
    const patch = {
      project_id: projectId || null,
      ...(project ? { client_id: project.client_id } : {}),
    };
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
    // Solo al activarlo: desmarcar significa que la pelota volvió al equipo.
    if (next) void notifyAssignment(cardId, "client");
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

  async function createClientRecord(name: string, email: string) {
    const count = clients.length;
    const { data: created, error } = await supabase
      .from("clients")
      .insert({ name, email: email || null, sort_order: count })
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

  async function updateClientRecord(
    clientId: string,
    name: string,
    email: string,
  ) {
    const { error } = await supabase
      .from("clients")
      .update({ name, email: email || null })
      .eq("id", clientId);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingClient(null);
    setClients((current) =>
      current.map((c) =>
        c.id === clientId ? { ...c, name, email: email || null } : c,
      ),
    );
  }

  async function createColumn(
    title: string,
    isDone: boolean,
    owner: ColumnOwner,
  ) {
    const count = data?.root.children.length ?? 0;
    const { error } = await supabase.from("kanban_columns").insert({
      title,
      sort_order: count,
      is_done: isDone,
      ...ownerPatch(owner),
    });
    if (error) {
      setError(error.message);
      return;
    }
    setColumnModalOpen(false);
    load();
  }

  async function updateColumn(
    columnId: string,
    title: string,
    isDone: boolean,
    owner: ColumnOwner,
  ) {
    const { error } = await supabase
      .from("kanban_columns")
      .update({ title, is_done: isDone, ...ownerPatch(owner) })
      .eq("id", columnId);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingColumn(null);
    setColumns((current) =>
      current.map((c) =>
        c.id === columnId
          ? {
              ...c,
              title,
              is_done: isDone,
              client_id: owner.clientId,
              assignee_id: owner.assigneeId,
            }
          : c,
      ),
    );
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

  /**
   * Elimina una columna del tablero conservando su trabajo.
   *
   * Autorización: esta ruta escribe con el cliente del navegador, igual que
   * crear/renombrar/reordenar columnas, así que la protección real es la RLS de
   * `kanban_columns` (policy "auth write kanban_columns" → `is_team_member()`,
   * el equivalente en SQL de `isTeamMember()`). Un cliente del panel tiene
   * sesión pero no fila en `team_members`, así que el DELETE le es denegado.
   *
   * Tarjetas: la FK `kanban_cards_column_id_fkey` es ON DELETE CASCADE, así que
   * borrar la columna a secas se llevaría sus tarjetas por delante. Eso no es lo
   * que se quiere al reorganizar un tablero: lo que sobra es la columna, no el
   * trabajo. Por eso las tarjetas se mueven ANTES del delete y el cascade se
   * queda sin nada que arrastrar. No se toca `completed_at`: una tarea terminada
   * lo sigue estando aunque su columna deje de existir.
   *
   * No se permite borrar la última columna: el tablero quedaría inutilizable y
   * /api/panel/task necesita que exista alguna columna con `is_done = false`.
   */
  async function deleteColumn(column: BoardItem) {
    const columnIds = data?.root.children ?? [];
    if (columnIds.length <= 1) {
      setError(
        "No se puede eliminar la única columna del tablero: crea otra antes de quitar esta.",
      );
      return;
    }
    // Las columnas pendientes (is_done = false) no son intercambiables con las
    // terminales: /api/panel/task busca una pendiente para colocar ahí lo que
    // pide el cliente, y sin ninguna responde 500. Solo cuentan las globales:
    // una columna pendiente con dueño no sirve de destino para los demás.
    const esGlobalColumna = (id: string) => {
      const o = columnOwners.get(id);
      return !o?.clientId && !o?.assigneeId;
    };
    if (!doneColumnIds.has(column.id) && esGlobalColumna(column.id)) {
      const pendientes = columnIds.filter(
        (id) => !doneColumnIds.has(id) && esGlobalColumna(id),
      );
      if (pendientes.length <= 1) {
        setError(
          "No se puede eliminar la última columna pendiente del equipo: es donde entran las tareas que piden los clientes.",
        );
        return;
      }
    }

    /**
     * Destino de las tarjetas. La columna vecina a secas no sirve: con columnas
     * por dueño eso puede acabar metiendo el trabajo de un cliente en la
     * columna privada de otro (o en la de un miembro), donde nadie lo vería al
     * filtrar. Así que se busca una columna *compatible*, en este orden:
     *   1) una del mismo dueño que la que se borra (el trabajo se queda en casa),
     *   2) una global (la ve todo el equipo: nunca es un destino incorrecto).
     * Dentro de cada grupo se prefiere la vecina anterior, y si no hay, la
     * siguiente, para que el resultado sea predecible.
     */
    const cardIds = data?.[column.id]?.children ?? [];
    const pos = columnIds.indexOf(column.id);
    const owner = columnOwners.get(column.id);
    // Vecinas ordenadas por cercanía: primero hacia atrás, luego hacia delante.
    const candidatos = [
      ...columnIds.slice(0, pos).reverse(),
      ...columnIds.slice(pos + 1),
    ];
    const esDelMismoDueno = (id: string) => {
      const o = columnOwners.get(id);
      return (
        (o?.clientId ?? null) === (owner?.clientId ?? null) &&
        (o?.assigneeId ?? null) === (owner?.assigneeId ?? null)
      );
    };
    const destinoId =
      candidatos.find(esDelMismoDueno) ?? candidatos.find(esGlobalColumna);
    const destino = destinoId ? data?.[destinoId] : undefined;

    if (cardIds.length > 0 && !destino) {
      setError(
        `No hay otra columna compatible a la que mover las ${cardIds.length} tarjetas de «${column.title}», así que no se eliminó.`,
      );
      return;
    }

    // La confirmación dice el nombre de la columna, cuántas tarjetas tiene y a
    // dónde se van: eso es exactamente lo que se está decidiendo.
    const mensaje =
      cardIds.length > 0
        ? `¿Eliminar la columna «${column.title}»?\n\nSus ${cardIds.length} tarjeta${
            cardIds.length === 1 ? "" : "s"
          } se ${
            cardIds.length === 1 ? "moverá" : "moverán"
          } a «${destino!.title}»; no se pierde ningún trabajo.`
        : `¿Eliminar la columna «${column.title}»?\n\nNo tiene ninguna tarjeta.`;
    if (!window.confirm(mensaje)) return;

    if (cardIds.length > 0) {
      // Al final del destino, para no chocar con el orden que ya tiene.
      const base = destino!.children.length;
      const movimientos = await Promise.all(
        cardIds.map((id, i) =>
          supabase
            .from("kanban_cards")
            .update({ column_id: destinoId, sort_order: base + i })
            .eq("id", id),
        ),
      );
      const fallo = movimientos.find((m) => m.error);
      if (fallo?.error) {
        // Sin mover todas las tarjetas no se borra nada: el cascade se llevaría
        // justo las que se quedaron atrás.
        setError(
          `No se pudieron mover las tarjetas, así que la columna «${column.title}» no se eliminó: ${fallo.error.message}`,
        );
        load();
        return;
      }
    }

    const { error } = await supabase
      .from("kanban_columns")
      .delete()
      .eq("id", column.id);
    if (error) {
      setError(
        `No se pudo eliminar la columna «${column.title}»: ${error.message}`,
      );
      load();
      return;
    }
    load();
  }

  async function deleteCard(cardId: string) {
    if (!window.confirm("¿Eliminar esta tarjeta?")) return;
    const imagePath = data?.[cardId]?.content?.image_path as
      string | null | undefined;
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
      <div
        style={{
          ...styles.toolbar,
          ...(isMobile ? { flexWrap: "wrap", gap: 8 } : null),
        }}
      >
        <select
          style={{
            ...styles.clientPicker,
            ...(isMobile
              ? { flex: "1 1 100%", minWidth: 0, fontSize: 16, minHeight: 40 }
              : null),
          }}
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">Todos (vista interna)</option>
          {/* Un cliente archivado solo aparece si es el que ya está filtrado:
              así el filtro no se vacía solo al archivarlo. */}
          {(selectedClient && selectedClient.active === false
            ? [...activeClients, selectedClient]
            : activeClients
          ).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.active === false ? " (archivado)" : ""}
            </option>
          ))}
        </select>
        <select
          style={{
            ...styles.clientPicker,
            ...(isMobile
              ? { flex: "1 1 100%", minWidth: 0, fontSize: 16, minHeight: 40 }
              : null),
          }}
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          disabled={!selectedClientId}
        >
          <option value="">
            {selectedClientId ? "Todos los proyectos" : "Elige un cliente"}
          </option>
          {(selectedProject && selectedProject.status === "archivado"
            ? [...activeProjects, selectedProject]
            : activeProjects
          ).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.status === "archivado" ? " (archivado)" : ""}
            </option>
          ))}
        </select>
        <select
          style={{
            ...styles.clientPicker,
            ...(isMobile
              ? { flex: "1 1 100%", minWidth: 0, fontSize: 16, minHeight: 40 }
              : null),
          }}
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
        <button
          style={{ ...styles.ghostBtn, ...(isMobile ? styles.touchBtn : null) }}
          onClick={() => setClientModalOpen(true)}
        >
          + Nuevo cliente
        </button>
        {selectedClient && (
          <button
            style={{
              ...styles.ghostBtn,
              ...(isMobile ? styles.touchBtn : null),
            }}
            onClick={() => setEditingClient(selectedClient)}
            title={
              selectedClient.email
                ? `Avisos a ${selectedClient.email}`
                : "Sin correo: no recibirá avisos"
            }
          >
            {selectedClient.email ? "✎ Cliente" : "⚠ Añadir correo"}
          </button>
        )}
        {selectedClient && (
          <button
            style={{
              ...styles.ghostBtn,
              ...(isMobile ? styles.touchBtn : null),
            }}
            onClick={copyPublicLink}
          >
            {linkCopied ? "¡Link copiado!" : "Copiar link público"}
          </button>
        )}
        <button
          style={{ ...styles.ghostBtn, ...(isMobile ? styles.touchBtn : null) }}
          onClick={() => setShowStats((v) => !v)}
          aria-expanded={showStats}
        >
          {showStats ? "▾ Ocultar rendimiento" : "▸ Rendimiento"}
        </button>
      </div>

      {notice && (
        <div style={notice.ok ? styles.noticeBox : styles.noticeBoxWarn}>
          {notice.text}
        </div>
      )}

      {showStats && deliveryStats && (
        <DeliveryPanel
          stats={deliveryStats}
          members={members}
          days={statsDays}
          onDaysChange={setStatsDays}
        />
      )}

      <div
        className="cdg-kanban-board"
        // En teléfono la barra de filtros se apila y hay que descontar más
        // alto; las columnas siguen recorriéndose de lado como en escritorio.
        style={{
          flex: 1,
          minHeight: isMobile ? 420 : 0,
          height: isMobile ? "calc(100dvh - 300px)" : "calc(100vh - 220px)",
        }}
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
                  projects={projects}
                  showClientSelector={!selectedClientId}
                  showProjectSelector={!selectedProjectId}
                  onDelete={() => deleteCard(card.id)}
                  onAssignClient={(clientId) => assignClient(card.id, clientId)}
                  onAssignProject={(projectId) =>
                    assignProject(card.id, projectId)
                  }
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
              <span
                style={styles.columnTitle}
                title="Arrastra para mover columna"
              >
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
                <button
                  type="button"
                  style={styles.columnEditBtn}
                  title="Eliminar columna"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteColumn(column);
                  }}
                >
                  ✕
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
          clients={activeClients}
          projects={activeProjects}
          lockedClientId={selectedClientId || undefined}
          lockedProjectId={selectedProjectId || undefined}
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
          projects={projects}
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
          clients={activeClients}
          members={members}
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
          initialIsDone={doneColumnIds.has(editingColumn.id)}
          initialOwner={columnOwners.get(editingColumn.id) ?? COLUMNA_GLOBAL}
          clients={activeClients}
          members={members}
          onClose={() => setEditingColumn(null)}
          onCreate={(title, isDone, owner) =>
            updateColumn(editingColumn.id, title, isDone, owner)
          }
        />
      )}

      {clientModalOpen && (
        <ClientModal
          onClose={() => setClientModalOpen(false)}
          onSave={createClientRecord}
        />
      )}

      {editingClient && (
        <ClientModal
          title="Editar cliente"
          submitLabel="Guardar cambios"
          initialName={editingClient.name}
          initialEmail={editingClient.email ?? ""}
          onClose={() => setEditingClient(null)}
          onSave={(name, email) =>
            updateClientRecord(editingClient.id, name, email)
          }
        />
      )}
    </div>
  );
}

/* ---------------- Rendimiento ---------------- */

const STATS_RANGES = [
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
  { days: 365, label: "1 año" },
];

/** Color del % de puntualidad. Verde ≥85, ámbar ≥60, rojo por debajo. */
function rateColor(rate: number): string {
  if (rate >= 85) return "#4ade80";
  if (rate >= 60) return "#e6b800";
  return "#ff8080";
}

/**
 * Rendimiento de entrega por miembro. Solo lista a quien tiene actividad en el
 * rango, y muestra siempre el denominador (`X de Y medibles`) para que un 100%
 * sobre una sola tarjeta no se lea como un 100% sobre veinte.
 */
function DeliveryPanel({
  stats,
  members,
  days,
  onDaysChange,
}: {
  stats: Map<string, MemberDeliveryStats>;
  members: TeamMember[];
  days: number;
  onDaysChange: (days: number) => void;
}) {
  const rows = members
    .map((member) => ({ member, stat: stats.get(member.id) }))
    .filter(
      (r) => r.stat && (r.stat.delivered > 0 || r.stat.openOverdue > 0),
    ) as { member: TeamMember; stat: MemberDeliveryStats }[];

  return (
    <div style={styles.statsPanel}>
      <div style={styles.statsHeader}>
        <span style={styles.statsTitle}>Entrega a tiempo</span>
        <span style={styles.statsRanges}>
          {STATS_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => onDaysChange(r.days)}
              style={{
                ...styles.rangeBtn,
                ...(r.days === days ? styles.rangeBtnActive : null),
              }}
            >
              {r.label}
            </button>
          ))}
        </span>
      </div>

      {rows.length === 0 ? (
        <p style={styles.help}>
          Sin entregas en este rango. Asigna una fecha límite a las tarjetas y
          muévelas a una columna marcada como terminal para empezar a medir.
        </p>
      ) : (
        <div style={styles.statsGrid}>
          {rows.map(({ member, stat }) => (
            <div key={member.id} style={styles.statCard}>
              <span style={styles.statName}>{member.name}</span>
              {stat.onTimeRate === null ? (
                <span style={styles.statRateEmpty}>—</span>
              ) : (
                <span
                  style={{
                    ...styles.statRate,
                    color: rateColor(stat.onTimeRate),
                  }}
                >
                  {stat.onTimeRate}%
                </span>
              )}
              <span style={styles.statDetail}>
                {stat.onTimeRate === null
                  ? `${stat.delivered} entregadas, ninguna con fecha límite`
                  : `${stat.onTime} de ${stat.measurable} medibles`}
              </span>
              {stat.late > 0 && (
                <span style={styles.statLate}>{stat.late} tarde</span>
              )}
              {stat.openOverdue > 0 && (
                <span style={styles.statOverdue}>
                  {stat.openOverdue} atrasada
                  {stat.openOverdue === 1 ? "" : "s"} sin entregar
                </span>
              )}
              {stat.delivered > stat.measurable && (
                <span style={styles.statExcluded}>
                  {stat.delivered - stat.measurable} sin fecha (fuera del %)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Card ---------------- */

function Card({
  card,
  members,
  clients,
  projects,
  showClientSelector,
  showProjectSelector,
  onDelete,
  onAssignClient,
  onAssignProject,
  onToggleAssignedToClient,
  onEdit,
}: {
  card: BoardItem;
  members: TeamMember[];
  clients: Client[];
  projects: Project[];
  showClientSelector: boolean;
  showProjectSelector: boolean;
  onDelete: () => void;
  onAssignClient: (clientId: string) => void;
  onAssignProject: (projectId: string) => void;
  onToggleAssignedToClient: (next: boolean) => void;
  onEdit: () => void;
}) {
  const priority = card.content?.priority as string | undefined;
  const accent = priority ? (PRIORITY_COLOR[priority] ?? "#555") : "#555";
  const assignee = members.find((m) => m.id === card.content?.assignee_id);
  const clientId = card.content?.client_id as string | null | undefined;
  const client = clients.find((c) => c.id === clientId);
  const projectId = card.content?.project_id as string | null | undefined;
  const project = projects.find((p) => p.id === projectId);
  const clientProjects = clientId
    ? projects.filter(
        (p) => p.client_id === clientId && p.status !== "archivado",
      )
    : [];
  const waitingOnClient = Boolean(card.content?.assigned_to_client);
  const createdAt = fmtDateTime(card.content?.created_at as string | undefined);
  const dueDate = card.content?.due_date as string | null | undefined;
  const completedAt = card.content?.completed_at as string | null | undefined;
  const badge = dueBadge(dueState(dueDate, completedAt), dueDate);
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
        {badge && (
          <span
            style={{
              ...styles.dueBadge,
              color: badge.color,
              borderColor: badge.color,
            }}
            title={
              completedAt
                ? `Entregada el ${fmtDateTime(completedAt)}`
                : `Fecha límite: ${fmtDueDate(dueDate)}`
            }
          >
            {badge.label}
          </span>
        )}
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
        {project && <span style={styles.clientBadge}>{project.name}</span>}
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
      {showProjectSelector && clientProjects.length > 0 && (
        <select
          style={styles.clientSelect}
          value={(card.content?.project_id as string) ?? ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onAssignProject(e.target.value)}
        >
          <option value="">Sin proyecto</option>
          {clientProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
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
  const isMobile = useIsMobile();
  return (
    <div
      style={{ ...styles.overlay, ...(isMobile ? { padding: 0 } : null) }}
      onClick={onClose}
    >
      <div
        // En teléfono el modal ocupa la pantalla entera: el cuerpo lleva su
        // propio scroll y la cabecera con la ✕ queda siempre a la vista.
        style={{
          ...styles.modal,
          ...(isMobile
            ? {
                width: "100%",
                height: "100dvh",
                maxHeight: "100dvh",
                borderRadius: 0,
              }
            : null),
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
 * Fecha límite de entrega. Es opcional a propósito: las tarjetas sin fecha
 * quedan fuera del porcentaje de puntualidad en lugar de contar como cumplidas,
 * así que no vale la pena forzar una fecha inventada en cada captura rápida.
 */
function DueDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const isMobile = useIsMobile();
  return (
    <label style={styles.field}>
      <span style={styles.label}>Fecha límite</span>
      <input
        type="date"
        style={{ ...styles.input, ...(isMobile ? styles.touchInput : null) }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span style={styles.help}>
        Opcional. Solo las tarjetas con fecha límite entran al reporte de
        entrega a tiempo. El plazo vence al final del día.
      </span>
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
  onUpload: (
    file: File,
  ) => Promise<{ image_path: string; image_url: string } | null>;
  onChange: (next: {
    image_url: string | null;
    image_path: string | null;
  }) => void;
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

      <span style={styles.help}>El cliente la verá en su link público.</span>
    </div>
  );
}

function CardModal({
  columnTitle,
  members,
  clients,
  projects,
  lockedClientId,
  lockedProjectId,
  onClose,
  onCreate,
  onUpload,
  onRemoveObject,
}: {
  columnTitle: string;
  members: TeamMember[];
  clients: Client[];
  projects: Project[];
  lockedClientId?: string;
  lockedProjectId?: string;
  onClose: () => void;
  onCreate: (v: CardFormValues) => Promise<void>;
  onUpload: (
    file: File,
  ) => Promise<{ image_path: string; image_url: string } | null>;
  onRemoveObject: (path: string | null) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedToClient, setAssignedToClient] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [image, setImage] = useState<{
    image_url: string | null;
    image_path: string | null;
  }>({ image_url: null, image_path: null });
  const [saving, setSaving] = useState(false);

  // El cliente efectivo: el fijado por el filtro del tablero o el elegido aquí.
  const effectiveClientId = lockedClientId ?? clientId;
  const effectiveProjectId = lockedProjectId ?? projectId;
  const availableProjects = projects.filter(
    (p) => !effectiveClientId || p.client_id === effectiveClientId,
  );

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee_id: assigneeId,
      client_id: clientId,
      project_id: projectId,
      assigned_to_client: assignedToClient,
      due_date: dueDate,
      ...image,
    });
    setSaving(false);
  }

  const isMobile = useIsMobile();
  const inp = isMobile
    ? { ...styles.input, ...styles.touchInput }
    : styles.input;
  const body = isMobile
    ? { ...styles.modalBody, padding: 16 }
    : styles.modalBody;
  const gbtn = isMobile
    ? { ...styles.ghostBtn, ...styles.touchBtn }
    : styles.ghostBtn;
  const pbtn = isMobile
    ? { ...styles.primaryBtn, ...styles.touchBtn }
    : styles.primaryBtn;
  return (
    <Modal title={`Nueva tarjeta · ${columnTitle}`} onClose={onClose}>
      <div style={body}>
        <label style={styles.field}>
          <span style={styles.label}>Título</span>
          <input
            style={inp}
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Descripción</span>
          <textarea
            style={{ ...inp, minHeight: 90, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Prioridad</span>
          <select
            style={inp}
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
            style={inp}
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

        <DueDateField value={dueDate} onChange={setDueDate} />

        {!lockedClientId && (
          <label style={styles.field}>
            <span style={styles.label}>Cliente</span>
            <select
              style={inp}
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId("");
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

        {!lockedProjectId && availableProjects.length > 0 && (
          <label style={styles.field}>
            <span style={styles.label}>Proyecto</span>
            <select
              style={inp}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Sin proyecto</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {(effectiveClientId || effectiveProjectId) && (
          <ClientResponsibleField
            checked={assignedToClient}
            onChange={setAssignedToClient}
          />
        )}
      </div>

      <div style={styles.modalFooter}>
        <button onClick={onClose} style={gbtn}>
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={saving || !title.trim()}
          style={{
            ...pbtn,
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
  projects,
  onClose,
  onSave,
  onUpload,
  onRemoveObject,
}: {
  card: BoardItem;
  members: TeamMember[];
  clients: Client[];
  projects: Project[];
  onClose: () => void;
  onSave: (v: CardFormValues) => Promise<void>;
  onUpload: (
    file: File,
  ) => Promise<{ image_path: string; image_url: string } | null>;
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
  const [projectId, setProjectId] = useState(
    (card.content?.project_id as string) ?? "",
  );
  const [assignedToClient, setAssignedToClient] = useState(
    Boolean(card.content?.assigned_to_client),
  );
  // Un `date` de Postgres ya viene como "YYYY-MM-DD", el formato que espera
  // <input type="date"> — no hace falta convertir nada.
  const [dueDate, setDueDate] = useState(
    (card.content?.due_date as string | null) ?? "",
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
      project_id: projectId,
      assigned_to_client: assignedToClient,
      due_date: dueDate,
      ...image,
    });
    setSaving(false);
  }

  const isMobile = useIsMobile();
  const inp = isMobile
    ? { ...styles.input, ...styles.touchInput }
    : styles.input;
  const body = isMobile
    ? { ...styles.modalBody, padding: 16 }
    : styles.modalBody;
  const gbtn = isMobile
    ? { ...styles.ghostBtn, ...styles.touchBtn }
    : styles.ghostBtn;
  const pbtn = isMobile
    ? { ...styles.primaryBtn, ...styles.touchBtn }
    : styles.primaryBtn;
  const availableProjects = projects.filter(
    (p) => p.client_id === clientId && p.status !== "archivado",
  );
  return (
    <Modal title="Editar tarjeta" onClose={onClose}>
      <div style={body}>
        <label style={styles.field}>
          <span style={styles.label}>Título</span>
          <input
            style={inp}
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Descripción</span>
          <textarea
            style={{ ...inp, minHeight: 90, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Prioridad</span>
          <select
            style={inp}
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
            style={inp}
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

        <DueDateField value={dueDate} onChange={setDueDate} />

        <label style={styles.field}>
          <span style={styles.label}>Cliente</span>
          <select
            style={inp}
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setProjectId("");
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

        {availableProjects.length > 0 && (
          <label style={styles.field}>
            <span style={styles.label}>Proyecto</span>
            <select
              style={inp}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Sin proyecto</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}

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

        {typeof card.content?.completed_at === "string" && (
          <span style={styles.help}>
            Entregada el {fmtDateTime(card.content.completed_at)}
            {card.content.due_date
              ? ` · vencía el ${fmtDueDate(card.content.due_date as string)}`
              : ""}
          </span>
        )}
      </div>

      <div style={styles.modalFooter}>
        <button onClick={onClose} style={gbtn}>
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={saving || !title.trim()}
          style={{
            ...pbtn,
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
  initialIsDone = false,
  initialOwner = COLUMNA_GLOBAL,
  clients,
  members,
  submitLabel,
  savingLabel,
  onClose,
  onCreate,
}: {
  title: string;
  initialTitle?: string;
  initialIsDone?: boolean;
  initialOwner?: ColumnOwner;
  clients: Client[];
  members: TeamMember[];
  submitLabel: string;
  savingLabel: string;
  onClose: () => void;
  onCreate: (
    title: string,
    isDone: boolean,
    owner: ColumnOwner,
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [isDone, setIsDone] = useState(initialIsDone);
  const [ownerValue, setOwnerValue] = useState(ownerToValue(initialOwner));
  const [saving, setSaving] = useState(false);

  const owner = valueToOwner(ownerValue);
  const ownerName = owner.clientId
    ? clients.find((c) => c.id === owner.clientId)?.name
    : owner.assigneeId
      ? members.find((m) => m.id === owner.assigneeId)?.name
      : null;

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate(title.trim(), isDone, owner);
    setSaving(false);
  }

  const isMobile = useIsMobile();
  const inp = isMobile
    ? { ...styles.input, ...styles.touchInput }
    : styles.input;
  const body = isMobile
    ? { ...styles.modalBody, padding: 16 }
    : styles.modalBody;
  const gbtn = isMobile
    ? { ...styles.ghostBtn, ...styles.touchBtn }
    : styles.ghostBtn;
  const pbtn = isMobile
    ? { ...styles.primaryBtn, ...styles.touchBtn }
    : styles.primaryBtn;
  return (
    <Modal title={modalTitle} onClose={onClose}>
      <div style={body}>
        <label style={styles.field}>
          <span style={styles.label}>Título</span>
          <input
            style={inp}
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Dueño</span>
          <select
            style={inp}
            value={ownerValue}
            onChange={(e) => setOwnerValue(e.target.value)}
          >
            <option value="">Columna del tablero (todos)</option>
            {clients.map((c) => (
              <option key={c.id} value={`c:${c.id}`}>
                Cliente — {c.name}
              </option>
            ))}
            {members.map((m) => (
              <option key={m.id} value={`m:${m.id}`}>
                Equipo — {m.name}
              </option>
            ))}
          </select>
          <span style={styles.help}>
            {ownerName
              ? `Solo aparecerá al ver el tablero completo o al filtrar por ${ownerName}.`
              : "Visible siempre, con cualquier filtro activo."}
          </span>
        </label>

        <div style={styles.field}>
          <span style={styles.label}>Estado</span>
          <Switch
            checked={isDone}
            onChange={setIsDone}
            label="Columna de entrega"
          />
          <span style={styles.help}>
            Al mover una tarjeta a esta columna se registra su entrega y empieza
            a contar en el reporte de rendimiento.
          </span>
        </div>
      </div>
      <div style={styles.modalFooter}>
        <button onClick={onClose} style={gbtn}>
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={saving || !title.trim()}
          style={{
            ...pbtn,
            opacity: saving || !title.trim() ? 0.5 : 1,
          }}
        >
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </Modal>
  );
}

/** Sirve para crear y para editar: la diferencia son solo las etiquetas. */
function ClientModal({
  title = "Nuevo cliente",
  submitLabel = "Crear cliente",
  initialName = "",
  initialEmail = "",
  onClose,
  onSave,
}: {
  title?: string;
  submitLabel?: string;
  initialName?: string;
  initialEmail?: string;
  onClose: () => void;
  onSave: (name: string, email: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), email.trim());
    setSaving(false);
  }

  const isMobile = useIsMobile();
  const inp = isMobile
    ? { ...styles.input, ...styles.touchInput }
    : styles.input;
  const body = isMobile
    ? { ...styles.modalBody, padding: 16 }
    : styles.modalBody;
  const gbtn = isMobile
    ? { ...styles.ghostBtn, ...styles.touchBtn }
    : styles.ghostBtn;
  const pbtn = isMobile
    ? { ...styles.primaryBtn, ...styles.touchBtn }
    : styles.primaryBtn;
  return (
    <Modal title={title} onClose={onClose}>
      <div style={body}>
        <label style={styles.field}>
          <span style={styles.label}>Nombre del cliente</span>
          <input
            style={inp}
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

        <label style={styles.field}>
          <span style={styles.label}>Correo</span>
          <input
            type="email"
            style={inp}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <span style={styles.help}>
            Se le avisa a esta dirección cuando una tarea queda marcada como
            pendiente de su parte. Sin correo, el aviso simplemente se omite.
          </span>
        </label>
      </div>
      <div style={styles.modalFooter}>
        <button onClick={onClose} style={gbtn}>
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={saving || !name.trim()}
          style={{
            ...pbtn,
            opacity: saving || !name.trim() ? 0.5 : 1,
          }}
        >
          {saving ? "Guardando…" : submitLabel}
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
  noticeBox: {
    background: "#14201c",
    border: "1px solid #1f3a32",
    color: "#8fd8c0",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 12,
  },
  noticeBoxWarn: {
    background: "#231c10",
    border: "1px solid #4a3a18",
    color: "#e6c078",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 12,
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
  dueBadge: {
    fontSize: 10,
    letterSpacing: 0.3,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: "2px 8px",
    whiteSpace: "nowrap",
  },
  assignee: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#bbb",
    marginLeft: "auto",
  },
  statsPanel: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  statsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  statsTitle: { fontSize: 13, fontWeight: 600, color: "#fff" },
  statsRanges: { display: "inline-flex", gap: 6 },
  rangeBtn: {
    padding: "4px 10px",
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    color: "#888",
    fontSize: 11,
    cursor: "pointer",
  },
  rangeBtnActive: {
    borderColor: "#4a4a4a",
    color: "#fff",
    background: "#1c1c1c",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 10,
  },
  statCard: {
    background: "#161616",
    border: "1px solid #232323",
    borderRadius: 8,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statName: { fontSize: 12, color: "#bbb", fontWeight: 600 },
  statRate: { fontSize: 26, fontWeight: 700, lineHeight: 1.1 },
  statRateEmpty: {
    fontSize: 26,
    fontWeight: 700,
    color: "#555",
    lineHeight: 1.1,
  },
  statDetail: { fontSize: 11, color: "#777" },
  statLate: { fontSize: 11, color: "#ff8080" },
  statOverdue: { fontSize: 11, color: "#e6b800" },
  statExcluded: { fontSize: 11, color: "#666" },
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
  touchBtn: { minHeight: 40, fontSize: 14 },
  touchInput: { fontSize: 16, minHeight: 40 },
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
