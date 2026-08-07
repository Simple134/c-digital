import type { Invoice, InvoiceItem, InvoicePayment } from "./supabase/types";

/**
 * Cálculo de totales y estado de una factura.
 *
 * Nada de esto se guarda en la base de datos. El saldo y el estado se derivan
 * siempre de los ítems y los abonos, porque son la única fuente de verdad: una
 * columna `paid_amount` se desincroniza en cuanto alguien edita un abono, y una
 * columna `status` permite el absurdo de una factura "Completada" con saldo
 * pendiente.
 */

export type InvoiceStatus = "pendiente" | "abonada" | "completado";

export const CURRENCY_SYMBOL: Record<string, string> = {
  DOP: "$RD",
  USD: "$US",
};

/** "$RD 20,000.00" — mismo formato que la factura impresa. */
export function fmtMoney(amount: number, currency = "DOP"): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? "$";
  const n = Number.isFinite(amount) ? amount : 0;
  return `${symbol} ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Redondeo a centavos: evita que 0.1 + 0.2 deje un saldo de 3e-17 pendiente. */
const cents = (n: number) => Math.round(n * 100) / 100;

export function itemTotal(item: Pick<InvoiceItem, "unit_price" | "quantity">) {
  return cents(Number(item.unit_price ?? 0) * Number(item.quantity ?? 0));
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
}

export function computeTotals(
  invoice: Pick<Invoice, "discount" | "tax_rate">,
  items: Pick<InvoiceItem, "unit_price" | "quantity">[],
  payments: Pick<InvoicePayment, "amount">[],
): InvoiceTotals {
  const subtotal = cents(items.reduce((sum, it) => sum + itemTotal(it), 0));
  const discount = cents(Math.min(Number(invoice.discount ?? 0), subtotal));
  const taxable = cents(subtotal - discount);
  const tax = cents((taxable * Number(invoice.tax_rate ?? 0)) / 100);
  const total = cents(taxable + tax);
  const paid = cents(
    payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
  );
  const balance = cents(total - paid);

  // El estado se ordena de mayor a menor certeza: si no queda saldo está
  // completada aunque el abono haya venido en una sola cuota.
  const status: InvoiceStatus =
    balance <= 0 ? "completado" : paid > 0 ? "abonada" : "pendiente";

  return { subtotal, discount, tax, total, paid, balance, status };
}

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pendiente: "Pendiente",
  abonada: "Abonada",
  completado: "Completado",
};

export const STATUS_COLOR: Record<InvoiceStatus, string> = {
  pendiente: "#ff8080",
  abonada: "#e6b800",
  completado: "#00e5a0",
};

/**
 * Política de sobrepago: qué hacer cuando un abono excede el saldo.
 *
 * Devuelve `null` si el abono se acepta sin más, o el texto de advertencia que
 * el dashboard mostrará antes de guardarlo.
 *
 * TODO(josue): define la política del negocio. Ahora mismo solo advierte y deja
 * pasar (útil para propinas, ajustes de cambio o un anticipo del próximo
 * trabajo). Las otras dos opciones razonables son bloquear el abono, o
 * aceptarlo y dejar el saldo en negativo como crédito a favor.
 */
export function paymentWarning(amount: number, balance: number): string | null {
  if (amount <= balance) return null;
  return `El abono (${amount}) supera el saldo pendiente (${balance}). ¿Registrarlo de todas formas?`;
}

/** Métodos de pago sugeridos; el campo admite texto libre. */
export const PAYMENT_METHODS = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "Cheque",
  "PayPal",
  "Otro",
];
