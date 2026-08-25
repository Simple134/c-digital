"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { computeTotals, fmtMoney } from "@/lib/invoices";
import type { createClient } from "@/lib/supabase/client";
import type {
  Client,
  Invoice,
  InvoiceItem,
  InvoicePayment,
  KanbanCard,
  Project,
  ProjectStatus,
} from "@/lib/supabase/types";
import useIsMobile from "./useIsMobile";

type Supabase = ReturnType<typeof createClient>;

type ProjectInvoice = Invoice & {
  invoice_items: InvoiceItem[];
  invoice_payments: InvoicePayment[];
};

type Draft = {
  client_id: string;
  name: string;
  status: ProjectStatus;
  description: string;
  started_at: string;
  due_date: string;
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "pausado", label: "Pausado" },
  { value: "completado", label: "Completado" },
  { value: "archivado", label: "Archivado" },
];

const STATUS_COLOR: Record<ProjectStatus, string> = {
  activo: "#00e5a0",
  pausado: "#e6b800",
  completado: "#5aa9ff",
  archivado: "#777",
};

const emptyDraft = (clientId = ""): Draft => ({
  client_id: clientId,
  name: "",
  status: "activo",
  description: "",
  started_at: "",
  due_date: "",
});

const toDraft = (project: Project): Draft => ({
  client_id: project.client_id,
  name: project.name,
  status: project.status,
  description: project.description ?? "",
  started_at: project.started_at ?? "",
  due_date: project.due_date ?? "",
});

const nil = (value: string) => (value.trim() ? value.trim() : null);

