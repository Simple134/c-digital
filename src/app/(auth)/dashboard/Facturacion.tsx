"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import InvoicePrintButton from "@/components/invoice/InvoicePrintButton";
import { fmtDateTime } from "@/lib/format";
import {
  clientBillingSnapshot,
  computeTotals,
  fmtMoney,
  itemTotal,
  paymentWarning,
  PAYMENT_METHODS,
  STATUS_COLOR,
  STATUS_LABEL,
  type InvoiceStatus,
} from "@/lib/invoices";
import type { createClient } from "@/lib/supabase/client";
import type {
  Client,
  Invoice,
  InvoiceCurrency,
  InvoiceItem,
  InvoiceParty,
  InvoicePayment,
  TeamMember,
} from "@/lib/supabase/types";
import useIsMobile from "./useIsMobile";

type Supabase = ReturnType<typeof createClient>;

/** Una factura con todo lo necesario para calcular su estado en el cliente. */
type FullInvoice = Invoice & {
  invoice_items: InvoiceItem[];
  invoice_payments: InvoicePayment[];
};

/** Fila de ítem en el formulario, antes de existir en la base de datos. */
type DraftItem = {
  concept: string;
  unit_price: number;
  quantity: number;
  unit: string;
};

const ITBIS = 18;

const emptyItem = (): DraftItem => ({
  concept: "",
  unit_price: 0,
  quantity: 1,
  unit: "UNIT",
});

