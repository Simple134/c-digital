"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { fmtDateTime } from "@/lib/format";
import {
  computeTotals,
  fmtMoney,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/invoices";
import { siteOrigin } from "@/lib/site";
import type { createClient } from "@/lib/supabase/client";
import type {
  Client,
  ClientFile,
  ClientFileKind,
  Proposal,
  Invoice,
  InvoiceItem,
  InvoicePayment,
  KanbanCard,
} from "@/lib/supabase/types";
import useIsMobile from "./useIsMobile";

type Supabase = ReturnType<typeof createClient>;

type ClientInvoice = Invoice & {
  invoice_items: InvoiceItem[];
  invoice_payments: InvoicePayment[];
};

/**
 * Un campo adicional en el formulario, como par ordenado.
 *
 * En la base de datos es un objeto jsonb, pero un objeto no sirve para editar:
 * renombrar una etiqueta letra por letra iría perdiendo y recreando la clave, y
 * dos filas en blanco colisionarían en la misma clave vacía. La lista se
 * convierte a objeto solo al guardar.
 */
type CustomField = { key: string; value: string };

/** Los campos editables de la ficha, tal como viven en el formulario. */
type Draft = {
  name: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  tax_id: string;
  address: string;
  website: string;
  birth_date: string;
  notes: string;
  active: boolean;
  custom: CustomField[];
};

const emptyDraft = (): Draft => ({
  name: "",
  company: "",
  contact_name: "",
  email: "",
  phone: "",
  tax_id: "",
  address: "",
  website: "",
  birth_date: "",
  notes: "",
  active: true,
  custom: [],
});

const toDraft = (c: Client): Draft => ({
  name: c.name,
  company: c.company ?? "",
  contact_name: c.contact_name ?? "",
  email: c.email ?? "",
  phone: c.phone ?? "",
  tax_id: c.tax_id ?? "",
  address: c.address ?? "",
  website: c.website ?? "",
  birth_date: c.birth_date ?? "",
  notes: c.notes ?? "",
  active: c.active !== false,
  custom: Object.entries(c.custom_fields ?? {}).map(([key, value]) => ({
    key,
    value: String(value),
  })),
});

/** Texto vacío → null: la BD distingue "sin dato" de "cadena vacía". */
const nil = (v: string) => (v.trim() ? v.trim() : null);

/**
 * Normaliza la URL para poder enlazarla sin volver a validarla.
 *
 * Se guarda con esquema porque un `href="cliente.com"` lo resuelve el navegador
 * como ruta relativa del dashboard, no como sitio externo. Devuelve `undefined`
 * si no es una URL válida, para que el formulario pueda rechazarla.
 */
function normalizeUrl(raw: string): string | null | undefined {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    // Un texto sin punto ("hola") pasa el constructor como hostname válido.
    if (!url.hostname.includes(".")) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/** Las filas del editor → el objeto jsonb. Las etiquetas vacías se descartan. */
function customToObject(fields: CustomField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key, value } of fields) {
    const label = key.trim();
    if (label) out[label] = value.trim();
  }
  return out;
}

/** "1990-05-14" → "14 de mayo". El año no interesa para felicitar. */
function fmtBirthday(date: string): string {
  const [, month, day] = date.split("-");
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const name = months[Number(month) - 1];
  return name ? `${Number(day)} de ${name}` : date;
}

/**
 * Clientes: la lista, la ficha completa y los atajos para facturar o asignarle
 * una tarea con sus datos ya cargados.
 *
 * Vive aparte del CRUD genérico de `resources.ts` porque la ficha cruza tres
 * tablas (`clients`, `invoices`, `kanban_cards`) y ese CRUD solo lee una.
 */
