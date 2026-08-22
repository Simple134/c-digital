"use client";

/* Hallmark · component: panel de cliente · genre: producto · theme: sistema
 * existente c-digital (paper #0a0a0a · cards #1a1a1a · acento #5aa9ff ·
 * aviso #e6b800 · ok #00e5a0)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { dueBadge, dueState, fmtDueDate } from "@/lib/delivery";
import { fmtDateTime } from "@/lib/format";
import {
  computeTotals,
  fmtMoney,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/invoices";
import type {
  Client,
  ClientFile,
  Invoice,
  InvoiceItem,
  InvoicePayment,
  InvoiceReceipt,
  KanbanCard,
  KanbanColumn,
  MeetingRequest,
} from "@/lib/supabase/types";
import useIsMobile from "../(auth)/dashboard/useIsMobile";

export type PanelFile = ClientFile & { signedUrl: string | null };
export type PanelReceipt = InvoiceReceipt & { signedUrl: string | null };

type SectionId =
  "dashboard" | "tareas" | "archivos" | "facturacion" | "reuniones" | "cuenta";

const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◫" },
  { id: "tareas", label: "Tareas", icon: "☰" },
  { id: "archivos", label: "Archivos", icon: "▤" },
  { id: "facturacion", label: "Facturación", icon: "$" },
  { id: "reuniones", label: "Reuniones", icon: "◷" },
  { id: "cuenta", label: "Cuenta", icon: "◉" },
];

const PRIORITY_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const MEETING_STATUS_LABEL: Record<string, string> = {
  nuevo: "Solicitada",
  contactado: "Coordinando",
  en_seguimiento: "Coordinando",
  cerrado: "Realizada",
  descartado: "Descartada",
};

interface Props {
  client: Client;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  invoices: Invoice[];
  items: InvoiceItem[];
  payments: InvoicePayment[];
  files: PanelFile[];
  receipts: PanelReceipt[];
  meetings: MeetingRequest[];
}

/**
 * Clasifica las tareas en tres cubos para el cliente: por hacer (primera
 * columna del tablero), haciendo (el resto) y hechas (columna terminal o
 * `completed_at`). Es una simplificación deliberada del kanban del equipo.
 */
function bucketize(cards: KanbanCard[], columns: KanbanColumn[]) {
  const firstColId = columns.find((c) => !c.is_done)?.id;
  const doneColIds = new Set(columns.filter((c) => c.is_done).map((c) => c.id));
  const done: KanbanCard[] = [];
  const todo: KanbanCard[] = [];
  const doing: KanbanCard[] = [];
  for (const card of cards) {
    if (card.completed_at || doneColIds.has(card.column_id)) done.push(card);
    else if (card.column_id === firstColId) todo.push(card);
    else doing.push(card);
  }
  return { todo, doing, done };
}