/** `datetime-local` necesita "YYYY-MM-DDTHH:mm" en hora local, no ISO en UTC. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Facturacion({
  supabase,
  // Cliente con el que abrir una factura nueva al entrar. Lo manda la ficha de
  // Clientes; `onPrefillUsed` lo limpia para que cerrar el formulario y volver
  // a la sección no lo reabra solo.
  prefillClientId,
  onPrefillUsed,
}: {
  supabase: Supabase;
  prefillClientId?: string | null;
  onPrefillUsed?: () => void;
}) {
  const [invoices, setInvoices] = useState<FullInvoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partyFilter, setPartyFilter] = useState<InvoiceParty | "todas">(
    "todas",
  );
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "todos">(
    "todos",
  );
  const [editing, setEditing] = useState<FullInvoice | "new" | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [inv, cli, tm] = await Promise.all([
      // Ítems y abonos vienen anidados: el estado de cada factura se calcula en
      // el cliente y no vale la pena una consulta por fila.
      supabase
        .from("invoices")
        .select("*, invoice_items(*), invoice_payments(*)")
        .order("issued_at", { ascending: false }),
      supabase.from("clients").select("*").order("name"),
      supabase.from("team_members").select("*").order("name"),
    ]);
    if (inv.error) setError(inv.error.message);
    setInvoices(
      ((inv.data as FullInvoice[]) ?? []).map((i) => ({
        ...i,
        invoice_items: [...(i.invoice_items ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        invoice_payments: [...(i.invoice_payments ?? [])].sort((a, b) =>
          a.paid_at < b.paid_at ? -1 : 1,
        ),
      })),
    );
    setClients((cli.data as Client[]) ?? []);
    setTeam((tm.data as TeamMember[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  // El id se copia a estado local antes de avisar al padre: si solo leyéramos la
  // prop, el `onPrefillUsed` la dejaría en null en el mismo ciclo y el editor
  // abriría sin cliente seleccionado.
  const [prefilled, setPrefilled] = useState<string | null>(null);
  useEffect(() => {
    if (!prefillClientId) return;
    setPrefilled(prefillClientId);
    setEditing("new");
    onPrefillUsed?.();
  }, [prefillClientId, onPrefillUsed]);

  async function removeInvoice(inv: FullInvoice) {
    if (
      !confirm(
        `¿Eliminar la factura #${inv.number}? Se borrarán también sus abonos.`,
      )
    )
      return;
    const { error } = await supabase.from("invoices").delete().eq("id", inv.id);
    if (error) return alert("Error al eliminar: " + error.message);
    setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
  }

  // Id de la factura cuyo link se está generando: la llamada espeja la factura
  // en Gestiono y puede tardar, así que el botón tiene que quedar bloqueado o el
  // doble clic crearía dos facturas en la contabilidad.
  const [linking, setLinking] = useState<string | null>(null);

  // Link generado, para mostrarlo en el modal. Se guarda el monto y la moneda
  // junto al link porque el modal debe decir por cuánto cobra: el saldo de la
  // factura puede cambiar después y ya no coincidiría con lo que el link cobra.
  const [linkModal, setLinkModal] = useState<{
    url: string;
    amount: number;
    currency: string;
    reused: boolean;
  } | null>(null);

  async function paymentLink(inv: FullInvoice) {
    if (linking) return;
    setLinking(inv.id);
    try {
      const res = await fetch("/api/invoice-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: inv.id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error ?? "No se pudo generar el link.");

      setLinkModal({
        url: data.shareUrl,
        amount: Number(data.amount),
        currency: inv.currency,
        reused: Boolean(data.reused),
      });
      // Refresca para que la tarjeta muestre el link ya guardado.
      if (!data.reused) load();
    } finally {
      setLinking(null);
    }
  }

  async function sendEmail(inv: FullInvoice) {
    const to = prompt("Enviar la factura a:", inv.party_email ?? "");
    if (to === null) return;
    const res = await fetch("/api/invoice-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: inv.id, to: to.trim() || undefined }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error ?? "No se pudo enviar.");
    alert(
      data.sent
        ? `Factura enviada a ${data.recipient}.`
        : `No se envió: ${data.reason}`,
    );
  }

  // Los importes se calculan una sola vez por render y se reutilizan en el
  // resumen, los filtros y las tarjetas.
  const withTotals = useMemo(
    () =>
      invoices.map((inv) => ({
        inv,
        t: computeTotals(inv, inv.invoice_items, inv.invoice_payments),
      })),
    [invoices],
  );

  const visible = withTotals
    .filter(
      ({ inv }) => partyFilter === "todas" || inv.party_type === partyFilter,
    )
    .filter(({ t }) => statusFilter === "todos" || t.status === statusFilter);

  // Resumen: lo que falta cobrar a clientes vs. lo que falta pagarle al equipo.
  // Se agrupa por moneda porque sumar pesos con dólares daría un número falso.
  const summary = useMemo(() => {
    const acc: Record<string, { cobrar: number; pagar: number }> = {};
    for (const { inv, t } of withTotals) {
      if (t.balance <= 0) continue;
      const bucket = (acc[inv.currency] ??= { cobrar: 0, pagar: 0 });
      if (inv.party_type === "client") bucket.cobrar += t.balance;
      else bucket.pagar += t.balance;
    }
    return acc;
  }, [withTotals]);

  return (
    <div>
      {/* Resumen de saldos */}
      <div style={s.summaryRow}>
        {Object.entries(summary).map(([currency, v]) => (
          <div key={currency} style={s.summaryCard}>
            <div style={s.summaryLabel}>Por cobrar a clientes</div>
            <div style={{ ...s.summaryValue, color: "#00e5a0" }}>
              {fmtMoney(v.cobrar, currency)}
            </div>
            <div style={{ ...s.summaryLabel, marginTop: 12 }}>
              Por pagar al equipo
            </div>
            <div style={{ ...s.summaryValue, color: "#ff8080" }}>
              {fmtMoney(v.pagar, currency)}
            </div>
          </div>
        ))}
        <button
          onClick={() => setEditing("new")}
          style={{
            ...s.primaryBtn,
            ...(isMobile
              ? { ...s.touchBtn, marginLeft: 0, width: "100%" }
              : null),
          }}
        >
          + Nueva factura
        </button>
      </div>

      {/* Filtros */}
      <div style={s.filters}>
        {(["todas", "client", "team"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPartyFilter(p)}
            style={{
              ...s.chip,
              ...(isMobile ? s.touchChip : null),
              ...(partyFilter === p ? s.chipActive : {}),
            }}
          >
            {p === "todas"
              ? `Todas (${invoices.length})`
              : p === "client"
                ? `Clientes (${invoices.filter((i) => i.party_type === "client").length})`
                : `Equipo (${invoices.filter((i) => i.party_type === "team").length})`}
          </button>
        ))}
      </div>

      <div style={s.filters}>
        <button
          onClick={() => setStatusFilter("todos")}
          style={{
            ...s.chip,
            ...(isMobile ? s.touchChip : null),
            ...(statusFilter === "todos" ? s.chipActive : {}),
          }}
        >
          Todos los estados
        </button>
        {(["pendiente", "abonada", "completado"] as InvoiceStatus[]).map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                ...s.chip,
                ...(isMobile ? s.touchChip : null),
                ...(statusFilter === st
                  ? {
                      ...s.chipActive,
                      borderColor: STATUS_COLOR[st],
                      color: STATUS_COLOR[st],
                    }
                  : {}),
              }}
            >
              <span style={{ ...s.dot, background: STATUS_COLOR[st] }} />
              {STATUS_LABEL[st]} (
              {withTotals.filter(({ t }) => t.status === st).length})
            </button>
          ),
        )}
      </div>

      {error && <p style={s.errorBox}>{error}</p>}

      {loading ? (
        <p style={{ color: "#888" }}>Cargando…</p>
      ) : visible.length === 0 ? (
        <p style={{ color: "#666" }}>No hay facturas en esta vista.</p>
      ) : (
        <div style={s.list}>
          {visible.map(({ inv, t }) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              totals={t}
              supabase={supabase}
              expanded={expanded === inv.id}
              onToggle={() =>
                setExpanded((e) => (e === inv.id ? null : inv.id))
              }
              onEdit={() => setEditing(inv)}
              onDelete={() => removeInvoice(inv)}
              onSend={() => sendEmail(inv)}
              onPaymentLink={() => paymentLink(inv)}
              linking={linking === inv.id}
              onChanged={load}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {editing && (
        <InvoiceEditor
          supabase={supabase}
          clients={clients}
          team={team}
          invoice={editing === "new" ? null : editing}
          defaultClientId={editing === "new" ? prefilled : null}
          onClose={() => {
            setEditing(null);
            setPrefilled(null);
          }}
          onSaved={() => {
            setEditing(null);
            setPrefilled(null);
            load();
          }}
        />
      )}

      {linkModal && (
        <PaymentLinkModal
          {...linkModal}
          isMobile={isMobile}
          onClose={() => setLinkModal(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Tarjeta de factura ---------------- */

function InvoiceCard({
  invoice,
  totals,
  supabase,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onSend,
  onPaymentLink,
  linking,
  onChanged,
  isMobile,
}: {
  invoice: FullInvoice;
  totals: ReturnType<typeof computeTotals>;
  supabase: Supabase;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
  onPaymentLink: () => void;
  linking: boolean;
  onChanged: () => void;
  isMobile: boolean;
}) {
  const cur = invoice.currency;
  const color = STATUS_COLOR[totals.status];

  return (
    <div style={{ ...s.card, ...(isMobile ? { padding: 14 } : null) }}>
      <div
        style={{
          ...s.cardTop,
          ...(isMobile ? { flexDirection: "column", gap: 8 } : null),
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
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              #{invoice.number} · {invoice.party_name}
            </span>
            <span
              style={{
                ...s.badge,
                color: invoice.party_type === "client" ? "#5a8cff" : "#c77dff",
                borderColor:
                  (invoice.party_type === "client" ? "#5a8cff" : "#c77dff") +
                  "55",
                background:
                  (invoice.party_type === "client" ? "#5a8cff" : "#c77dff") +
                  "18",
              }}
            >
              {invoice.party_type === "client" ? "Cliente" : "Equipo"}
            </span>
            <span
              style={{
                ...s.badge,
                color,
                borderColor: color + "55",
                background: color + "18",
              }}
            >
              {STATUS_LABEL[totals.status]}
            </span>
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            {fmtDateTime(invoice.issued_at)}
            {invoice.description ? ` · ${invoice.description}` : ""}
          </div>
        </div>
        <div
          style={{
            textAlign: isMobile ? "left" : "right",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontSize: 19, fontWeight: 700 }}>
            {fmtMoney(totals.total, cur)}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            Abonado {fmtMoney(totals.paid, cur)}
          </div>
          {totals.balance > 0 && (
            <div style={{ fontSize: 13, color: "#e6b800", marginTop: 2 }}>
              Falta {fmtMoney(totals.balance, cur)}
            </div>
          )}
        </div>
      </div>

      {/* Progreso de cobro */}
      <div style={s.track}>
        <div
          style={{
            ...s.trackFill,
            width: `${totals.total > 0 ? Math.min(100, (totals.paid / totals.total) * 100) : 0}%`,
            background: color,
          }}
        />
      </div>

      <div style={s.actions}>
        <button
          onClick={onToggle}
          style={{ ...s.ghostBtn, ...(isMobile ? s.touchBtn : null) }}
        >
          {expanded
            ? "Ocultar abonos"
            : `Abonos (${invoice.invoice_payments.length})`}
        </button>
        {/* Un solo botón: el diálogo nativo ya permite ver, guardar como PDF
            e imprimir, sin abrir otra pestaña. */}
        <InvoicePrintButton
          token={invoice.public_token}
          style={{ ...s.viewBtn, ...(isMobile ? s.touchBtn : null) }}
        />
        <button
          onClick={onSend}
          style={{ ...s.sendBtn, ...(isMobile ? s.touchBtn : null) }}
        >
          Enviar por correo
        </button>
        {/* Solo a clientes: a un colaborador se le paga, no se le cobra. Y sin
            saldo no hay nada que cobrar. */}
        {invoice.party_type === "client" && totals.balance > 0 && (
          <button
            onClick={onPaymentLink}
            disabled={linking}
            style={{
              ...s.sendBtn,
              ...(isMobile ? s.touchBtn : null),
              ...(linking ? { opacity: 0.6, cursor: "wait" } : null),
            }}
          >
            {linking
              ? "Generando…"
              : invoice.gestiono_share_url
                ? "Copiar link de pago"
                : "Generar link de pago"}
          </button>
        )}
        <button
          onClick={onEdit}
          style={{ ...s.ghostBtn, ...(isMobile ? s.touchBtn : null) }}
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          style={{
            ...s.dangerBtn,
            ...(isMobile ? { ...s.touchBtn, marginLeft: 0 } : null),
          }}
        >
          Eliminar
        </button>
      </div>

      {expanded && (
        <Payments
          invoice={invoice}
          balance={totals.balance}
          supabase={supabase}
          onChanged={onChanged}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

/* ---------------- Abonos ---------------- */

function Payments({
  invoice,
  balance,
  supabase,
  onChanged,
  isMobile,
}: {
  invoice: FullInvoice;
  balance: number;
  supabase: Supabase;
  onChanged: () => void;
  isMobile: boolean;
}) {
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() =>
    toLocalInput(new Date().toISOString()),
  );
  const [saving, setSaving] = useState(false);

  async function addPayment() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return alert("Escribe un monto mayor que cero.");
    }
    const warning = paymentWarning(value, balance);
    if (warning && !confirm(warning)) return;

    setSaving(true);
    const { error } = await supabase.from("invoice_payments").insert({
      invoice_id: invoice.id,
      method,
      amount: value,
      paid_at: new Date(paidAt).toISOString(),
    });
    setSaving(false);
    if (error) return alert("Error al registrar el abono: " + error.message);
    setAmount("");
    onChanged();
  }

  async function removePayment(p: InvoicePayment) {
    if (!confirm("¿Eliminar este abono?")) return;
    const { error } = await supabase
      .from("invoice_payments")
      .delete()
      .eq("id", p.id);
    if (error) return alert("Error al eliminar: " + error.message);
    onChanged();
  }

  return (
    <div style={s.detail}>
      {invoice.invoice_payments.length === 0 ? (
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 14px" }}>
          Todavía no hay abonos registrados.
        </p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {invoice.invoice_payments.map((p) => (
            <div
              key={p.id}
              style={{
                ...s.payRow,
                ...(isMobile
                  ? { gridTemplateColumns: "1fr auto 28px", rowGap: 2 }
                  : null),
              }}
            >
              <span style={{ color: "#ddd" }}>{p.method}</span>
              <span style={{ color: "#888" }}>{fmtDateTime(p.paid_at)}</span>
              <span style={{ color: "#00e5a0", fontWeight: 600 }}>
                {fmtMoney(Number(p.amount), invoice.currency)}
              </span>
              <button onClick={() => removePayment(p)} style={s.miniDanger}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={s.payForm}>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            ...s.select,
            ...(isMobile ? { ...s.touchInput, width: "100%" } : null),
          }}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          style={{ ...s.input, ...(isMobile ? s.touchInput : null) }}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder={`Monto (falta ${balance})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ ...s.input, ...(isMobile ? s.touchInput : null) }}
        />
        <button
          onClick={addPayment}
          disabled={saving}
          style={{
            ...s.primaryBtnSm,
            ...(isMobile ? { ...s.touchBtn, width: "100%" } : null),
          }}
        >
          {saving ? "Guardando…" : "Registrar abono"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Editor de factura ---------------- */

function InvoiceEditor({
  supabase,
  clients,
  team,
  invoice,
  defaultClientId,
  onClose,
  onSaved,
}: {
  supabase: Supabase;
  clients: Client[];
  team: TeamMember[];
  invoice: FullInvoice | null;
  defaultClientId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [partyType, setPartyType] = useState<InvoiceParty>(
    invoice?.party_type ?? "client",
  );
  const [partyId, setPartyId] = useState<string>(
    invoice?.client_id ?? invoice?.team_member_id ?? defaultClientId ?? "",
  );
  const [currency, setCurrency] = useState<InvoiceCurrency>(
    invoice?.currency ?? "DOP",
  );
  const [issuedAt, setIssuedAt] = useState(
    toLocalInput(invoice?.issued_at ?? new Date().toISOString()),
  );
  const [discount, setDiscount] = useState(String(invoice?.discount ?? 0));
  const [withTax, setWithTax] = useState(Number(invoice?.tax_rate ?? 0) > 0);
  const [description, setDescription] = useState(invoice?.description ?? "");
  const [note, setNote] = useState(invoice?.note ?? "");
  const [items, setItems] = useState<DraftItem[]>(
    invoice?.invoice_items.length
      ? invoice.invoice_items.map((i) => ({
          concept: i.concept,
          unit_price: Number(i.unit_price),
          quantity: Number(i.quantity),
          unit: i.unit,
        }))
      : [emptyItem()],
  );
  // Abono inicial: el caso que motivó todo esto ("la factura es de 3000 pero el
  // cliente pagó 500 de entrada"). Solo al crear; después se usa el panel de
  // abonos, que ya lleva su propio historial.
  const [initialAmount, setInitialAmount] = useState("");
  const [initialMethod, setInitialMethod] = useState(PAYMENT_METHODS[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const inp = isMobile ? { ...s.input, ...s.touchInput } : s.input;
  const gbtn = isMobile ? { ...s.ghostBtn, ...s.touchBtn } : s.ghostBtn;

  // Los clientes archivados no se ofrecen, pero el de una factura ya emitida sí
  // sigue en la lista: si no, editarla vaciaría el destinatario.
  const options =
    partyType === "client"
      ? clients.filter((c) => c.active !== false || c.id === invoice?.client_id)
      : team;

  const preview = computeTotals(
    { discount: Number(discount) || 0, tax_rate: withTax ? ITBIS : 0 },
    items,
    [],
  );

  function setItem(idx: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  }

  async function save() {
    setErr(null);
    const party = options.find((o) => o.id === partyId);
    if (!party) {
      return setErr(
        partyType === "client" ? "Elige un cliente." : "Elige un colaborador.",
      );
    }
    const clean = items.filter((i) => i.concept.trim());
    if (clean.length === 0) return setErr("Agrega al menos un concepto.");

    setSaving(true);

    // Al cliente se le congela la ficha fiscal completa; al colaborador solo
    // nombre y correo, porque a un miembro del equipo no se le factura con RNC.
    const partySnapshot =
      partyType === "client"
        ? clientBillingSnapshot(party as Client)
        : {
            party_name: party.name,
            party_email: party.email ?? null,
            party_company: null,
            party_tax_id: null,
            party_phone: null,
            party_address: null,
          };

    const base = {
      party_type: partyType,
      client_id: partyType === "client" ? party.id : null,
      team_member_id: partyType === "team" ? party.id : null,
      ...partySnapshot,
      issued_at: new Date(issuedAt).toISOString(),
      currency,
      discount: Number(discount) || 0,
      tax_rate: withTax ? ITBIS : 0,
      description: description.trim() || null,
      note: note.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let invoiceId = invoice?.id;

    if (invoice) {
      const { error } = await supabase
        .from("invoices")
        .update(base)
        .eq("id", invoice.id);
      if (error) {
        setSaving(false);
        return setErr(error.message);
      }
      // Los ítems se reemplazan completos: son pocos y el diff fila a fila
      // añadiría complejidad sin ganar nada. Los abonos NO se tocan.
      await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoice.id);
    } else {
      // `number` y `public_token` los pone la base de datos.
      const { data, error } = await supabase
        .from("invoices")
        .insert(base)
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        return setErr(error?.message ?? "No se pudo crear la factura.");
      }
      invoiceId = data.id;
    }

    const { error: itemsError } = await supabase.from("invoice_items").insert(
      clean.map((it, idx) => ({
        invoice_id: invoiceId,
        concept: it.concept.trim(),
        unit_price: Number(it.unit_price) || 0,
        quantity: Number(it.quantity) || 0,
        unit: it.unit.trim() || "UNIT",
        sort_order: idx,
      })),
    );
    if (itemsError) {
      setSaving(false);
      return setErr(itemsError.message);
    }

    const initial = Number(initialAmount);
    if (!invoice && Number.isFinite(initial) && initial > 0) {
      const { error: payError } = await supabase
        .from("invoice_payments")
        .insert({
          invoice_id: invoiceId,
          method: initialMethod,
          amount: initial,
        });
      if (payError) {
        setSaving(false);
        return setErr(
          "Factura creada, pero el abono inicial falló: " + payError.message,
        );
      }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div
        style={{
          ...s.drawer,
          // En teléfono el panel ocupa toda la pantalla: el cuerpo lleva su
          // propio scroll y la cabecera con la ✕ nunca se pierde de vista.
          ...(isMobile
            ? { width: "100%", borderLeft: "none", height: "100dvh" }
            : null),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.drawerHeader}>
          <h2 style={{ margin: 0, fontSize: 20 }}>
            {invoice ? `Editar factura #${invoice.number}` : "Nueva factura"}
          </h2>
          <button onClick={onClose} style={s.closeBtn}>
            ✕
          </button>
        </div>

        <div
          style={{ ...s.drawerBody, ...(isMobile ? { padding: 16 } : null) }}
        >
          {err && <p style={s.errorBox}>{err}</p>}

          {/* Destinatario */}
          <div style={s.field}>
            <span style={s.label}>Facturar a</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["client", "team"] as InvoiceParty[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPartyType(p);
                    setPartyId("");
                  }}
                  style={{
                    ...s.toggle,
                    ...(isMobile ? s.touchBtn : null),
                    background: partyType === p ? "#fff" : "#1a1a1a",
                    color: partyType === p ? "#000" : "#999",
                  }}
                >
                  {p === "client" ? "Cliente" : "Miembro del equipo"}
                </button>
              ))}
            </div>
          </div>

          <label style={s.field}>
            <span style={s.label}>
              {partyType === "client" ? "Cliente" : "Colaborador"}
            </span>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              style={inp}
            >
              <option value="">Selecciona…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {o.email ? ` · ${o.email}` : " · sin correo"}
                </option>
              ))}
            </select>
          </label>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <label style={{ ...s.field, flex: 1 }}>
              <span style={s.label}>Fecha de emisión</span>
              <input
                type="datetime-local"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                style={inp}
              />
            </label>
            <label style={{ ...s.field, width: isMobile ? "100%" : 140 }}>
              <span style={s.label}>Moneda</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as InvoiceCurrency)}
                style={inp}
              >
                <option value="DOP">RD$ (DOP)</option>
                <option value="USD">US$ (USD)</option>
              </select>
            </label>
          </div>

          {/* Conceptos */}
          <div style={s.field}>
            <span style={s.label}>Conceptos</span>
            {items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  ...s.itemRow,
                  ...(isMobile ? { flexWrap: "wrap" } : null),
                }}
              >
                <input
                  placeholder="Concepto"
                  value={it.concept}
                  onChange={(e) => setItem(idx, { concept: e.target.value })}
                  style={{ ...inp, flex: isMobile ? "1 1 100%" : 2 }}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  value={it.unit_price}
                  onChange={(e) =>
                    setItem(idx, { unit_price: Number(e.target.value) })
                  }
                  style={{
                    ...inp,
                    width: isMobile ? 100 : 110,
                    flex: isMobile ? "1 1 30%" : undefined,
                  }}
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Cant."
                  value={it.quantity}
                  onChange={(e) =>
                    setItem(idx, { quantity: Number(e.target.value) })
                  }
                  style={{
                    ...inp,
                    width: 80,
                    flex: isMobile ? "1 1 25%" : undefined,
                  }}
                />
                <input
                  placeholder="UNIT"
                  value={it.unit}
                  onChange={(e) => setItem(idx, { unit: e.target.value })}
                  style={{
                    ...inp,
                    width: 80,
                    flex: isMobile ? "1 1 25%" : undefined,
                  }}
                />
                <span
                  style={{
                    ...s.itemTotal,
                    ...(isMobile
                      ? { minWidth: 0, flex: 1, textAlign: "left" }
                      : null),
                  }}
                >
                  {fmtMoney(itemTotal(it), currency)}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setItems((p) => p.filter((_, i) => i !== idx))
                    }
                    style={s.miniDanger}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((p) => [...p, emptyItem()])}
              style={{ ...gbtn, alignSelf: "flex-start", marginTop: 8 }}
            >
              + Agregar concepto
            </button>
          </div>

          {/* Descuento e impuesto */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: isMobile ? "stretch" : "flex-end",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <label style={{ ...s.field, flex: 1 }}>
              <span style={s.label}>Descuento</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                style={inp}
              />
            </label>
            <button
              type="button"
              onClick={() => setWithTax((v) => !v)}
              style={{
                ...s.toggle,
                ...(isMobile ? s.touchBtn : null),
                marginBottom: 1,
                background: withTax ? "#fff" : "#1a1a1a",
                color: withTax ? "#000" : "#999",
              }}
            >
              ITBIS {ITBIS}% {withTax ? "activo" : "desactivado"}
            </button>
          </div>

          {/* Vista previa de totales */}
          <div style={s.previewBox}>
            <Row
              label="Subtotal"
              value={fmtMoney(preview.subtotal, currency)}
            />
            <Row
              label="Descuento"
              value={`− ${fmtMoney(preview.discount, currency)}`}
            />
            {withTax && (
              <Row
                label={`ITBIS ${ITBIS}%`}
                value={fmtMoney(preview.tax, currency)}
              />
            )}
            <Row
              label="Total"
              value={fmtMoney(preview.total, currency)}
              strong
            />
          </div>

          {/* Abono inicial (solo al crear) */}
          {!invoice && (
            <div style={s.field}>
              <span style={s.label}>Abono inicial (opcional)</span>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <select
                  value={initialMethod}
                  onChange={(e) => setInitialMethod(e.target.value)}
                  style={{ ...inp, width: isMobile ? "100%" : 150 }}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  style={inp}
                />
              </div>
              <span style={s.help}>
                Ej.: la factura es de 3,000 y el cliente adelanta 500. Después
                puedes registrar más abonos desde la tarjeta.
              </span>
            </div>
          )}

          <label style={s.field}>
            <span style={s.label}>Descripción de la factura</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inp, minHeight: 70, resize: "vertical" }}
            />
          </label>

          <label style={s.field}>
            <span style={s.label}>Nota</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ ...inp, minHeight: 50, resize: "vertical" }}
            />
          </label>
        </div>

        <div style={s.drawerFooter}>
          <button onClick={onClose} style={gbtn}>
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              ...s.primaryBtn,
              ...(isMobile ? { ...s.touchBtn, marginLeft: 0 } : null),
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving
              ? "Guardando…"
              : invoice
                ? "Guardar cambios"
                : "Crear factura"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: strong ? 16 : 13,
        fontWeight: strong ? 700 : 400,
        color: strong ? "#fff" : "#aaa",
        marginTop: strong ? 8 : 4,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ---------------- Estilos ---------------- */

/* ---------------- Modal del link de pago ---------------- */

function PaymentLinkModal({
  url,
  amount,
  currency,
  reused,
  isMobile,
  onClose,
}: {
  url: string;
  amount: number;
  currency: string;
  reused: boolean;
  isMobile: boolean;
  onClose: () => void;
}) {
  // "copiado" se apaga solo: un check permanente no distingue entre "acabo de
  // copiar" y "copié hace un minuto", que es justo la duda del que va a pegar.
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // Cerrar con Escape: el modal tapa la lista y quedarse sin salida de teclado
  // obliga a apuntar con el mouse a la ✕.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Sin permiso de portapapeles (o sin HTTPS) queda el input para copiar a
      // mano, así que no hay nada que avisar.
    }
  }

  return (
    <div style={s.centerOverlay} onClick={onClose}>
      <div
        style={{
          ...s.modal,
          ...(isMobile ? { width: "100%", padding: 20 } : null),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.modalHeader}>
          <strong style={{ fontSize: 15 }}>
            {reused ? "Link de pago existente" : "Link de pago generado"}
          </strong>
          <button onClick={onClose} style={s.closeBtn} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <p style={s.modalAmount}>{fmtMoney(amount, currency)}</p>
        <p style={s.help}>
          El cliente paga con tarjeta en esta página. Cobra el monto de arriba,
          aunque después cambie el saldo de la factura.
        </p>

        <div style={s.linkRow}>
          {/* readOnly y no disabled: así se puede seleccionar y copiar a mano
              si el portapapeles del navegador está bloqueado. */}
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            style={{ ...s.input, ...(isMobile ? s.touchInput : null), flex: 1 }}
          />
          <button
            onClick={copy}
            style={{
              ...s.primaryBtnSm,
              ...(isMobile ? s.touchBtn : null),
              ...(copied ? { background: "#00e5a0", color: "#062" } : null),
            }}
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>

        <div style={s.modalFooter}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...s.ghostBtn, textDecoration: "none" }}
          >
            Abrir
          </a>
          <button
            onClick={onClose}
            style={{ ...s.ghostBtn, ...(isMobile ? s.touchBtn : null) }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  summaryRow: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  summaryCard: {
    background: "#121212",
    border: "1px solid #232323",
    borderRadius: 12,
    padding: "14px 20px",
    minWidth: 200,
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#777",
  },
  summaryValue: { fontSize: 20, fontWeight: 700, marginTop: 2 },
  filters: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
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
  chipActive: { background: "#1e1e1e", color: "#fff", borderColor: "#3a3a3a" },
  // Variantes táctiles para teléfono: 16px evita el zoom de iOS al enfocar un
  // campo, y 40px de alto es el mínimo cómodo para el dedo.
  touchInput: { fontSize: 16, minHeight: 40 },
  touchBtn: { minHeight: 40, fontSize: 14 },
  touchChip: { minHeight: 40, padding: "9px 14px" },
  dot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
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
    gap: 16,
  },
  badge: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 999,
    border: "1px solid",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  track: {
    height: 4,
    background: "#1e1e1e",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 14,
  },
  trackFill: { height: "100%", transition: "width .25s" },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #232323",
    alignItems: "center",
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
    marginLeft: "auto",
  },
  primaryBtnSm: {
    padding: "8px 16px",
    background: "#fff",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    color: "#ccc",
    borderRadius: 7,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  viewBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    color: "#ccc",
    borderRadius: 7,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  sendBtn: {
    background: "#00e5a0",
    color: "#000",
    border: "none",
    borderRadius: 7,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  dangerBtn: {
    background: "transparent",
    border: "1px solid #5a2a2a",
    color: "#ff9090",
    borderRadius: 7,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
    marginLeft: "auto",
  },
  miniDanger: {
    background: "transparent",
    border: "1px solid #4a2020",
    color: "#ff8080",
    borderRadius: 6,
    width: 28,
    height: 28,
    fontSize: 12,
    cursor: "pointer",
    flexShrink: 0,
  },
  detail: { marginTop: 16, paddingTop: 16, borderTop: "1px solid #232323" },
  payRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr auto 28px",
    gap: 10,
    alignItems: "center",
    fontSize: 13,
    padding: "6px 0",
  },
  payForm: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  itemRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  itemTotal: {
    fontSize: 12,
    color: "#888",
    minWidth: 100,
    textAlign: "right",
  },
  previewBox: {
    background: "#0e0e0e",
    border: "1px solid #232323",
    borderRadius: 10,
    padding: 14,
  },
  errorBox: {
    background: "#2a1515",
    border: "1px solid #5a2a2a",
    color: "#ff9090",
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
  // El editor entra como panel lateral; el link de pago es un aviso puntual, así
  // que va centrado. zIndex mayor para que pueda abrirse sobre el editor.
  centerOverlay: {
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
    width: "min(560px, 100%)",
    background: "#0e0e0e",
    border: "1px solid #1e1e1e",
    borderRadius: 14,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalAmount: { fontSize: 26, fontWeight: 700, margin: 0 },
  linkRow: { display: "flex", gap: 8, alignItems: "center" },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  drawer: {
    width: "min(680px, 100%)",
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
  field: { display: "flex", flexDirection: "column", gap: 7 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#888",
  },
  input: {
    padding: "10px 12px",
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    padding: "10px 12px",
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
  },
  toggle: {
    padding: "9px 18px",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  help: { fontSize: 12, color: "#666" },
};
