import { fmtDateTime } from "@/lib/format";
import {
  computeTotals,
  fmtMoney,
  itemTotal,
  STATUS_LABEL,
} from "@/lib/invoices";
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
} from "@/lib/supabase/types";

/**
 * La factura tal como se imprime y se envía.
 *
 * Es un Server Component sin estado: la misma marca sirve para la página
 * pública, para la vista previa del dashboard y —serializada— para el correo.
 * Todo va en estilos inline porque el destino final es un PDF impreso y un
 * cliente de correo: ninguno de los dos carga hojas de estilo externas.
 */
export default function InvoiceDoc({
  invoice,
  items,
  payments,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
  payments: InvoicePayment[];
}) {
  const t = computeTotals(invoice, items, payments);
  const cur = invoice.currency;
  const note = invoice.note?.trim();

  return (
    <article className="invoice-sheet" style={S.sheet}>
      {/* Encabezado: destinatario a la izquierda, fecha y estado a la derecha */}
      <header className="invoice-top" style={S.top}>
        <div className="invoice-party" style={S.partyBlock}>
          <div style={S.muted}>
            {invoice.party_type === "client" ? "Cliente:" : "Colaborador:"}
          </div>
          <div style={S.partyName}>{invoice.party_name}</div>
          {/* Datos fiscales congelados al emitir. Cada línea se omite si falta,
              para que una factura vieja (sin snapshot) no imprima huecos. */}
          {invoice.party_tax_id && (
            <div style={S.partyLine}>RNC/Cédula: {invoice.party_tax_id}</div>
          )}
          {invoice.party_address && (
            <div style={S.partyLine}>{invoice.party_address}</div>
          )}
          {(invoice.party_phone || invoice.party_email) && (
            <div style={S.partyLine}>
              {[invoice.party_phone, invoice.party_email]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
          <div style={S.rule} />
        </div>
        <div
          className="invoice-status"
          style={{ ...S.statusBlock, textAlign: "right" }}
        >
          <div style={S.dateLine}>Fecha: {fmtDateTime(invoice.issued_at)}</div>
          <div style={{ ...S.muted, marginTop: 14 }}>Estado de la Factura</div>
          <div className="invoice-status-line" style={S.statusLine}>
            {STATUS_LABEL[t.status]} {fmtMoney(Math.max(t.balance, 0), cur)}
          </div>
        </div>
      </header>

      <h1 style={S.invoiceNo}>Factura #{invoice.number}</h1>

      {/* Ítems */}
      <div className="invoice-items-head" style={S.itemsHead}>
        <span>Precio</span>
        <span>Cantidad</span>
        <span>Total</span>
      </div>
      {items.map((it) => (
        <div key={it.id} style={{ marginTop: 18 }}>
          <div style={S.concept}>{it.concept}</div>
          <div className="invoice-items-row" style={S.itemsRow}>
            <span data-label="Precio">{fmtMoney(Number(it.unit_price), cur)}</span>
            <span data-label="Cantidad">
              {Number(it.quantity)} {it.unit}
            </span>
            <span data-label="Total">{fmtMoney(itemTotal(it), cur)}</span>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div style={{ ...S.muted, marginTop: 18 }}>Sin conceptos.</div>
      )}

      {/* Totales */}
      <div className="invoice-totals" style={S.totals}>
        <div style={S.discount}>Descuento: {fmtMoney(t.discount, cur)}</div>
        {t.tax > 0 && (
          <div style={S.discount}>
            ITBIS ({Number(invoice.tax_rate)}%): {fmtMoney(t.tax, cur)}
          </div>
        )}
        <div className="invoice-total" style={S.total}>
          Total: {fmtMoney(t.total, cur)}
        </div>
      </div>

      {/* Abonos */}
      {payments.length > 0 && (
        <section style={{ ...S.compactSection, marginTop: 12 }}>
          <div className="invoice-pay-head" style={S.payHead}>
            <span>Método de pago</span>
            <span>Fecha</span>
            <span style={{ textAlign: "right" }}>Cantidad</span>
          </div>
          {payments.map((p) => (
            <div key={p.id} className="invoice-pay-row" style={S.payRow}>
              <span data-label="Método">{p.method}</span>
              <span data-label="Fecha">{fmtDateTime(p.paid_at)}</span>
              <span data-label="Cantidad" style={{ textAlign: "right" }}>
                {fmtMoney(Number(p.amount), cur)}
              </span>
            </div>
          ))}
          {t.balance > 0 && (
            <div className="invoice-balance" style={S.balance}>
              Saldo pendiente: {fmtMoney(t.balance, cur)}
            </div>
          )}
        </section>
      )}

      {invoice.description && (
        <section style={{ ...S.compactSection, marginTop: 12 }}>
          <h2 style={S.h2}>Descripción de Factura</h2>
          <p style={S.body}>{invoice.description}</p>
        </section>
      )}

      {note && (
        <div style={{ marginTop: 18, fontSize: 13, fontWeight: 700 }}>
          Nota: <span style={{ fontWeight: 400, color: "#ccc" }}>{note}</span>
        </div>
      )}

      <footer className="invoice-footer" style={S.footer}>
        <div className="invoice-logo" style={S.logo}>
          C Digital<span style={{ color: "#00e5a0" }}>.</span>
        </div>
      </footer>
    </article>
  );
}

const S: Record<string, React.CSSProperties> = {
  sheet: {
    background: "#0a0a0a",
    color: "#fff",
    padding: "48px 56px 42px",
    maxWidth: 820,
    width: "100%",
    margin: "0 auto",
    fontFamily: "Helvetica, Arial, sans-serif",
    // El PDF del ejemplo es una hoja completa en negro; sin esto la impresión
    // deja franjas blancas arriba y abajo.
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  top: {
    position: "static",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    flexWrap: "wrap",
    width: "auto",
    padding: 0,
    zIndex: "auto",
  },
  partyBlock: { minWidth: 240, flex: "1 1 260px" },
  statusBlock: { minWidth: 240, flex: "1 1 260px" },
  muted: { fontSize: 13, color: "#bbb" },
  partyName: { fontSize: 26, fontWeight: 400, marginTop: 4 },
  partyLine: { fontSize: 13, color: "#bbb", marginTop: 3 },
  rule: {
    width: 110,
    borderBottom: "2px solid #fff",
    marginTop: 10,
  },
  dateLine: { fontSize: 15, fontWeight: 700 },
  statusLine: { fontSize: 26, marginTop: 2 },
  invoiceNo: {
    fontSize: 30,
    fontWeight: 700,
    margin: "38px 0 30px",
    textTransform: "none",
    letterSpacing: 0,
    lineHeight: 1.15,
  },
  itemsHead: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
  },
  concept: { fontStyle: "italic", fontSize: 14, color: "#ddd" },
  itemsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
    fontSize: 14,
    marginTop: 10,
    color: "#eee",
  },
  totals: { marginTop: 38, textAlign: "right" },
  discount: { fontSize: 13, fontWeight: 700, marginBottom: 2 },
  total: { fontSize: 28 },
  payHead: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr 1fr",
    fontSize: 13,
    fontWeight: 700,
  },
  payRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr 1fr",
    gap: 16,
    fontSize: 14,
    color: "#ddd",
    marginTop: 9,
  },
  balance: {
    marginTop: 12,
    textAlign: "right",
    fontSize: 15,
    fontWeight: 700,
    color: "#e6b800",
  },
  compactSection: { paddingTop: 0, paddingBottom: 0, position: "static" },
  h2: {
    fontSize: 24,
    fontWeight: 400,
    margin: "0 0 6px",
    textTransform: "none",
    letterSpacing: 0,
    lineHeight: 1.2,
  },
  body: { fontSize: 13, color: "#ccc", margin: 0 },
  footer: { marginTop: 20 },
  logo: { fontSize: 54, fontWeight: 300, letterSpacing: -1 },
};