export default function Panel(props: Props) {
  const { client, cards } = props;
  const [section, setSection] = useState<SectionId>("dashboard");
  const isMobile = useIsMobile();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const pendingOfClient = cards.filter(
    (c) => c.assigned_to_client && !c.completed_at,
  );

  return (
    <div
      style={{ ...styles.shell, flexDirection: isMobile ? "column" : "row" }}
    >
      <nav
        style={isMobile ? styles.tabbar : styles.sidebar}
        aria-label="Secciones del panel"
      >
        {!isMobile && (
          <div style={styles.sideHead}>
            <span style={styles.sideLabel}>Panel de</span>
            <span style={styles.sideName}>{client.name}</span>
          </div>
        )}
        {SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                ...styles.navBtn,
                ...(isMobile ? styles.navBtnMobile : null),
                ...(active ? styles.navBtnActive : null),
              }}
              aria-current={active ? "page" : undefined}
            >
              <span aria-hidden style={styles.navIcon}>
                {s.icon}
              </span>
              {s.label}
              {s.id === "tareas" && pendingOfClient.length > 0 && (
                <span style={styles.navBadge}>{pendingOfClient.length}</span>
              )}
            </button>
          );
        })}
        <button
          onClick={signOut}
          style={{
            ...styles.navBtn,
            ...(isMobile ? styles.navBtnMobile : { marginTop: "auto" }),
            color: "#777",
          }}
        >
          <span aria-hidden style={styles.navIcon}>
            ⏻
          </span>
          Cerrar sesión
        </button>
      </nav>

      <main style={styles.main}>
        {isMobile && (
          <div style={styles.mobileHead}>
            <span style={styles.sideLabel}>Panel de</span>
            <span style={styles.sideName}>{client.name}</span>
          </div>
        )}
        {section === "dashboard" && (
          <DashboardSection {...props} goTo={setSection} />
        )}
        {section === "tareas" && <TareasSection {...props} />}
        {section === "archivos" && <ArchivosSection {...props} />}
        {section === "facturacion" && <FacturacionSection {...props} />}
        {section === "reuniones" && <ReunionesSection {...props} />}
        {section === "cuenta" && <CuentaSection client={client} />}
      </main>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function DashboardSection(props: Props & { goTo: (s: SectionId) => void }) {
  const { cards, columns, invoices, items, payments, goTo } = props;
  const { todo, doing, done } = bucketize(cards, columns);
  const total = cards.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  const pendingOfClient = cards.filter(
    (c) => c.assigned_to_client && !c.completed_at,
  );

  // Facturación por moneda: total emitido y cuánto va pagado.
  const billing: Record<string, { total: number; paid: number }> = {};
  for (const inv of invoices) {
    const t = computeTotals(
      inv,
      items.filter((i) => i.invoice_id === inv.id),
      payments.filter((p) => p.invoice_id === inv.id),
    );
    const acc = (billing[inv.currency] ??= { total: 0, paid: 0 });
    acc.total += t.total;
    acc.paid += t.paid;
  }

  // Entregas estimadas: próximas fechas límite de tareas abiertas.
  const upcoming = cards
    .filter((c) => c.due_date && !c.completed_at)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
    .slice(0, 5);

  return (
    <section style={styles.section}>
      <h2 style={styles.h2}>Dashboard</h2>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Progreso del proyecto</span>
          <span style={styles.statValue}>
            {pct}%{" "}
            <span style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>
              {pct >= 100 ? "completado" : "y avanzando"}
            </span>
          </span>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${pct}%` }} />
          </div>
          <span style={styles.statFoot}>
            {done.length} de {total} tareas completadas
          </span>
        </div>

        {Object.entries(billing).map(([cur, b]) => (
          <div key={cur} style={styles.statCard}>
            <span style={styles.statLabel}>Facturado ({cur})</span>
            <span style={styles.statValue}>{fmtMoney(b.total, cur)}</span>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  background: "#00e5a0",
                  width: b.total
                    ? `${Math.min(100, (b.paid / b.total) * 100)}%`
                    : 0,
                }}
              />
            </div>
            <span style={styles.statFoot}>
              Pagado {fmtMoney(b.paid, cur)} ·{" "}
              {b.total ? Math.round((b.paid / b.total) * 100) : 0}%
            </span>
          </div>
        ))}
        {Object.keys(billing).length === 0 && (
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Facturado</span>
            <span style={{ ...styles.statValue, color: "#888" }}>—</span>
            <span style={styles.statFoot}>Sin facturas emitidas</span>
          </div>
        )}

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Resumen de tareas</span>
          <div style={styles.bucketRow}>
            <Bucket label="Por hacer" count={todo.length} color="#888" />
            <Bucket label="Haciendo" count={doing.length} color="#5aa9ff" />
            <Bucket label="Hechas" count={done.length} color="#00e5a0" />
          </div>
        </div>
      </div>

      {pendingOfClient.length > 0 && (
        <>
          <h3 style={styles.h3}>Te toca a ti</h3>
          <div style={styles.cardList}>
            {pendingOfClient.map((card) => (
              <TaskCard
                key={card.id}
                card={card}
                onClick={() => goTo("tareas")}
              />
            ))}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <h3 style={{ ...styles.h3, color: "#5aa9ff" }}>Entregas estimadas</h3>
          <div style={styles.card}>
            {upcoming.map((card) => (
              <div key={card.id} style={styles.upcomingRow}>
                <span style={{ fontSize: 13 }}>{card.title}</span>
                <span style={{ fontSize: 12, color: "#5aa9ff" }}>
                  {fmtDueDate(card.due_date)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Bucket({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 22, fontWeight: 600, color }}>{count}</span>
      <span style={{ fontSize: 10, color: "#777", letterSpacing: 0.5 }}>
        {label}
      </span>
    </div>
  );
}

/* ---------------- Tareas ---------------- */

/**
 * Una sesión caducada se manifiesta como 401 en cualquier acción del panel.
 * Mostrar "no autorizado" y dejar al cliente ahí no le sirve de nada: se le
 * lleva al login, que es lo único que lo desbloquea. El 403 (cuenta sin
 * vincular) no se toca: ahí reloguear no arregla nada y el mensaje del
 * servidor es la información útil.
 */
function sesionExpirada(res: Response): boolean {
  if (res.status !== 401) return false;
  window.location.href = "/login";
  return true;
}

function TareasSection(props: Props) {
  const { cards, columns } = props;
  const router = useRouter();
  const { todo, doing, done } = bucketize(cards, columns);
  const [open, setOpen] = useState<KanbanCard | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/panel/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (sesionExpirada(res)) return;
        setError(data.error ?? "No se pudo crear la tarea.");
      } else {
        setAdding(false);
        setTitle("");
        setDesc("");
        router.refresh();
      }
    } catch {
      setError("Fallo de red: inténtalo de nuevo.");
    }
    setBusy(false);
  }

  const groups: [string, KanbanCard[], string][] = [
    ["Por hacer", todo, "#888"],
    ["Haciendo", doing, "#5aa9ff"],
    ["Hechas", done, "#00e5a0"],
  ];

  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <h2 style={styles.h2}>Tareas</h2>
        <button onClick={() => setAdding(true)} style={styles.primaryBtn}>
          + Agregar tarea
        </button>
      </div>

      {cards.length === 0 && (
        <p style={styles.empty}>Aún no hay tareas en tu proyecto.</p>
      )}

      {groups.map(
        ([label, group, color]) =>
          group.length > 0 && (
            <div key={label}>
              <h3 style={{ ...styles.h3, color }}>
                {label} · {group.length}
              </h3>
              <div style={styles.cardList}>
                {group.map((card) => (
                  <TaskCard
                    key={card.id}
                    card={card}
                    onClick={() => setOpen(card)}
                  />
                ))}
              </div>
            </div>
          ),
      )}

      {/* Modal de detalle de tarea */}
      {open && (
        <Modal onClose={() => setOpen(null)} title={open.title}>
          {open.assigned_to_client && !open.completed_at && (
            <span style={styles.waitingTag}>Pendiente de ti</span>
          )}
          {open.image_url && (
            <a href={open.image_url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={open.image_url}
                alt={`Referencia de: ${open.title}`}
                style={styles.taskImage}
              />
            </a>
          )}
          {open.description && (
            <p
              style={{
                ...styles.cardDesc,
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              {open.description}
            </p>
          )}
          <div style={styles.cardMeta}>
            {open.priority && (
              <span
                style={{ ...styles.pill, color: "#999", borderColor: "#333" }}
              >
                Prioridad {PRIORITY_LABEL[open.priority] ?? open.priority}
              </span>
            )}
            {open.due_date && (
              <span
                style={{
                  ...styles.pill,
                  color: "#5aa9ff",
                  borderColor: "#2b3f6b",
                }}
              >
                Entrega {fmtDueDate(open.due_date)}
              </span>
            )}
            {open.completed_at && (
              <span
                style={{
                  ...styles.pill,
                  color: "#00e5a0",
                  borderColor: "#1f5c48",
                }}
              >
                Completada {fmtDateTime(open.completed_at)}
              </span>
            )}
          </div>
          <span style={styles.metaText}>
            Creada el {fmtDateTime(open.created_at)}
          </span>
        </Modal>
      )}

      {/* Modal de nueva tarea */}
      {adding && (
        <Modal onClose={() => setAdding(false)} title="Agregar tarea">
          <form onSubmit={addTask} style={styles.form}>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>¿Qué necesitas?</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="Ej: Cambiar el logo del sitio"
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Detalles (opcional)</span>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Cuéntanos más para poder empezar sin preguntarte"
                style={{ ...styles.input, resize: "vertical" }}
              />
            </label>
            {error && <p style={styles.formError}>{error}</p>}
            <button type="submit" disabled={busy} style={styles.primaryBtn}>
              {busy ? "Enviando…" : "Crear tarea"}
            </button>
            <p style={styles.metaText}>
              La tarea entra a la lista del equipo; te avisaremos cuando esté en
              marcha.
            </p>
          </form>
        </Modal>
      )}
    </section>
  );
}

function TaskCard({
  card,
  onClick,
}: {
  card: KanbanCard;
  onClick?: () => void;
}) {
  const waiting = card.assigned_to_client && !card.completed_at;
  const dueInfo = dueBadge(
    dueState(card.due_date, card.completed_at),
    card.due_date,
  );
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.card,
        ...styles.cardClickable,
        ...(waiting ? styles.cardWaiting : null),
      }}
    >
      {waiting && <span style={styles.waitingTag}>Pendiente de ti</span>}
      <span style={styles.cardTitle}>
        <span aria-hidden style={styles.cardMark}>
          {card.completed_at ? "✓" : "○"}
        </span>
        {card.title}
      </span>
      {card.description && (
        <p style={styles.cardDesc}>
          {card.description.length > 140
            ? `${card.description.slice(0, 140)}…`
            : card.description}
        </p>
      )}
      <div style={styles.cardMeta}>
        {dueInfo && (
          <span
            style={{
              ...styles.pill,
              color: dueInfo.color,
              borderColor: dueInfo.color,
            }}
          >
            {dueInfo.label}
          </span>
        )}
        {card.priority && (
          <span style={{ ...styles.pill, color: "#999", borderColor: "#333" }}>
            {PRIORITY_LABEL[card.priority] ?? card.priority}
          </span>
        )}
      </div>
    </button>
  );
}

/* ---------------- Archivos ---------------- */

const FILE_GROUPS: { kind: ClientFile["kind"]; label: string }[] = [
  { kind: "credencial", label: "Credenciales" },
  { kind: "contrato", label: "Contratos" },
  { kind: "documento", label: "Documentos" },
  { kind: "link", label: "Links" },
];

function ArchivosSection({ files }: Props) {
  return (
    <section style={styles.section}>
      <h2 style={styles.h2}>Archivos</h2>
      {files.length === 0 && (
        <p style={styles.empty}>
          Aquí verás credenciales, contratos, documentos y links de tu proyecto
          cuando el equipo los comparta.
        </p>
      )}
      {FILE_GROUPS.map(({ kind, label }) => {
        const group = files.filter((f) => f.kind === kind);
        if (group.length === 0) return null;
        return (
          <div key={kind}>
            <h3 style={styles.h3}>{label}</h3>
            <div style={styles.cardList}>
              {group.map((f) => {
                // Defensa en profundidad: nunca renderizar un href que no sea
                // http(s), aunque la API ya lo valide al guardar.
                const raw = f.kind === "link" ? f.url : f.signedUrl;
                const href = raw && /^https?:\/\//i.test(raw) ? raw : null;
                return (
                  <div key={f.id} style={styles.card}>
                    <div style={styles.rowBetween}>
                      <span style={styles.cardTitle}>{f.title}</span>
                      {href && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.linkBtn}
                        >
                          {f.kind === "link" ? "Abrir" : "Descargar"}
                        </a>
                      )}
                    </div>
                    {f.note && <p style={styles.cardDesc}>{f.note}</p>}
                    <span style={styles.metaText}>
                      Compartido el {fmtDateTime(f.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ---------------- Facturación ---------------- */

function FacturacionSection({ invoices, items, payments, receipts }: Props) {
  const router = useRouter();
  const [uploadFor, setUploadFor] = useState<Invoice | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadReceipt(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFor || !file) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("invoiceId", uploadFor.id);
    form.set("file", file);
    form.set("note", note);
    try {
      const res = await fetch("/api/panel/receipt", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        if (sesionExpirada(res)) return;
        setError(data.error ?? "No se pudo subir el comprobante.");
      } else {
        setUploadFor(null);
        setFile(null);
        setNote("");
        router.refresh();
      }
    } catch {
      setError("Fallo de red: inténtalo de nuevo.");
    }
    setBusy(false);
  }

  return (
    <section style={styles.section}>
      <h2 style={styles.h2}>Facturación</h2>
      {invoices.length === 0 && (
        <p style={styles.empty}>Sin facturas emitidas</p>
      )}
      <div style={styles.cardList}>
        {invoices.map((inv) => {
          const t = computeTotals(
            inv,
            items.filter((i) => i.invoice_id === inv.id),
            payments.filter((p) => p.invoice_id === inv.id),
          );
          const invReceipts = receipts.filter((r) => r.invoice_id === inv.id);
          const invPayments = payments.filter((p) => p.invoice_id === inv.id);
          return (
            <div key={inv.id} style={styles.card}>
              <div style={styles.rowBetween}>
                <span style={styles.cardTitle}>Factura {inv.number}</span>
                <span
                  style={{
                    ...styles.pill,
                    color: STATUS_COLOR[t.status],
                    borderColor: STATUS_COLOR[t.status],
                  }}
                >
                  {STATUS_LABEL[t.status]}
                </span>
              </div>
              {inv.description && (
                <p style={styles.cardDesc}>{inv.description}</p>
              )}
              <div style={styles.rowBetween}>
                <span style={styles.metaText}>
                  Emitida el {fmtDateTime(inv.issued_at)}
                </span>
                <span style={styles.invAmount}>
                  {t.balance > 0
                    ? `Saldo: ${fmtMoney(t.balance, inv.currency)}`
                    : fmtMoney(t.total, inv.currency)}
                </span>
              </div>

              {/* Vista de pagos: los abonos registrados por el equipo. */}
              {invPayments.length > 0 && (
                <div style={styles.paymentsBox}>
                  {invPayments.map((p) => (
                    <div key={p.id} style={styles.rowBetween}>
                      <span style={styles.metaText}>
                        {fmtDateTime(p.paid_at)} · {p.method}
                      </span>
                      <span style={{ fontSize: 12, color: "#00e5a0" }}>
                        {fmtMoney(p.amount, inv.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Comprobantes que el cliente ha subido. */}
              {invReceipts.length > 0 && (
                <div style={styles.paymentsBox}>
                  {invReceipts.map((r) => (
                    <div key={r.id} style={styles.rowBetween}>
                      <span style={styles.metaText}>
                        Comprobante · {fmtDateTime(r.created_at)}
                        {r.note ? ` · ${r.note}` : ""}
                      </span>
                      {r.signedUrl && (
                        <a
                          href={r.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ ...styles.linkBtn, padding: "3px 9px" }}
                        >
                          Ver
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href={`/factura/${inv.public_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.linkBtn}
                >
                  Ver factura
                </a>
                {t.balance > 0 && inv.gestiono_share_url && (
                  <a
                    href={inv.gestiono_share_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...styles.linkBtn, ...styles.linkBtnPrimary }}
                  >
                    Pagar en línea
                  </a>
                )}
                <button
                  onClick={() => {
                    setUploadFor(inv);
                    setError(null);
                  }}
                  style={{ ...styles.linkBtn, cursor: "pointer" }}
                >
                  Subir comprobante
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {uploadFor && (
        <Modal
          onClose={() => setUploadFor(null)}
          title={`Comprobante · Factura ${uploadFor.number}`}
        >
          <form onSubmit={uploadReceipt} style={styles.form}>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>
                Volante o comprobante (PDF o imagen, máx. 10 MB)
              </span>
              <input
                type="file"
                required
                accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ ...styles.input, padding: 10 }}
              />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Nota (opcional)</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                placeholder="Ej: transferencia del 15 de agosto"
                style={styles.input}
              />
            </label>
            {error && <p style={styles.formError}>{error}</p>}
            <button
              type="submit"
              disabled={busy || !file}
              style={styles.primaryBtn}
            >
              {busy ? "Subiendo…" : "Enviar comprobante"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}

/* ---------------- Reuniones ---------------- */

function ReunionesSection({ meetings }: Props) {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestMeeting(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/panel/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (sesionExpirada(res)) return;
        setError(data.error ?? "No se pudo enviar la solicitud.");
      } else {
        setRequesting(false);
        setDate("");
        setTime("");
        setNote("");
        router.refresh();
      }
    } catch {
      setError("Fallo de red: inténtalo de nuevo.");
    }
    setBusy(false);
  }

  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <h2 style={styles.h2}>Reuniones</h2>
        <button onClick={() => setRequesting(true)} style={styles.primaryBtn}>
          + Solicitar reunión
        </button>
      </div>

      {meetings.length === 0 && (
        <p style={styles.empty}>
          Aún no tienes reuniones registradas. Solicita una cuando quieras.
        </p>
      )}

      <div style={styles.cardList}>
        {meetings.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.rowBetween}>
              <span style={styles.cardTitle}>
                {m.meeting_start || m.meeting_date
                  ? m.meeting_start
                    ? fmtDateTime(m.meeting_start)
                    : `${fmtDueDate(m.meeting_date)}${m.meeting_time ? ` · ${m.meeting_time}` : ""}`
                  : "Fecha por coordinar"}
              </span>
              <span
                style={{
                  ...styles.pill,
                  color: m.status === "cerrado" ? "#00e5a0" : "#e6b800",
                  borderColor: m.status === "cerrado" ? "#1f5c48" : "#5c4c1f",
                }}
              >
                {MEETING_STATUS_LABEL[m.status] ?? m.status}
              </span>
            </div>
            {m.note && <p style={styles.cardDesc}>{m.note}</p>}
            {/* Resumen de lo hablado: lo escribe el equipo tras la reunión. */}
            {m.summary && (
              <div style={styles.summaryBox}>
                <span style={styles.fieldLabel}>Resumen de lo hablado</span>
                <p
                  style={{
                    ...styles.cardDesc,
                    color: "#ccc",
                    whiteSpace: "pre-wrap",
                    marginTop: 4,
                  }}
                >
                  {m.summary}
                </p>
              </div>
            )}
            <div style={styles.rowBetween}>
              <span style={styles.metaText}>
                Solicitada el {fmtDateTime(m.created_at)}
              </span>
              {m.meet_link && (
                <a
                  href={m.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.linkBtn, ...styles.linkBtnPrimary }}
                >
                  Entrar al Meet
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {requesting && (
        <Modal onClose={() => setRequesting(false)} title="Solicitar reunión">
          <form onSubmit={requestMeeting} style={styles.form}>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>¿De qué quieres hablar?</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                rows={3}
                maxLength={2000}
                placeholder="Ej: revisar los avances del sitio y el plan de redes"
                style={{ ...styles.input, resize: "vertical" }}
              />
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ ...styles.field, flex: 1 }}>
                <span style={styles.fieldLabel}>Fecha preferida</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                />
              </label>
              <label style={{ ...styles.field, flex: 1 }}>
                <span style={styles.fieldLabel}>Hora</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={styles.input}
                />
              </label>
            </div>
            {error && <p style={styles.formError}>{error}</p>}
            <button type="submit" disabled={busy} style={styles.primaryBtn}>
              {busy ? "Enviando…" : "Enviar solicitud"}
            </button>
            <p style={styles.metaText}>
              Te confirmaremos por correo la fecha y el enlace de la reunión.
            </p>
          </form>
        </Modal>
      )}
    </section>
  );
}