export default function Proyectos({
  supabase,
  onOpenTasks,
}: {
  supabase: Supabase;
  onOpenTasks: (clientId: string, projectId: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [invoices, setInvoices] = useState<ProjectInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "todos">(
    "todos",
  );
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [projectRows, clientRows, cardRows, invoiceRows] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("clients").select("*").order("name"),
      supabase.from("kanban_cards").select("*"),
      supabase
        .from("invoices")
        .select("*, invoice_items(*), invoice_payments(*)")
        .eq("party_type", "client")
        .order("issued_at", { ascending: false }),
    ]);

    const loadError =
      projectRows.error ??
      clientRows.error ??
      cardRows.error ??
      invoiceRows.error;
    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setProjects((projectRows.data as Project[]) ?? []);
    setClients((clientRows.data as Client[]) ?? []);
    setCards((cardRows.data as KanbanCard[]) ?? []);
    setInvoices((invoiceRows.data as ProjectInvoice[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const clientById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((project) => !clientFilter || project.client_id === clientFilter)
      .filter(
        (project) =>
          statusFilter === "todos" || project.status === statusFilter,
      )
      .filter((project) => {
        if (!q) return true;
        const client = clientById.get(project.client_id);
        return [
          project.name,
          project.description,
          client?.name,
          client?.company,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      });
  }, [clientById, clientFilter, projects, search, statusFilter]);

  async function save(draft: Draft) {
    const name = draft.name.trim();
    if (!name) return "El nombre es obligatorio.";
    if (!draft.client_id) return "Elige un cliente.";

    const payload = {
      client_id: draft.client_id,
      name,
      status: draft.status,
      description: nil(draft.description),
      started_at: nil(draft.started_at),
      due_date: nil(draft.due_date),
      completed_at:
        draft.status === "completado" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (editing && editing !== "new") {
      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", editing.id);
      if (error) return error.message;
    } else {
      const { error } = await supabase.from("projects").insert({
        ...payload,
        sort_order: projects.filter((p) => p.client_id === draft.client_id)
          .length,
      });
      if (error) return error.message;
    }

    setEditing(null);
    await load();
    return null;
  }

  async function archive(project: Project) {
    const next = project.status === "archivado" ? "activo" : "archivado";
    const { error } = await supabase
      .from("projects")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", project.id);
    if (error) return setError(error.message);
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status: next } : p)),
    );
  }

  async function remove(project: Project) {
    const hasCards = cards.some((card) => card.project_id === project.id);
    const hasInvoices = invoices.some(
      (invoice) => invoice.project_id === project.id,
    );
    if (hasCards || hasInvoices) {
      alert(
        `${project.name} tiene historial. Archívalo en lugar de borrarlo para conservar tareas y facturas.`,
      );
      return;
    }
    if (
      !confirm(`¿Eliminar el proyecto ${project.name}? No se puede deshacer.`)
    )
      return;
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) return setError(error.message);
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
  }

  if (loading) return <p style={{ color: "#888" }}>Cargando proyectos…</p>;

  return (
    <div>
      {error && <p style={s.errorBox}>{error}</p>}

      <div style={s.toolbar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por proyecto o cliente…"
          style={{ ...s.input, flex: 1, minWidth: isMobile ? "100%" : 220 }}
        />
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{ ...s.input, minWidth: isMobile ? "100%" : 220 }}
        >
          <option value="">Todos los clientes</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ProjectStatus | "todos")
          }
          style={{ ...s.input, minWidth: isMobile ? "100%" : 170 }}
        >
          <option value="todos">Todos los estados</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setEditing("new")}
          style={{ ...s.primaryBtn, ...(isMobile ? { width: "100%" } : null) }}
        >
          + Nuevo proyecto
        </button>
      </div>

      <div style={s.list}>
        {visible.map((project) => {
          const client = clientById.get(project.client_id);
          const projectCards = cards.filter(
            (card) => card.project_id === project.id,
          );
          const openCards = projectCards.filter((card) => !card.completed_at);
          const doneCards = projectCards.length - openCards.length;
          const projectInvoices = invoices.filter(
            (invoice) => invoice.project_id === project.id,
          );
          const owed: Record<string, number> = {};
          for (const invoice of projectInvoices) {
            const totals = computeTotals(
              invoice,
              invoice.invoice_items ?? [],
              invoice.invoice_payments ?? [],
            );
            if (totals.balance > 0) {
              owed[invoice.currency] =
                (owed[invoice.currency] ?? 0) + totals.balance;
            }
          }
          return (
            <article key={project.id} style={s.card}>
              <div style={s.cardHead}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={s.title}>{project.name}</h2>
                  <p style={s.meta}>
                    {client?.name ?? "Cliente no encontrado"}
                  </p>
                </div>
                <span
                  style={{
                    ...s.status,
                    color: STATUS_COLOR[project.status],
                    borderColor: `${STATUS_COLOR[project.status]}66`,
                  }}
                >
                  {
                    STATUS_OPTIONS.find((s) => s.value === project.status)
                      ?.label
                  }
                </span>
              </div>

              {project.description && (
                <p style={s.description}>{project.description}</p>
              )}

              <div style={s.stats}>
                <Stat
                  label="Tareas"
                  value={`${doneCards}/${projectCards.length}`}
                />
                <Stat label="Abiertas" value={String(openCards.length)} />
                <Stat label="Facturas" value={String(projectInvoices.length)} />
                <Stat
                  label="Pendiente"
                  value={
                    Object.keys(owed).length
                      ? Object.entries(owed)
                          .map(([cur, amount]) => fmtMoney(amount, cur))
                          .join(" + ")
                      : "Al día"
                  }
                />
              </div>

              <div style={s.dates}>
                {project.started_at && <span>Inicio {project.started_at}</span>}
                {project.due_date && <span>Entrega {project.due_date}</span>}
              </div>

              <div style={s.actions}>
                <button
                  onClick={() => setEditing(project)}
                  style={s.secondaryBtn}
                >
                  Editar
                </button>
                <button
                  onClick={() => onOpenTasks(project.client_id, project.id)}
                  style={s.secondaryBtn}
                >
                  Ver tareas
                </button>
                <button onClick={() => archive(project)} style={s.ghostBtn}>
                  {project.status === "archivado" ? "Reactivar" : "Archivar"}
                </button>
                <button onClick={() => remove(project)} style={s.dangerBtn}>
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
        {visible.length === 0 && (
          <p style={{ color: "#666" }}>No hay proyectos en esta vista.</p>
        )}
      </div>

      {editing && (
        <ProjectEditor
          project={editing === "new" ? null : editing}
          clients={clients}
          defaultClientId={clientFilter}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.stat}>
      <span style={s.statLabel}>{label}</span>
      <span style={s.statValue}>{value}</span>
    </div>
  );
}

function ProjectEditor({
  project,
  clients,
  defaultClientId,
  onClose,
  onSave,
}: {
  project: Project | null;
  clients: Client[];
  defaultClientId: string;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<string | null>;
}) {
  const [draft, setDraft] = useState<Draft>(
    project ? toDraft(project) : emptyDraft(defaultClientId),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(draft);
    setSaving(false);
    if (result) setError(result);
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <form
        onSubmit={submit}
        style={{
          ...s.modal,
          ...(isMobile ? { width: "100%", height: "100dvh" } : null),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.modalHead}>
          <h2 style={{ margin: 0, fontSize: 20 }}>
            {project ? `Editar ${project.name}` : "Nuevo proyecto"}
          </h2>
          <button type="button" onClick={onClose} style={s.closeBtn}>
            x
          </button>
        </div>

        <div style={s.modalBody}>
          {error && <p style={s.errorBox}>{error}</p>}

          <label style={s.field}>
            <span style={s.label}>Cliente</span>
            <select
              value={draft.client_id}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, client_id: e.target.value }))
              }
              style={s.input}
            >
              <option value="">Selecciona cliente…</option>
              {clients
                .filter(
                  (client) =>
                    client.active !== false || client.id === project?.client_id,
                )
                .map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.active === false ? " · archivado" : ""}
                  </option>
                ))}
            </select>
          </label>

          <label style={s.field}>
            <span style={s.label}>Nombre del proyecto</span>
            <input
              value={draft.name}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, name: e.target.value }))
              }
              style={s.input}
              autoFocus
            />
          </label>

          <label style={s.field}>
            <span style={s.label}>Estado</span>
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as ProjectStatus,
                }))
              }
              style={s.input}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label style={s.field}>
            <span style={s.label}>Descripción</span>
            <textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, description: e.target.value }))
              }
              style={{ ...s.input, minHeight: 90, resize: "vertical" }}
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 10,
            }}
          >
            <label style={s.field}>
              <span style={s.label}>Fecha de inicio</span>
              <input
                type="date"
                value={draft.started_at}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, started_at: e.target.value }))
                }
                style={s.input}
              />
            </label>
            <label style={s.field}>
              <span style={s.label}>Fecha de entrega</span>
              <input
                type="date"
                value={draft.due_date}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, due_date: e.target.value }))
                }
                style={s.input}
              />
            </label>
          </div>
        </div>

        <div style={s.modalFooter}>
          <button type="button" onClick={onClose} style={s.ghostBtn}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ ...s.primaryBtn, opacity: saving ? 0.55 : 1 }}
          >
            {saving ? "Guardando…" : "Guardar proyecto"}
          </button>
        </div>
      </form>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  toolbar: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 18,
  },
  input: {
    background: "#0e0e0e",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  primaryBtn: {
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#161616",
    color: "#ddd",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    color: "#aaa",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  dangerBtn: {
    background: "transparent",
    color: "#ff8080",
    border: "1px solid #5c1f1f",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  list: { display: "grid", gap: 12 },
  card: {
    background: "#121212",
    border: "1px solid #232323",
    borderRadius: 10,
    padding: 16,
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  title: { margin: 0, fontSize: 18, lineHeight: 1.25 },
  meta: { margin: "4px 0 0", color: "#888", fontSize: 13 },
  status: {
    border: "1px solid",
    borderRadius: 999,
    padding: "4px 9px",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  description: {
    color: "#aaa",
    fontSize: 13,
    lineHeight: 1.5,
    margin: "12px 0 0",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 8,
    marginTop: 14,
  },
  stat: {
    background: "#0d0d0d",
    border: "1px solid #202020",
    borderRadius: 8,
    padding: "10px 12px",
  },
  statLabel: {
    display: "block",
    color: "#777",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statValue: { display: "block", marginTop: 4, fontWeight: 700 },
  dates: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    color: "#777",
    fontSize: 12,
    marginTop: 12,
  },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.72)",
    zIndex: 80,
    display: "flex",
    justifyContent: "flex-end",
  },
  modal: {
    width: "min(560px, 100%)",
    background: "#0b0b0b",
    borderLeft: "1px solid #252525",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    maxHeight: "100dvh",
  },
  modalHead: {
    padding: 20,
    borderBottom: "1px solid #202020",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  modalBody: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    overflow: "auto",
  },
  modalFooter: {
    padding: 20,
    borderTop: "1px solid #202020",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#777",
    fontSize: 18,
    cursor: "pointer",
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    color: "#888",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  errorBox: {
    color: "#ff9d9d",
    background: "#2a0f0f",
    border: "1px solid #5c1f1f",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
  },
};
