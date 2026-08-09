"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteOrigin } from "@/lib/site";
import useIsMobile from "./useIsMobile";
import Clientes from "./Clientes";
import KanbanBoard from "./KanbanBoard";
import Solicitudes from "./Solicitudes";
import Facturacion from "./Facturacion";
import { RESOURCES, emptyRecord, type Field, type Resource } from "./resources";

type View = "resource" | "clientes" | "kanban" | "solicitudes" | "facturacion";

type Row = Record<string, unknown> & { id?: string };

// Un item del sidebar: o abre un recurso del CRUD genérico, o una vista propia.
type NavItem =
  | { key: string; label: string; resource: Resource }
  | { key: string; label: string; view: Exclude<View, "resource"> };

// Agrupación declarativa del sidebar: contenido del sitio vs. gestión interna.
const NAV_GROUPS: { id: string; label: string; items: NavItem[] }[] = [
  {
    id: "web",
    label: "Página web",
    items: RESOURCES.map((r) => ({ key: r.table, label: r.label, resource: r })),
  },
  {
    id: "ops",
    label: "Operaciones",
    items: [
      { key: "clientes", label: "Clientes", view: "clientes" },
      { key: "kanban", label: "Kanban", view: "kanban" },
      { key: "solicitudes", label: "Solicitudes", view: "solicitudes" },
      { key: "facturacion", label: "Facturación", view: "facturacion" },
    ],
  },
];