/* ---------------- Cuenta ---------------- */

function CuentaSection({ client }: { client: Client }) {
  const rows: [string, string | null][] = [
    ["Nombre", client.name],
    ["Empresa", client.company],
    ["Contacto", client.contact_name],
    ["Correo", client.email],
    ["Teléfono", client.phone],
    ["RNC / Cédula", client.tax_id],
    ["Dirección", client.address],
    ["Sitio web", client.website],
    ...Object.entries(client.custom_fields ?? {}),
  ];
  return (
    <section style={styles.section}>
      <h2 style={styles.h2}>Cuenta</h2>
      <div style={styles.card}>
        {rows
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label} style={styles.accountRow}>
              <span style={styles.accountLabel}>{label}</span>
              <span style={styles.accountValue}>{value}</span>
            </div>
          ))}
      </div>
      <p style={styles.metaText}>
        ¿Algún dato incorrecto? Escríbenos y lo actualizamos.
      </p>
    </section>
  );
}

/* ---------------- Modal genérico ---------------- */

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
        <div style={styles.rowBetween}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Estilos ---------------- */

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    display: "flex",
  },
  sidebar: {
    width: 220,
    flex: "0 0 auto",
    borderRight: "1px solid #1e1e1e",
    padding: "28px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  tabbar: {
    display: "flex",
    gap: 4,
    padding: "10px 12px",
    borderBottom: "1px solid #1e1e1e",
    overflowX: "auto",
    position: "sticky",
    top: 0,
    background: "#0a0a0a",
    zIndex: 10,
  },
  sideHead: {
    display: "flex",
    flexDirection: "column",
    padding: "0 12px 20px",
  },
  mobileHead: { display: "flex", flexDirection: "column", marginBottom: 18 },
  sideLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#777",
  },
  sideName: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: "transparent",
    color: "#999",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "left",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  navBtnMobile: { padding: "7px 12px", flex: "0 0 auto" },
  navBtnActive: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    color: "#fff",
  },
  navIcon: { fontSize: 13, width: 16, textAlign: "center" },
  navBadge: {
    marginLeft: "auto",
    fontSize: 10,
    fontWeight: 700,
    color: "#0a0a0a",
    background: "#e6b800",
    borderRadius: 20,
    padding: "1px 7px",
  },
  main: { flex: 1, minWidth: 0, padding: "28px 24px 60px", maxWidth: 860 },
  section: { display: "flex", flexDirection: "column", gap: 14, paddingTop: 0 },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  h2: {
    margin: "0 0 6px",
    fontSize: 20,
    fontWeight: 600,
    textTransform: "none",
    letterSpacing: -0.3,
  },
  h3: { margin: "14px 0 0", fontSize: 14, fontWeight: 600, color: "#e6b800" },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  statCard: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#777",
  },
  statValue: { fontSize: 24, fontWeight: 600, letterSpacing: -0.5 },
  statFoot: { fontSize: 11, color: "#888" },
  bucketRow: {
    display: "flex",
    gap: 24,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    background: "#0a0a0a",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressFill: { height: "100%", background: "#5aa9ff", borderRadius: 20 },
  upcomingRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "7px 0",
    borderBottom: "1px solid #222",
  },
  cardList: { display: "flex", flexDirection: "column", gap: 10 },
  empty: { color: "#555", fontSize: 12, margin: 0 },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardClickable: {
    textAlign: "left",
    cursor: "pointer",
    color: "#fff",
    alignItems: "stretch",
    width: "100%",
  },
  cardWaiting: { borderColor: "#7a5c1a", background: "#1d1a12" },
  waitingTag: {
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0a0a0a",
    background: "#e6b800",
    borderRadius: 5,
    padding: "2px 7px",
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 14,
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    minWidth: 0,
    overflowWrap: "anywhere",
  },
  cardMark: { color: "#5aa9ff", fontSize: 12 },
  cardDesc: { color: "#999", fontSize: 12, margin: 0, lineHeight: 1.4 },
  cardMeta: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  pill: {
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: "2px 8px",
    whiteSpace: "nowrap",
  },
  metaText: { fontSize: 11, color: "#777" },
  rowBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  invAmount: { fontSize: 14, fontWeight: 600 },
  paymentsBox: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 8,
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  summaryBox: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 8,
    padding: "10px 12px",
  },
  linkBtn: {
    fontSize: 12,
    fontWeight: 600,
    color: "#bbb",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 7,
    padding: "6px 12px",
    textDecoration: "none",
  },
  linkBtnPrimary: {
    color: "#0a0a0a",
    background: "#5aa9ff",
    border: "1px solid #5aa9ff",
  },
  primaryBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0a0a0a",
    background: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    cursor: "pointer",
  },
  taskImage: {
    width: "100%",
    maxHeight: 220,
    objectFit: "cover",
    borderRadius: 8,
    display: "block",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 60,
  },
  modal: {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 20,
    width: "min(480px, 100%)",
    maxHeight: "85vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#888",
    fontSize: 16,
    cursor: "pointer",
    padding: 4,
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#888",
  },
  input: {
    padding: "11px 13px",
    background: "#0e0e0e",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    // 16px: por debajo iOS hace zoom al enfocar.
    fontSize: 16,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  formError: { color: "#ff8080", fontSize: 12, margin: 0 },
  accountRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "8px 0",
    borderBottom: "1px solid #222",
    fontSize: 13,
  },
  accountLabel: { color: "#777", flex: "0 0 auto" },
  accountValue: { color: "#ddd", textAlign: "right", overflowWrap: "anywhere" },
};