export default function Clientes({
  supabase,
  onCreateInvoice,
  onAssignTask,
  onOpenTask,
}: {
  supabase: Supabase;
  onCreateInvoice: (clientId: string) => void;
  onAssignTask: (clientId: string) => void;
  /** Lleva al Kanban filtrado por el cliente y abre esa tarjeta. */
  onOpenTask: (clientId: string, cardId: string) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  // `"new"` = ficha en blanco; un id = editando ese cliente.
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const [copied, setCopied] = useState(false);
  // Resultado del último recordatorio. `ok` separa el envío del fallo: pintar
  // los dos igual haría que un "no se pudo enviar" se leyera como enviado.
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [cli, inv, kanban, cf, props] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase
        .from("invoices")
        .select("*, invoice_items(*), invoice_payments(*)")
        .eq("party_type", "client")
        .order("issued_at", { ascending: false }),
      supabase.from("kanban_cards").select("*"),
      supabase
        .from("client_files")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (cli.error || inv.error || kanban.error) {
      setError(
        (cli.error ?? inv.error ?? kanban.error)?.message ?? "Error al cargar",
      );
      setLoading(false);
      return;
    }
    setClients((cli.data as Client[]) ?? []);
    setInvoices((inv.data as ClientInvoice[]) ?? []);
    setCards((kanban.data as KanbanCard[]) ?? []);
    setFiles((cf.data as ClientFile[]) ?? []);
    setProposals((props.data as Proposal[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients
      .filter((c) => showArchived || c.active !== false)
      .filter((c) => {
        if (!q) return true;
        return [c.name, c.company, c.contact_name, c.email, c.tax_id, c.phone]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      });
  }, [clients, search, showArchived]);

  const selected = clients.find((c) => c.id === selectedId) ?? null;

  // Saldo pendiente por cliente, agrupado por moneda: sumar pesos con dólares
  // daría un número que no significa nada.
  const balances = useMemo(() => {
    const acc = new Map<string, Record<string, number>>();
    for (const inv of invoices) {
      if (!inv.client_id) continue;
      const t = computeTotals(inv, inv.invoice_items, inv.invoice_payments);
      if (t.balance <= 0) continue;
      const byCurrency = acc.get(inv.client_id) ?? {};
      byCurrency[inv.currency] = (byCurrency[inv.currency] ?? 0) + t.balance;
      acc.set(inv.client_id, byCurrency);
    }
    return acc;
  }, [invoices]);

  // Actividad por cliente: lo que la lista necesita para decir de un vistazo si
  // se le ha facturado y si tiene tareas encima.
  const activity = useMemo(() => {
    const acc = new Map<
      string,
      { invoices: number; openTasks: number; waitingOnClient: number }
    >();
    const bucket = (id: string) => {
      const found = acc.get(id) ?? {
        invoices: 0,
        openTasks: 0,
        waitingOnClient: 0,
      };
      acc.set(id, found);
      return found;
    };
    for (const inv of invoices) {
      if (inv.client_id) bucket(inv.client_id).invoices += 1;
    }
    for (const card of cards) {
      if (!card.client_id || card.completed_at) continue;
      const b = bucket(card.client_id);
      b.openTasks += 1;
      if (card.assigned_to_client) b.waitingOnClient += 1;
    }
    return acc;
  }, [invoices, cards]);

  async function save(draft: Draft) {
    const name = draft.name.trim();
    if (!name) return "El nombre es obligatorio.";

    const website = normalizeUrl(draft.website);
    if (website === undefined) {
      return `"${draft.website.trim()}" no parece una URL válida.`;
    }

    const payload = {
      name,
      company: nil(draft.company),
      contact_name: nil(draft.contact_name),
      email: nil(draft.email),
      phone: nil(draft.phone),
      tax_id: nil(draft.tax_id),
      address: nil(draft.address),
      website,
      birth_date: nil(draft.birth_date),
      notes: nil(draft.notes),
      active: draft.active,
      custom_fields: customToObject(draft.custom),
    };

    if (editing && editing !== "new") {
      const { error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", editing.id);
      if (error) return error.message;
    } else {
      // `public_token` lo genera la BD; se omite para no pisar su default.
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...payload, sort_order: clients.length })
        .select("id")
        .single();
      if (error) return error.message;
      if (data) setSelectedId(data.id);
    }
    setEditing(null);
    await load();
    return null;
  }

  async function archive(client: Client) {
    const next = client.active === false;
    if (
      !next &&
      !confirm(
        `¿Archivar a ${client.name}? Dejará de aparecer en los selectores de facturas y tareas, pero su historial se conserva.`,
      )
    )
      return;
    const { error } = await supabase
      .from("clients")
      .update({ active: next })
      .eq("id", client.id);
    if (error) return setError(error.message);
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, active: next } : c)),
    );
  }

  async function remove(client: Client) {
    const invoiceCount = invoices.filter(
      (i) => i.client_id === client.id,
    ).length;
    if (invoiceCount > 0) {
      alert(
        `${client.name} tiene ${invoiceCount} factura(s). Archívalo en lugar de borrarlo para no perder el historial.`,
      );
      return;
    }
    if (!confirm(`¿Eliminar a ${client.name}? No se puede deshacer.`)) return;
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", client.id);
    if (error) return setError(error.message);
    setSelectedId(null);
    load();
  }

  async function sendPanelInvite(client: Client) {
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/panel-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ text: data.error ?? "No se pudo enviar.", ok: false });
      } else if (data.sent) {
        setNotice({
          text: `Invitación al panel enviada a ${client.name}.`,
          ok: true,
        });
      } else {
        setNotice({ text: data.reason ?? "No se envió.", ok: false });
      }
    } catch {
      setNotice({ text: "Fallo de red: el correo no salió.", ok: false });
    }
    setSending(false);
  }

  async function sendReminder(client: Client) {
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/client-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ text: data.error ?? "No se pudo enviar.", ok: false });
      } else if (data.sent) {
        setNotice({
          text: `Recordatorio enviado a ${client.name} con ${data.taskCount} tarea(s).`,
          ok: true,
        });
      } else {
        setNotice({ text: data.reason ?? "No se envió.", ok: false });
      }
    } catch {
      setNotice({ text: "Fallo de red: el correo no salió.", ok: false });
    }
    setSending(false);
  }

  function copyPublicLink(client: Client) {
    const url = `${siteOrigin()}/proyecto/${client.public_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <p style={{ color: "#888" }}>Cargando clientes…</p>;

  return (
    <div>
      {error && <p style={s.errorBox}>{error}</p>}

      <div style={s.toolbar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo, RNC…"
          style={{
            ...s.input,
            flex: 1,
            minWidth: isMobile ? 0 : 200,
            ...(isMobile ? s.touchInput : null),
          }}
        />
        <button
          onClick={() => setShowArchived((v) => !v)}
          style={{
            ...s.chip,
            ...(isMobile ? s.touchChip : null),
            ...(showArchived ? s.chipActive : {}),
          }}
        >
          {showArchived ? "Ocultar archivados" : "Ver archivados"}
        </button>
        <button
          onClick={() => setEditing("new")}
          style={{ ...s.primaryBtn, ...(isMobile ? s.touchBtn : null) }}
        >
          + Nuevo cliente
        </button>
      </div>

      <div
        style={{
          ...s.layout,
          ...(isMobile ? { gridTemplateColumns: "1fr", gap: 14 } : null),
        }}
      >
        {/* Lista */}
        <div
          style={{
            ...s.list,
            ...(isMobile ? { gridTemplateColumns: "1fr" } : null),
          }}
        >
          {visible.length === 0 && (
            <p style={{ color: "#666", fontSize: 13 }}>
              {search
                ? "Nadie coincide con la búsqueda."
                : "Aún no hay clientes."}
            </p>
          )}
          {visible.map((c) => {
            const bal = balances.get(c.id);
            const act = activity.get(c.id);
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  // El aviso pertenece al cliente que lo generó: si no se
                  // limpia, "enviado a Juan" aparecería en la ficha de Ana.
                  setNotice(null);
                }}
                style={{
                  ...s.listItem,
                  borderColor: selectedId === c.id ? "#00e5a0" : "#222",
                  background: selectedId === c.id ? "#0f1a15" : "#0e0e0e",
                  opacity: c.active === false ? 0.5 : 1,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {c.name}
                  {c.active === false && (
                    <span style={s.archivedTag}>archivado</span>
                  )}
                </div>
                {(c.company || c.email) && (
                  <div style={s.listMeta}>{c.company || c.email}</div>
                )}
                {/* Acceso al panel: se muestra siempre, incluso en clientes
                    nuevos, porque invitar es un paso pendiente por hacer. */}
                <div style={{ marginTop: 6 }}>
                  {c.auth_user_id ? (
                    <span
                      style={{
                        ...s.tag,
                        color: "#00e5a0",
                        borderColor: "#1f5c48",
                      }}
                    >
                      ✓ Registrado
                    </span>
                  ) : (
                    <span style={{ ...s.tag, color: "#777" }}>
                      Sin registrar
                    </span>
                  )}
                </div>
                {/* Sin facturas ni tareas no se pinta la fila de badges: un
                    cliente nuevo se ve limpio en vez de lleno de "sin nada". */}
                <div
                  style={{
                    ...s.listStats,
                    display: act?.invoices || act?.openTasks ? "flex" : "none",
                  }}
                >
                  {/* Facturas y tareas: lo primero que se pregunta de un
                      cliente es si le debemos algo o él a nosotros. */}
                  {act?.invoices ? (
                    <span
                      style={{
                        ...s.tag,
                        color: "#5a8cff",
                        borderColor: "#2b3f6b",
                      }}
                    >
                      {act.invoices} factura{act.invoices === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  {bal ? (
                    Object.entries(bal).map(([cur, amount]) => (
                      <span
                        key={cur}
                        style={{
                          ...s.tag,
                          color: "#ff8080",
                          borderColor: "#5c1f1f",
                        }}
                      >
                        debe {fmtMoney(amount, cur)}
                      </span>
                    ))
                  ) : act?.invoices ? (
                    <span
                      style={{
                        ...s.tag,
                        color: "#00e5a0",
                        borderColor: "#1f5c48",
                      }}
                    >
                      al día
                    </span>
                  ) : null}
                  {act?.openTasks ? (
                    <span style={{ ...s.tag, color: "#ccc" }}>
                      {act.openTasks} tarea{act.openTasks === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  {act?.waitingOnClient ? (
                    <span
                      style={{
                        ...s.tag,
                        color: "#e6b800",
                        borderColor: "#5c4c1f",
                      }}
                    >
                      ⏳ {act.waitingOnClient} esperando por él
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ficha del cliente seleccionado, en modal. "Editar" cierra el modal
          antes de abrir el editor lateral: dos capas a la vez se pelean. */}
      {selected && (
        <div style={s.modalOverlay} onClick={() => setSelectedId(null)}>
          <div
            style={{ ...s.modal, ...(isMobile ? { padding: 14 } : null) }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedId(null)}
              style={s.modalClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <ClientDetail
              client={selected}
              invoices={invoices.filter((i) => i.client_id === selected.id)}
              cards={cards.filter((c) => c.client_id === selected.id)}
              files={files.filter((f) => f.client_id === selected.id)}
              proposals={proposals.filter((p) => p.client_id === selected.id)}
              onFilesChanged={load}
              copied={copied}
              notice={notice}
              sending={sending}
              onEdit={() => {
                setSelectedId(null);
                setEditing(selected);
              }}
              onArchive={() => archive(selected)}
              onDelete={() => remove(selected)}
              onCopyLink={() => copyPublicLink(selected)}
              onCreateInvoice={() => onCreateInvoice(selected.id)}
              onAssignTask={() => onAssignTask(selected.id)}
              onRemind={() => sendReminder(selected)}
              onInvite={() => sendPanelInvite(selected)}
              onOpenTask={(cardId) => onOpenTask(selected.id, cardId)}
            />
          </div>
        </div>
      )}

      {editing && (
        <ClientEditor
          initial={editing === "new" ? emptyDraft() : toDraft(editing)}
          title={editing === "new" ? "Nuevo cliente" : `Editar ${editing.name}`}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

/* ---------------- Ficha ---------------- */

// Iconos SVG en línea (trazo estilo Lucide) para las acciones de la cabecera:
// un emoji rendea distinto en cada sistema; un SVG se ve igual en todos.
function IconPencil() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconRestore() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function ClientDetail({
  client,
  invoices,
  cards,
  files,
  proposals,
  onFilesChanged,
  copied,
  notice,
  sending,
  onEdit,
  onArchive,
  onDelete,
  onCopyLink,
  onCreateInvoice,
  onAssignTask,
  onRemind,
  onInvite,
  onOpenTask,
}: {
  client: Client;
  invoices: ClientInvoice[];
  cards: KanbanCard[];
  files: ClientFile[];
  proposals: Proposal[];
  onFilesChanged: () => void;
  copied: boolean;
  notice: { text: string; ok: boolean } | null;
  sending: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onCreateInvoice: () => void;
  onAssignTask: () => void;
  onRemind: () => void;
  onInvite: () => void;
  onOpenTask: (cardId: string) => void;
}) {
  const isMobile = useIsMobile();
  const openCards = cards.filter((c) => !c.completed_at);
  // Las que el recordatorio incluiría: solo lo que espera al cliente.
  const waitingOnClient = openCards.filter((c) => c.assigned_to_client);
  const custom = Object.entries(client.custom_fields ?? {});
  // Lo que falta cobrarle, por moneda.
  const owed: Record<string, number> = {};
  for (const inv of invoices) {
    const t = computeTotals(inv, inv.invoice_items, inv.invoice_payments);
    if (t.balance > 0)
      owed[inv.currency] = (owed[inv.currency] ?? 0) + t.balance;
  }

  // Lo que impide facturarle en serio. Se avisa aquí y no al guardar: el
  // problema es del dato, no del momento en que se llena el formulario.
  const gaps = [
    !client.tax_id && "sin RNC/cédula (la factura saldrá sin datos fiscales)",
    !client.email && "sin correo (no puede recibir avisos ni facturas)",
  ].filter(Boolean) as string[];

  return (
    <div>
      {/* Cabecera: identidad con editar/eliminar como iconos al lado del
          nombre — lo que más se usa no debe requerir scroll. El confirm() de
          eliminar es la salvaguarda contra el clic accidental. */}
      <div style={{ ...s.detailHead, paddingRight: 28 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>{client.name}</h2>
            <button
              onClick={onEdit}
              style={s.iconBtn}
              title="Editar cliente"
              aria-label="Editar"
            >
              <IconPencil />
            </button>
            {client.active === false && (
              <button
                onClick={onArchive}
                style={s.iconBtn}
                title="Reactivar cliente"
                aria-label="Reactivar"
              >
                <IconRestore />
              </button>
            )}
            <button
              onClick={onDelete}
              style={{ ...s.iconBtn, color: "#ff8080", borderColor: "#5c1f1f" }}
              title="Eliminar cliente"
              aria-label="Eliminar"
            >
              <IconTrash />
            </button>
          </div>
          {client.company && (
            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
              {client.company}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {client.auth_user_id ? (
              <span
                style={{ ...s.tag, color: "#00e5a0", borderColor: "#1f5c48" }}
              >
                ✓ Acceso al panel
              </span>
            ) : (
              <span style={{ ...s.tag, color: "#777" }}>Sin registrar</span>
            )}
            {client.active === false && (
              <span style={s.archivedTag}>archivado</span>
            )}
            <span style={{ fontSize: 11, color: "#666" }}>
              Cliente desde {fmtDateTime(client.created_at)}
            </span>
          </div>
        </div>
      </div>

      {gaps.length > 0 && (
        <p style={s.warnBox}>Ficha incompleta: {gaps.join("; ")}.</p>
      )}

      {/* Lo primero que se pregunta de un cliente, de un vistazo. */}
      <div style={{ ...s.detailStats, marginTop: 14 }}>
        <div style={s.detailStat}>
          <span style={s.detailStatLabel}>Cobro pendiente</span>
          <span
            style={{
              ...s.detailStatValue,
              color: Object.keys(owed).length ? "#ff8080" : "#00e5a0",
            }}
          >
            {Object.keys(owed).length
              ? Object.entries(owed)
                  .map(([cur, amount]) => fmtMoney(amount, cur))
                  .join(" + ")
              : "Al día"}
          </span>
        </div>
        <div style={s.detailStat}>
          <span style={s.detailStatLabel}>Tareas abiertas</span>
          <span style={s.detailStatValue}>
            {openCards.length}
            {waitingOnClient.length > 0 && (
              <span style={{ color: "#e6b800", fontSize: 12, fontWeight: 400 }}>
                {" "}
                · {waitingOnClient.length} esperando por él
              </span>
            )}
          </span>
        </div>
        <div style={s.detailStat}>
          <span style={s.detailStatLabel}>Facturas</span>
          <span style={s.detailStatValue}>{invoices.length}</span>
        </div>
      </div>

      {/* Acciones: las dos principales siempre; las contextuales solo cuando
          son accionables — un botón apagado es ruido, no información. */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <button
          onClick={onCreateInvoice}
          style={{ ...s.primaryBtn, ...(isMobile ? s.touchBtn : null) }}
        >
          Crear factura
        </button>
        <button
          onClick={onAssignTask}
          style={{ ...s.secondaryBtn, ...(isMobile ? s.touchBtn : null) }}
        >
          Asignar tarea
        </button>
        {waitingOnClient.length > 0 && client.email && (
          <button
            onClick={onRemind}
            disabled={sending}
            style={{
              ...s.ghostBtn,
              ...(isMobile ? s.touchBtn : null),
              opacity: sending ? 0.45 : 1,
            }}
            title={`Le recuerda ${waitingOnClient.length} tarea(s)`}
          >
            {sending
              ? "Enviando…"
              : `✉ Recordar pendientes (${waitingOnClient.length})`}
          </button>
        )}
        {!client.auth_user_id && client.email && (
          <button
            onClick={onInvite}
            disabled={sending}
            style={{
              ...s.ghostBtn,
              ...(isMobile ? s.touchBtn : null),
              opacity: sending ? 0.45 : 1,
            }}
            title="Le envía el enlace para crear su cuenta del panel"
          >
            {sending ? "Enviando…" : "Invitar al panel"}
          </button>
        )}
        <button
          onClick={onCopyLink}
          style={{ ...s.ghostBtn, ...(isMobile ? s.touchBtn : null) }}
        >
          {copied ? "✓ Link copiado" : "Copiar link del tablero"}
        </button>
      </div>

      {notice && <p style={notice.ok ? s.okBox : s.warnBox}>{notice.text}</p>}

      {/* Cuerpo en dos columnas: identidad/contacto a la izquierda, actividad
          (facturas y tareas) a la derecha. En móvil colapsa a una. */}
      <div
        style={{
          ...s.detailCols,
          ...(isMobile ? { gridTemplateColumns: "1fr" } : null),
        }}
      >
        <div style={s.detailCol}>
          <section style={s.sectionCard}>
            <h3 style={s.h3}>Contacto</h3>
            <dl style={{ ...s.dataGrid, marginTop: 0 }}>
              <Datum label="Contacto" value={client.contact_name} />
              <Datum label="Correo" value={client.email} />
              <Datum label="Teléfono" value={client.phone} />
              <Datum label="RNC/Cédula" value={client.tax_id} />
              <Datum label="Dirección" value={client.address} />
              <Datum
                label="Cumpleaños"
                value={
                  client.birth_date ? fmtBirthday(client.birth_date) : null
                }
              />
              {client.website && (
                <div>
                  <dt style={s.dt}>Sitio web</dt>
                  <dd style={{ ...s.dd }}>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={s.link}
                    >
                      {/* Se muestra sin el esquema: es ruido en una ficha. */}
                      {client.website
                        .replace(/^https?:\/\//, "")
                        .replace(/\/$/, "")}
                    </a>
                  </dd>
                </div>
              )}
              {/* Campos adicionales: se listan igual que los fijos, en el orden
                  en que se guardaron, para que la ficha se lea como una sola
                  cosa. */}
              {custom.map(([label, value]) => (
                <Datum key={label} label={label} value={value || null} />
              ))}
            </dl>
          </section>

          {client.notes && (
            <section style={s.sectionCard}>
              <h3 style={s.h3}>Notas</h3>
              <p style={{ ...s.body, whiteSpace: "pre-wrap" }}>
                {client.notes}
              </p>
            </section>
          )}
        </div>

        <div style={s.detailCol}>
          {/* Facturas y tareas solo existen si hay algo que listar: una sección
              que únicamente dice "no hay nada" es ruido, no información. */}
          {invoices.length > 0 && (
            <section style={s.sectionCard}>
              <h3 style={s.h3}>
                Facturas ({invoices.length})
                {Object.keys(owed).length > 0 && (
                  <span
                    style={{ color: "#ff8080", fontWeight: 400, fontSize: 13 }}
                  >
                    {" · pendiente "}
                    {Object.entries(owed)
                      .map(([cur, amount]) => fmtMoney(amount, cur))
                      .join(" + ")}
                  </span>
                )}
              </h3>
              {invoices.map((inv) => {
                const t = computeTotals(
                  inv,
                  inv.invoice_items,
                  inv.invoice_payments,
                );
                return (
                  <div
                    key={inv.id}
                    style={{ ...s.row, ...(isMobile ? s.rowMobile : null) }}
                  >
                    <span style={{ fontWeight: 600 }}>#{inv.number}</span>
                    <span style={{ color: "#888" }}>
                      {fmtDateTime(inv.issued_at)}
                    </span>
                    <span>{fmtMoney(t.total, inv.currency)}</span>
                    <span
                      style={{ color: STATUS_COLOR[t.status], fontSize: 12 }}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                );
              })}
            </section>
          )}

          {openCards.length > 0 && (
            <section style={s.sectionCard}>
              <h3 style={s.h3}>
                Tareas abiertas ({openCards.length}
                {cards.length > openCards.length ? ` de ${cards.length}` : ""})
              </h3>
              {openCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => onOpenTask(card.id)}
                  style={{
                    ...s.row,
                    ...s.rowButton,
                    ...(isMobile ? s.rowMobile : null),
                  }}
                  title="Abrir esta tarea en el Kanban"
                >
                  <span style={{ gridColumn: "1 / span 2", textAlign: "left" }}>
                    {card.title}
                  </span>
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {card.due_date ? `vence ${card.due_date}` : "sin fecha"}
                  </span>
                  <span style={{ fontSize: 12, color: "#e6b800" }}>
                    {card.assigned_to_client ? "⏳ pendiente del cliente" : ""}
                  </span>
                </button>
              ))}
            </section>
          )}

          {/* Lo que el cliente ve en la sección Archivos de su panel. */}
          <ClientFilesSection
            clientId={client.id}
            files={files}
            onChanged={onFilesChanged}
          />

          {/* Propuestas HTML con link público + contraseña. */}
          <ClientProposalsSection
            clientId={client.id}
            proposals={proposals}
            onChanged={onFilesChanged}
          />
        </div>
      </div>
    </div>
  );
}

// Selector de archivo con el look del dashboard: el input nativo queda
// invisible encima del label (así conserva la validación `required` y el
// click), y lo que se ve es el botón estilizado con el nombre elegido.
function FilePicker({
  inputKey,
  file,
  onSelect,
  accept,
  placeholder,
  style,
}: {
  inputKey: number;
  file: File | null;
  onSelect: (f: File | null) => void;
  accept?: string;
  placeholder: string;
  style?: CSSProperties;
}) {
  return (
    <label
      title={file?.name ?? placeholder}
      style={{
        ...s.filePicker,
        ...(file ? { borderStyle: "solid", color: "#eee" } : null),
        ...style,
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{ flexShrink: 0 }}
      >
        <path d="M12 3v12" />
        <path d="m7 8 5-5 5 5" />
        <path d="M4 21h16" />
      </svg>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {file ? file.name : placeholder}
      </span>
      <input
        key={inputKey}
        type="file"
        required
        accept={accept}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        style={s.filePickerInput}
      />
    </label>
  );
}

const FILE_KIND_LABEL: Record<ClientFileKind, string> = {
  credencial: "Credencial",
  contrato: "Contrato",
  documento: "Documento",
  link: "Link",
};

/**
 * Archivos que el cliente ve en su panel (credenciales, contratos, documentos
 * y links). Todo pasa por /api/panel-files: el bucket es privado y solo el
 * servidor firma o borra objetos.
 */
function ClientFilesSection({
  clientId,
  files,
  onChanged,
}: {
  clientId: string;
  files: ClientFile[];
  onChanged: () => void;
}) {
  const [kind, setKind] = useState<ClientFileKind>("documento");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  // Remonta el <input type="file"> tras guardar: no hay forma de vaciarlo por valor.
  const [fileInputKey, setFileInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("clientId", clientId);
    form.set("kind", kind);
    form.set("title", title);
    form.set("note", note);
    if (kind === "link") form.set("url", url);
    else if (file) form.set("file", file);
    try {
      const res = await fetch("/api/panel-files", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar.");
      } else {
        setTitle("");
        setUrl("");
        setNote("");
        setFile(null);
        setFileInputKey((k) => k + 1);
        onChanged();
      }
    } catch {
      setError("Fallo de red: no se guardó.");
    }
    setBusy(false);
  }

  async function removeFile(id: string) {
    if (!confirm("¿Quitar este archivo del panel del cliente?")) return;
    const res = await fetch("/api/panel-files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo eliminar.");
      return;
    }
    onChanged();
  }

  return (
    <section style={s.sectionCard}>
      <h3 style={s.h3}>
        Archivos del panel {files.length ? `(${files.length})` : ""}
      </h3>
      {files.map((f) => (
        <div key={f.id} style={s.row}>
          <span style={{ color: "#888", fontSize: 12 }}>
            {FILE_KIND_LABEL[f.kind]}
          </span>
          <span style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
            {f.title}
          </span>
          <span style={{ color: "#888", fontSize: 12 }}>
            {fmtDateTime(f.created_at)}
          </span>
          <button
            onClick={() => removeFile(f.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ff8080",
              fontSize: 12,
              cursor: "pointer",
              justifySelf: "end",
            }}
          >
            Quitar
          </button>
        </div>
      ))}

      <form
        onSubmit={add}
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as ClientFileKind)}
          style={{ ...s.input, width: "auto" }}
        >
          {Object.entries(FILE_KIND_LABEL).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Título"
          style={{ ...s.input, flex: 1, minWidth: 140 }}
        />
        {kind === "link" ? (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            type="url"
            placeholder="https://…"
            style={{ ...s.input, flex: 1, minWidth: 160 }}
          />
        ) : (
          <FilePicker
            inputKey={fileInputKey}
            file={file}
            onSelect={setFile}
            placeholder="Elegir archivo…"
            style={{ flex: 1, minWidth: 160 }}
          />
        )}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional)"
          style={{ ...s.input, flex: 1, minWidth: 120 }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{ ...s.secondaryBtn, opacity: busy ? 0.5 : 1 }}
        >
          {busy ? "Guardando…" : "+ Compartir"}
        </button>
      </form>
      {error && <p style={s.warnBox}>{error}</p>}
    </section>
  );
}

/**
 * Propuestas comerciales en HTML. Se sube el archivo con una contraseña; el
 * link público (/propuestas/{cliente}/{slug}) muestra la propuesta en un
 * iframe tras ingresarla. `first_viewed_at`/`view_count` dicen si el cliente
 * ya la abrió. Todo pasa por /api/proposals: el bucket es privado.
 */
function ClientProposalsSection({
  clientId,
  proposals,
  onChanged,
}: {
  clientId: string;
  proposals: Proposal[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  // Remonta el <input type="file"> tras guardar: no hay forma de vaciarlo por valor.
  const [fileInputKey, setFileInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("clientId", clientId);
    form.set("title", title);
    form.set("password", password);
    if (file) form.set("file", file);
    try {
      const res = await fetch("/api/proposals", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar.");
      } else {
        setTitle("");
        setPassword("");
        setFile(null);
        setFileInputKey((k) => k + 1);
        onChanged();
      }
    } catch {
      setError("Fallo de red: no se guardó.");
    }
    setBusy(false);
  }

  async function removeProposal(id: string) {
    if (!confirm("¿Eliminar esta propuesta? El link dejará de funcionar."))
      return;
    const res = await fetch("/api/proposals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo eliminar.");
      return;
    }
    onChanged();
  }

  async function changePassword(p: Proposal) {
    const password = prompt(
      `Nueva contraseña para "${p.title}" (mínimo 4 caracteres):`,
    )?.trim();
    if (!password) return;
    const res = await fetch("/api/proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo cambiar la contraseña.");
      return;
    }
    setError(null);
    alert("Contraseña actualizada. Los accesos anteriores quedan invalidados.");
  }

  function copyLink(p: Proposal) {
    const url = `${window.location.origin}/propuestas/${p.client_slug}/${p.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <section style={s.sectionCard}>
      <h3 style={s.h3}>
        Propuestas {proposals.length ? `(${proposals.length})` : ""}
      </h3>
      {proposals.map((p) => (
        <div
          key={p.id}
          // 5 columnas: s.row trae 4 y aquí se suma "Cambiar clave".
          style={{ ...s.row, gridTemplateColumns: "auto 1fr auto auto auto" }}
        >
          <span style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
            {p.title}
          </span>
          <span
            style={{
              fontSize: 12,
              color: p.first_viewed_at ? "#7dcc7d" : "#888",
            }}
            title={
              p.first_viewed_at
                ? `Vista por primera vez: ${fmtDateTime(p.first_viewed_at)}`
                : "El cliente aún no la abre"
            }
          >
            {p.first_viewed_at ? `✓ vista ${p.view_count}×` : "sin abrir"}
          </span>
          <button
            onClick={() => copyLink(p)}
            style={{
              background: "transparent",
              border: "none",
              color: "#5aa9ff",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {copiedId === p.id ? "¡Copiado!" : "Copiar link"}
          </button>
          <button
            onClick={() => changePassword(p)}
            style={{
              background: "transparent",
              border: "none",
              color: "#d9b36a",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Cambiar clave
          </button>
          <button
            onClick={() => removeProposal(p.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ff8080",
              fontSize: 12,
              cursor: "pointer",
              justifySelf: "end",
            }}
          >
            Quitar
          </button>
        </div>
      ))}

      <form
        onSubmit={add}
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Título de la propuesta"
          style={{ ...s.input, flex: 1, minWidth: 140 }}
        />
        <FilePicker
          inputKey={fileInputKey}
          file={file}
          onSelect={setFile}
          accept=".html,.htm,text/html"
          placeholder="Elegir HTML…"
          style={{ flex: 1, minWidth: 160 }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          placeholder="Contraseña para el cliente"
          style={{ ...s.input, flex: 1, minWidth: 140 }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{ ...s.secondaryBtn, opacity: busy ? 0.5 : 1 }}
        >
          {busy ? "Subiendo…" : "+ Publicar"}
        </button>
      </form>
      {error && <p style={s.warnBox}>{error}</p>}
    </section>
  );
}

/**
 * Un dato de la ficha. Si no hay valor no se renderiza nada: la ficha muestra lo
 * que sabemos del cliente, no un inventario de casillas vacías. Lo que falta ya
 * lo señala el aviso de "ficha incompleta" cuando de verdad importa.
 */
function Datum({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt style={s.dt}>{label}</dt>
      <dd style={s.dd}>{value}</dd>
    </div>
  );
}

/* ---------------- Editor ---------------- */

function ClientEditor({
  initial,
  title,
  onClose,
  onSave,
}: {
  initial: Draft;
  title: string;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<string | null>;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const inp = isMobile ? { ...s.input, ...s.touchInput } : s.input;
  const gbtn = isMobile ? { ...s.ghostBtn, ...s.touchBtn } : s.ghostBtn;

  const set = (patch: Partial<Draft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const setCustom = (idx: number, patch: Partial<CustomField>) =>
    setDraft((prev) => ({
      ...prev,
      custom: prev.custom.map((row, i) =>
        i === idx ? { ...row, ...patch } : row,
      ),
    }));

  const addCustom = () =>
    setDraft((prev) => ({
      ...prev,
      custom: [...prev.custom, { key: "", value: "" }],
    }));

  const removeCustom = (idx: number) =>
    setDraft((prev) => ({
      ...prev,
      custom: prev.custom.filter((_, i) => i !== idx),
    }));

  // Dos filas con la misma etiqueta colapsan en una sola clave del jsonb. Se
  // avisa en vez de bloquear: el usuario puede estar a media edición.
  const duplicateLabels = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const { key } of draft.custom) {
      const label = key.trim();
      if (!label) continue;
      if (seen.has(label)) dupes.add(label);
      seen.add(label);
    }
    return [...dupes];
  }, [draft.custom]);

  async function submit() {
    setSaving(true);
    const message = await onSave(draft);
    setSaving(false);
    if (message) setErr(message);
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div
        style={{
          ...s.drawer,
          // En teléfono el panel ocupa la pantalla entera; el cuerpo lleva su
          // propio scroll y la cabecera con la ✕ queda siempre visible.
          ...(isMobile ? { width: "100%", borderLeft: "none" } : null),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.drawerHeader}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={s.closeBtn}>
            ✕
          </button>
        </div>

        <div
          style={{ ...s.drawerBody, ...(isMobile ? { padding: 14 } : null) }}
        >
          {err && <p style={s.errorBox}>{err}</p>}

          <label style={s.field}>
            <span style={s.label}>Nombre corto *</span>
            <input
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              style={inp}
              placeholder="Con el que lo llamas en el panel"
            />
          </label>

          <label style={s.field}>
            <span style={s.label}>Razón social</span>
            <input
              value={draft.company}
              onChange={(e) => set({ company: e.target.value })}
              style={inp}
              placeholder="Nombre fiscal que sale impreso en la factura"
            />
          </label>

          <div
            style={{
              ...s.pair,
              ...(isMobile ? { flexDirection: "column", gap: 0 } : null),
            }}
          >
            <label style={{ ...s.field, flex: 1 }}>
              <span style={s.label}>Persona de contacto</span>
              <input
                value={draft.contact_name}
                onChange={(e) => set({ contact_name: e.target.value })}
                style={inp}
              />
            </label>
            <label style={{ ...s.field, flex: 1 }}>
              <span style={s.label}>RNC / Cédula</span>
              <input
                value={draft.tax_id}
                onChange={(e) => set({ tax_id: e.target.value })}
                style={inp}
              />
            </label>
          </div>

          <div
            style={{
              ...s.pair,
              ...(isMobile ? { flexDirection: "column", gap: 0 } : null),
            }}
          >
            <label style={{ ...s.field, flex: 1 }}>
              <span style={s.label}>Correo</span>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => set({ email: e.target.value })}
                style={inp}
                placeholder="Recibe avisos de tareas y facturas"
              />
            </label>
            <label style={{ ...s.field, flex: 1 }}>
              <span style={s.label}>Teléfono</span>
              <input
                value={draft.phone}
                onChange={(e) => set({ phone: e.target.value })}
                style={inp}
              />
            </label>
          </div>

          <label style={s.field}>
            <span style={s.label}>Dirección</span>
            <textarea
              value={draft.address}
              onChange={(e) => set({ address: e.target.value })}
              style={{ ...inp, minHeight: 64, resize: "vertical" }}
            />
          </label>

          <label style={s.field}>
            <span style={s.label}>Sitio web</span>
            <input
              type="url"
              value={draft.website}
              onChange={(e) => set({ website: e.target.value })}
              style={inp}
              placeholder="cliente.com — el https:// se agrega solo"
            />
          </label>

          <label style={s.field}>
            <span style={s.label}>Fecha de nacimiento</span>
            <input
              type="date"
              value={draft.birth_date}
              onChange={(e) => set({ birth_date: e.target.value })}
              style={inp}
            />
          </label>

          {/* Campos adicionales */}
          <div style={{ ...s.field, marginTop: 6 }}>
            <span style={s.label}>Campos adicionales</span>
            {draft.custom.length === 0 && (
              <p style={{ ...s.body, fontSize: 12 }}>
                Agrega lo que este cliente necesite: Instagram, número de
                contrato, contacto secundario…
              </p>
            )}
            {draft.custom.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 6,
                  flexWrap: isMobile ? "wrap" : "nowrap",
                }}
              >
                <input
                  value={row.key}
                  onChange={(e) => setCustom(idx, { key: e.target.value })}
                  style={{ ...inp, flex: isMobile ? "1 1 100%" : "0 0 38%" }}
                  placeholder="Etiqueta"
                />
                <input
                  value={row.value}
                  onChange={(e) => setCustom(idx, { value: e.target.value })}
                  style={{ ...inp, flex: 1 }}
                  placeholder="Valor"
                />
                <button
                  type="button"
                  onClick={() => removeCustom(idx)}
                  style={{ ...gbtn, padding: "8px 11px" }}
                  title="Quitar este campo"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCustom}
              style={{ ...gbtn, marginTop: 8, alignSelf: "flex-start" }}
            >
              + Agregar campo
            </button>
            {duplicateLabels.length > 0 && (
              <p style={{ ...s.warnBox, marginTop: 8 }}>
                Etiquetas repetidas ({duplicateLabels.join(", ")}): solo se
                guardará el último valor de cada una.
              </p>
            )}
          </div>

          <label style={s.field}>
            <span style={s.label}>Notas internas</span>
            <textarea
              value={draft.notes}
              onChange={(e) => set({ notes: e.target.value })}
              style={{ ...inp, minHeight: 90, resize: "vertical" }}
              placeholder="No se le muestra al cliente."
            />
          </label>

          <label
            style={{
              ...s.field,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => set({ active: e.target.checked })}
            />
            <span style={{ fontSize: 13, color: "#ccc" }}>
              Cliente activo (aparece en facturas y tareas)
            </span>
          </label>
        </div>

        <div style={s.drawerFooter}>
          <button onClick={onClose} style={gbtn}>
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{ ...s.primaryBtn, ...(isMobile ? s.touchBtn : null) }}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  toolbar: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  // Cards arriba (máximo 4 por fila) y la ficha del seleccionado debajo.
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 20,
    alignItems: "start",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
  },
  listItem: {
    textAlign: "left",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "14px",
    cursor: "pointer",
    color: "#eee",
    background: "#0e0e0e",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  listMeta: { fontSize: 12, color: "#888", marginTop: 3 },
  listStats: {
    fontSize: 11,
    marginTop: 5,
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  tag: {
    fontSize: 10,
    border: "1px solid #2a2a2a",
    borderRadius: 4,
    padding: "1px 5px",
    whiteSpace: "nowrap",
  },
  link: { color: "#5a8cff", textDecoration: "none" },
  archivedTag: {
    fontSize: 10,
    color: "#888",
    border: "1px solid #333",
    borderRadius: 4,
    padding: "1px 5px",
    marginLeft: 6,
    verticalAlign: "middle",
  },
  detail: {
    border: "1px solid #222",
    borderRadius: 12,
    padding: 20,
    minHeight: 200,
  },
  detailHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  detailStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
    marginTop: 18,
  },
  detailStat: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    minWidth: 0,
  },
  detailStatLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#777",
  },
  detailStatValue: { fontSize: 17, fontWeight: 600, letterSpacing: -0.2 },
  // Cuerpo de la ficha: dos columnas de tarjetas (contacto/notas | actividad).
  detailCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    alignItems: "start",
    marginTop: 16,
  },
  detailCol: { display: "grid", gap: 14, alignContent: "start", minWidth: 0 },
  sectionCard: {
    background: "#101010",
    border: "1px solid #1c1c1c",
    borderRadius: 10,
    padding: "14px 16px",
    minWidth: 0,
  },
  // Acción de la cabecera (editar/eliminar) como icono compacto junto al nombre.
  iconBtn: {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#ccc",
    width: 30,
    height: 30,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
    margin: "22px 0 0",
  },
  dt: {
    fontSize: 11,
    color: "#777",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dd: { margin: "3px 0 0", fontSize: 14 },
  h3: { fontSize: 15, margin: "0 0 10px", fontWeight: 600 },
  body: { fontSize: 13, color: "#888", margin: 0 },
  row: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto",
    gap: 10,
    alignItems: "center",
    fontSize: 13,
    padding: "8px 0",
    borderTop: "1px solid #1c1c1c",
  },
  rowButton: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderTop: "1px solid #1c1c1c",
    color: "#eee",
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "10px 0",
  },
  input: {
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#eee",
    padding: "9px 11px",
    fontSize: 13,
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  // Look del FilePicker: como un input del dashboard pero con borde
  // discontinuo (señal de "suelta/elige un archivo") hasta que hay archivo.
  filePicker: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#111",
    border: "1px dashed #333",
    borderRadius: 8,
    color: "#999",
    padding: "9px 11px",
    fontSize: 13,
    cursor: "pointer",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  // El input real cubre todo el label, invisible: conserva click nativo,
  // foco y la validación required.
  filePickerInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "pointer",
    width: "100%",
    height: "100%",
  },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  pair: { display: "flex", gap: 12, flexWrap: "wrap" },
  label: { fontSize: 12, color: "#999" },
  primaryBtn: {
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#00e5a0",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    color: "#ccc",
    border: "1px solid #333",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  chip: {
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 999,
    color: "#999",
    padding: "7px 13px",
    fontSize: 12,
    cursor: "pointer",
  },
  chipActive: { borderColor: "#fff", color: "#fff" },
  // Variantes táctiles para teléfono: 16px evita el zoom de iOS al enfocar un
  // campo, y 40px de alto es el mínimo cómodo para el dedo.
  touchInput: { fontSize: 16, minHeight: 40 },
  touchBtn: { minHeight: 40, fontSize: 14 },
  touchChip: { minHeight: 40, padding: "9px 14px", fontSize: 13 },
  rowMobile: { gridTemplateColumns: "1fr auto", rowGap: 2 },
  errorBox: {
    background: "#2a0f0f",
    border: "1px solid #5c1f1f",
    color: "#ff9b9b",
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 13,
  },
  okBox: {
    background: "#0f2a1e",
    border: "1px solid #1f5c48",
    color: "#7be6b8",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 12,
    marginTop: 14,
  },
  warnBox: {
    background: "#2a230f",
    border: "1px solid #5c4c1f",
    color: "#e6c86b",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 12,
    marginTop: 14,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    position: "relative",
    background: "#0b0b0b",
    border: "1px solid #222",
    borderRadius: 14,
    padding: 24,
    // Ancho para dos columnas de la ficha; en pantallas chicas ocupa el 100%.
    width: "min(980px, 100%)",
    maxHeight: "88vh",
    overflowY: "auto",
  },
  modalClose: {
    position: "absolute",
    top: 14,
    right: 16,
    background: "transparent",
    border: "none",
    color: "#888",
    fontSize: 18,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.65)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 50,
  },
  drawer: {
    background: "#0b0b0b",
    borderLeft: "1px solid #222",
    width: "min(520px, 100%)",
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid #1c1c1c",
  },
  drawerBody: { padding: 20, overflowY: "auto", flex: 1 },
  drawerFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    padding: "14px 20px",
    borderTop: "1px solid #1c1c1c",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#888",
    fontSize: 18,
    cursor: "pointer",
  },
};