export default function Dashboard({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const isMobile = useIsMobile();
  // En teléfono la navegación arranca plegada para no empujar el contenido.
  const [menuOpen, setMenuOpen] = useState(false);

  const [view, setView] = useState<View>("resource");
  const [active, setActive] = useState<Resource>(RESOURCES[0]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Cliente que la ficha de Clientes manda a otra vista para trabajar con él
  // (facturarle o asignarle una tarea). La vista destino lo consume y lo limpia.
  const [handoffClientId, setHandoffClientId] = useState<string | null>(null);
  // Tarjeta concreta que el Kanban debe abrir al recibir el salto.
  const [handoffCardId, setHandoffCardId] = useState<string | null>(null);

  // Acordeones del sidebar; se abre el que contiene el item activo al entrar.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const base = Object.fromEntries(
      NAV_GROUPS.map((g) => [g.id, g.items.some((i) => "resource" in i)]),
    );
    if (typeof window === "undefined") return base;
    try {
      const saved = localStorage.getItem("dashboard:navGroups");
      return saved ? { ...base, ...JSON.parse(saved) } : base;
    } catch {
      return base;
    }
  });

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("dashboard:navGroups", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function isSelected(item: NavItem) {
    return "resource" in item
      ? view === "resource" && item.resource.table === active.table
      : view === item.view;
  }

  function selectItem(item: NavItem) {
    setEditing(null);
    setMenuOpen(false);
    if ("resource" in item) {
      setView("resource");
      setActive(item.resource);
    } else {
      setView(item.view);
    }
  }

  const handoff = useCallback(
    (view: View, clientId: string, cardId?: string) => {
      setEditing(null);
      setHandoffClientId(clientId);
      setHandoffCardId(cardId ?? null);
      setView(view);
    },
    [],
  );

  const clearHandoff = useCallback(() => {
    setHandoffClientId(null);
    setHandoffCardId(null);
  }, []);

  const load = useCallback(
    async (resource: Resource) => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from(resource.table)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) setError(error.message);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    load(active);
  }, [active, load]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleDelete(row: Row) {
    if (!row.id) return;
    if (!confirm("¿Eliminar este registro? Esta acción no se puede deshacer."))
      return;
    const { error } = await supabase
      .from(active.table)
      .delete()
      .eq("id", row.id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    load(active);
  }

  async function handleSave(record: Row) {
    setError(null);
    // Normaliza campos numéricos y de lista.
    const payload: Row = { ...record };
    for (const f of active.fields) {
      if (f.type === "number") payload[f.key] = Number(payload[f.key] ?? 0);
    }

    let res;
    if (record.id) {
      const { id, ...rest } = payload;
      res = await supabase
        .from(active.table)
        .update(rest)
        .eq("id", id as string);
    } else {
      const rest = { ...payload };
      delete rest.id;
      // Omite campos opcionales vacíos al crear para que la BD aplique su
      // propio default (ej. public_token de clients) en vez de "".
      for (const f of active.fields) {
        if (f.optional && rest[f.key] === "") delete rest[f.key];
      }
      res = await supabase.from(active.table).insert(rest);
    }

    if (res.error) {
      setError(res.error.message);
      return false;
    }
    setEditing(null);
    load(active);
    return true;
  }

  return (
    <main
      style={{
        ...styles.shell,
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Sidebar; en teléfono es una barra superior con menú desplegable. */}
      <aside
        style={{
          ...styles.sidebar,
          ...(isMobile
            ? {
                width: "100%",
                height: "auto",
                position: "static",
                borderRight: "none",
                borderBottom: "1px solid #1e1e1e",
                padding: "16px 18px",
              }
            : null),
        }}
      >
        <div
          style={
            isMobile
              ? {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }
              : { marginBottom: 32 }
          }
        >
          <div>
            <div style={styles.brandTag}>Panel</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}>
              C Digital
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{ ...styles.ghostBtn, minHeight: 40 }}
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕ Cerrar" : "☰ Menú"}
            </button>
          )}
        </div>

        <nav
          style={{
            display: isMobile && !menuOpen ? "none" : "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: isMobile ? 14 : 0,
          }}
        >
          {NAV_GROUPS.map((group) => {
            const open = openGroups[group.id] ?? false;
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  style={styles.navGroupHeader}
                >
                  <span>{group.label}</span>
                  <span style={{ color: "#555" }}>{open ? "▾" : "▸"}</span>
                </button>

                {open && (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {group.items.map((item) => {
                      const selected = isSelected(item);
                      return (
                        <button
                          key={item.key}
                          onClick={() => selectItem(item)}
                          style={{
                            ...styles.navItem,
                            background: selected ? "#1e1e1e" : "transparent",
                            color: selected ? "#fff" : "#999",
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div
          style={{
            display: isMobile && !menuOpen ? "none" : "block",
            marginTop: "auto",
            paddingTop: isMobile ? 16 : 24,
          }}
        >
          <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
            {userEmail}
          </div>
          <button onClick={handleLogout} style={styles.logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <section
        style={{
          ...styles.content,
          padding: isMobile ? "20px 16px" : "36px 44px",
          minWidth: 0,
          maxWidth:
            view === "kanban"
              ? "none"
              : view === "facturacion" || view === "clientes"
                ? 1200
                : 1000,
        }}
      >
        {view === "clientes" ? (
          <>
            <div style={styles.header}>
              <div>
                <h1 style={{ fontSize: 28, margin: 0 }}>Clientes</h1>
                <p style={{ color: "#888", fontSize: 13, marginTop: 6 }}>
                  Ficha, datos fiscales e historial: desde aquí se factura y se
                  asignan tareas
                </p>
              </div>
            </div>
            <Clientes
              supabase={supabase}
              onCreateInvoice={(id) => handoff("facturacion", id)}
              onAssignTask={(id) => handoff("kanban", id)}
              onOpenTask={(id, cardId) => handoff("kanban", id, cardId)}
            />
          </>
        ) : view === "kanban" ? (
          <>
            <div style={styles.header}>
              <h1 style={{ fontSize: 28, margin: 0 }}>Kanban</h1>
            </div>
            <KanbanBoard
              supabase={supabase}
              prefillClientId={handoffClientId}
              prefillCardId={handoffCardId}
              onPrefillUsed={clearHandoff}
            />
          </>
        ) : view === "solicitudes" ? (
          <>
            <div style={styles.header}>
              <div>
                <h1 style={{ fontSize: 28, margin: 0 }}>Solicitudes</h1>
                <p style={{ color: "#888", fontSize: 13, marginTop: 6 }}>
                  Auditorías digitales y reuniones agendadas por clientes
                </p>
              </div>
            </div>
            <Solicitudes supabase={supabase} />
          </>
        ) : view === "facturacion" ? (
          <>
            <div style={styles.header}>
              <div>
                <h1 style={{ fontSize: 28, margin: 0 }}>Facturación</h1>
                <p style={{ color: "#888", fontSize: 13, marginTop: 6 }}>
                  Facturas a clientes y pagos al equipo, con abonos parciales
                </p>
              </div>
            </div>
            <Facturacion
              supabase={supabase}
              prefillClientId={handoffClientId}
              onPrefillUsed={clearHandoff}
            />
          </>
        ) : (
          <>
            <div style={styles.header}>
              <div>
                <h1 style={{ fontSize: 28, margin: 0 }}>{active.label}</h1>
                <p style={{ color: "#888", fontSize: 13, marginTop: 6 }}>
                  {rows.length} registro{rows.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setEditing({ ...emptyRecord(active) })}
                style={styles.primaryBtn}
              >
                + Nuevo {active.singular}
              </button>
            </div>

            {error && <p style={styles.errorBox}>{error}</p>}

            {loading ? (
              <p style={{ color: "#888" }}>Cargando…</p>
            ) : (
              <div style={styles.list}>
                {rows.map((row) => (
                  <RowCard
                    key={String(row.id)}
                    row={row}
                    resource={active}
                    onEdit={() => setEditing(row)}
                    onDelete={() => handleDelete(row)}
                  />
                ))}
                {rows.length === 0 && (
                  <p style={{ color: "#666" }}>Aún no hay registros.</p>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {editing && (
        <Editor
          resource={active}
          record={editing}
          supabase={supabase}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

/* ---------------- Row card ---------------- */

function RowCard({
  row,
  resource,
  onEdit,
  onDelete,
}: {
  row: Row;
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const img = resource.imageKey ? (row[resource.imageKey] as string) : "";
  return (
    <div style={styles.card}>
      {resource.imageKey && (
        <div style={styles.thumb}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" style={styles.thumbImg} />
          ) : (
            <span style={{ color: "#555", fontSize: 11 }}>Sin imagen</span>
          )}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>
          {String(row[resource.titleKey] ?? "—")}
        </div>
        {resource.subtitleKey && (
          <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
            {String(row[resource.subtitleKey] ?? "")}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onEdit} style={styles.ghostBtn}>
          Editar
        </button>
        <button onClick={onDelete} style={styles.dangerBtn}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

/* ---------------- Editor ---------------- */

function Editor({
  resource,
  record,
  supabase,
  onClose,
  onSave,
}: {
  resource: Resource;
  record: Row;
  supabase: ReturnType<typeof createClient>;
  onClose: () => void;
  onSave: (r: Row) => Promise<boolean>;
}) {
  const [form, setForm] = useState<Row>({ ...record });
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (!ok) return;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{
          ...styles.drawer,
          // En teléfono el editor ocupa la pantalla completa.
          ...(isMobile
            ? { width: "100%", height: "100dvh", borderLeft: "none" }
            : null),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.drawerHeader}>
          <h2 style={{ margin: 0, fontSize: 20 }}>
            {record.id ? "Editar" : "Nuevo"} {resource.singular}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div style={styles.drawerBody}>
          {resource.fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={form[field.key]}
              onChange={(v) => set(field.key, v)}
              supabase={supabase}
              table={resource.table}
            />
          ))}
        </div>

        <div style={styles.drawerFooter}>
          <button onClick={onClose} style={styles.ghostBtn}>
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{ ...styles.primaryBtn, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Field inputs ---------------- */

function FieldInput({
  field,
  value,
  onChange,
  supabase,
  table,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  supabase: ReturnType<typeof createClient>;
  table: string;
}) {
  return (
    <label style={styles.fieldWrap}>
      <span style={styles.fieldLabel}>{field.label}</span>

      {field.type === "text" && (
        <input
          style={styles.input}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          style={styles.input}
          value={(value as number) ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "richtext" && (
        <textarea
          style={{
            ...styles.input,
            minHeight: 220,
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: 13,
          }}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "boolean" && (
        <button
          type="button"
          onClick={() => onChange(!value)}
          style={{
            ...styles.toggle,
            background: value ? "#fff" : "#222",
            color: value ? "#000" : "#888",
          }}
        >
          {value ? "Sí" : "No"}
        </button>
      )}

      {field.type === "list" && (
        <textarea
          style={{ ...styles.input, minHeight: 120, resize: "vertical" }}
          value={Array.isArray(value) ? (value as string[]).join("\n") : ""}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
      )}

      {field.type === "image" && (
        <ImageInput
          value={(value as string) ?? ""}
          onChange={onChange}
          supabase={supabase}
          table={table}
        />
      )}

      {field.help && <span style={styles.help}>{field.help}</span>}

      {field.copyPath && <CopyPathButton path={field.copyPath} />}
    </label>
  );
}

function CopyPathButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${siteOrigin()}${path}`;

  async function copy(e: React.MouseEvent) {
    // El botón vive dentro del <label>; sin esto el click reenfoca el input.
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el enlace:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{ ...styles.ghostBtn, alignSelf: "flex-start", marginTop: 6 }}
      title={url}
    >
      {copied ? "✓ Link copiado" : "Copiar link de registro"}
    </button>
  );
}

function ImageInput({
  value,
  onChange,
  supabase,
  table,
}: {
  value: string;
  onChange: (v: string) => void;
  supabase: ReturnType<typeof createClient>;
  table: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación: solo imágenes rasterizadas (svg puede contener scripts).
    const allowed = ["png", "jpg", "jpeg", "webp", "gif"];
    const ext = (
      file.name.match(/\.([a-z0-9]{1,5})$/i)?.[1] ?? ""
    ).toLowerCase();
    if (!file.type.startsWith("image/") || !allowed.includes(ext)) {
      alert("Formato no permitido. Usa PNG, JPG, WEBP o GIF.");
      return;
    }

    setUploading(true);
    const path = `${table}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      alert("Error al subir: " + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {value && (
        <div style={{ position: "relative", alignSelf: "flex-start" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" style={styles.preview} />
          <button
            type="button"
            onClick={() => onChange("")}
            title="Quitar imagen"
            style={styles.removeImg}
          >
            ✕
          </button>
        </div>
      )}
      <input
        style={styles.input}
        placeholder="/ruta/imagen.png o URL"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <label style={styles.uploadBtn}>
          {uploading
            ? "Subiendo…"
            : value
              ? "Reemplazar imagen"
              : "Subir imagen"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={styles.ghostBtn}
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    fontFamily: "inherit",
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    borderRight: "1px solid #1e1e1e",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brandTag: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 3,
    color: "#666",
    marginBottom: 4,
  },
  navItem: {
    textAlign: "left",
    padding: "11px 14px",
    borderRadius: 8,
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    transition: "background .15s",
  },
  navGroupHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 14px",
    marginBottom: 2,
    background: "transparent",
    border: "none",
    borderRadius: 8,
    color: "#666",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 2,
    cursor: "pointer",
  },
  logout: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#999",
    fontSize: 13,
    cursor: "pointer",
  },
  content: { flex: 1, padding: "36px 44px", maxWidth: 1000 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  primaryBtn: {
    padding: "11px 18px",
    background: "#fff",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 14,
    background: "#121212",
    border: "1px solid #1e1e1e",
    borderRadius: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    background: "#1c1c1c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "contain" },
  ghostBtn: {
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: 7,
    color: "#ddd",
    fontSize: 13,
    cursor: "pointer",
  },
  dangerBtn: {
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid #4a2020",
    borderRadius: 7,
    color: "#ff8080",
    fontSize: 13,
    cursor: "pointer",
  },
  errorBox: {
    background: "#2a1515",
    border: "1px solid #4a2020",
    color: "#ff9b9b",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 50,
  },
  drawer: {
    width: "min(560px, 100%)",
    background: "#0e0e0e",
    borderLeft: "1px solid #1e1e1e",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #1e1e1e",
  },
  drawerBody: {
    padding: 24,
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  drawerFooter: {
    padding: "16px 24px",
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
  fieldWrap: { display: "flex", flexDirection: "column", gap: 7 },
  fieldLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#888",
  },
  input: {
    padding: "11px 13px",
    // 16px evita que iOS haga zoom al enfocar el campo.
    fontSize: 16,
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  toggle: {
    alignSelf: "flex-start",
    padding: "8px 22px",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  help: { fontSize: 12, color: "#666" },
  preview: {
    maxWidth: 140,
    maxHeight: 90,
    objectFit: "contain",
    background: "#1a1a1a",
    borderRadius: 8,
    padding: 6,
  },
  uploadBtn: {
    alignSelf: "flex-start",
    padding: "9px 16px",
    background: "#1e1e1e",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    color: "#ddd",
  },
  removeImg: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#1a1a1a",
    border: "1px solid #3a3a3a",
    color: "#ff8080",
    fontSize: 12,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
