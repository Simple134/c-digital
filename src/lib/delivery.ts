// Medición de puntualidad de entrega del Kanban.
//
// Dos campos sostienen todo esto:
//   `due_date`     — fecha límite, tipo `date` (solo día, sin hora).
//   `completed_at` — instante en que la tarjeta entró a una columna terminal.
//                    Se sella una sola vez y se limpia si la tarjeta sale de ahí.
//
// Comparar ambos exige cuidado: uno es un día y el otro un instante. Todo el
// módulo trabaja con días calendario en la zona del negocio para que "entregué
// el mismo día a las 9 de la noche" cuente como a tiempo.

const TIME_ZONE = "America/Santo_Domingo";

/** Día calendario en la zona del negocio, como "2026-08-15" (comparable como texto). */
export function dayInBusinessTz(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  // en-CA produce directamente el formato ISO de solo fecha.
  return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

/** Hoy en la zona del negocio, como "2026-08-15". */
export function today(): string {
  return dayInBusinessTz(new Date());
}

/**
 * Formatea un `date` de Postgres ("2026-08-15") como "15 ago 2026".
 *
 * No usa `new Date(iso)` a propósito: ese constructor interpreta un
 * "YYYY-MM-DD" como medianoche UTC, y al renderizarlo en UTC−4 mostraría el día
 * anterior. Un `date` no tiene zona horaria, así que se formatea tal cual viene.
 */
export function fmtDueDate(value: string | null | undefined): string {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  // El mediodía evita cualquier corrimiento por zona en el formateo.
  return new Date(y, m - 1, d, 12).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Días entre dos días calendario ("2026-08-15"). Negativo = el primero ya pasó. */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86_400_000);
}

/**
 * ¿Se entregó a tiempo? El plazo vence al final del día límite: entregar el
 * mismo día, a cualquier hora, cuenta como cumplido.
 */
export function deliveredOnTime(
  dueDate: string | null | undefined,
  completedAt: string | null | undefined,
): boolean | null {
  // Sin fecha límite no hay nada que medir (null ≠ false: la tarjeta se excluye
  // del porcentaje en lugar de contar como atrasada).
  if (!dueDate || !completedAt) return null;
  return dayInBusinessTz(completedAt) <= dueDate;
}

export type DueState =
  | "sin-fecha"
  | "entregada-a-tiempo"
  | "entregada-tarde"
  | "atrasada"
  | "vence-hoy"
  | "vence-pronto"
  | "en-plazo";

/** Estado de plazo de una tarjeta, para el badge de la tarjeta. */
export function dueState(
  dueDate: string | null | undefined,
  completedAt: string | null | undefined,
): DueState {
  if (completedAt) {
    if (!dueDate) return "sin-fecha";
    return deliveredOnTime(dueDate, completedAt)
      ? "entregada-a-tiempo"
      : "entregada-tarde";
  }
  if (!dueDate) return "sin-fecha";
  const remaining = daysBetween(today(), dueDate);
  if (remaining < 0) return "atrasada";
  if (remaining === 0) return "vence-hoy";
  if (remaining <= 2) return "vence-pronto";
  return "en-plazo";
}

/** Etiqueta y color del badge de plazo. `null` = no se muestra badge. */
export function dueBadge(
  state: DueState,
  dueDate: string | null | undefined,
): { label: string; color: string } | null {
  const fecha = fmtDueDate(dueDate);
  switch (state) {
    case "entregada-a-tiempo":
      return { label: `✓ A tiempo · ${fecha}`, color: "#4ade80" };
    case "entregada-tarde":
      return { label: `⚠ Tarde · vencía ${fecha}`, color: "#ff8080" };
    case "atrasada": {
      const dias = -daysBetween(today(), dueDate!);
      return {
        label: `⏰ Atrasada ${dias} ${dias === 1 ? "día" : "días"}`,
        color: "#ff8080",
      };
    }
    case "vence-hoy":
      return { label: "⏰ Vence hoy", color: "#e6b800" };
    case "vence-pronto":
      return { label: `Vence ${fecha}`, color: "#e6b800" };
    case "en-plazo":
      return { label: `Vence ${fecha}`, color: "#7a7a7a" };
    default:
      return null;
  }
}

/** Lo mínimo que necesita el cálculo de métricas de una tarjeta. */
export type DeliverableCard = {
  assignee_id: string | null;
  assigned_to_client: boolean;
  due_date: string | null;
  completed_at: string | null;
};

export type MemberDeliveryStats = {
  memberId: string;
  /** Entregadas en el rango, con o sin fecha límite. */
  delivered: number;
  /** Entregadas en el rango que sí tenían fecha límite (base del porcentaje). */
  measurable: number;
  onTime: number;
  late: number;
  /** Abiertas cuya fecha límite ya pasó. No entran al %, pero avisan. */
  openOverdue: number;
  /** 0–100, o null si no hay ninguna tarjeta medible. */
  onTimeRate: number | null;
};

/**
 * Rendimiento de entrega por responsable en los últimos `days` días.
 *
 * Reglas:
 *  - Solo cuentan tarjetas con `assignee_id` (el reporte mide al equipo).
 *  - Se excluyen las marcadas `assigned_to_client`: ahí la pelota está del lado
 *    del cliente, y un retraso suyo no es rendimiento nuestro.
 *  - El porcentaje se calcula solo sobre entregas con fecha límite. `measurable`
 *    se expone para poder mostrar sobre cuántas tarjetas se basa el número.
 *  - El rango filtra por fecha de *entrega*, no de creación: "% del último mes"
 *    significa "de lo que entregó este mes".
 */
export function computeDeliveryStats(
  cards: DeliverableCard[],
  days: number,
): Map<string, MemberDeliveryStats> {
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  const hoy = today();
  const stats = new Map<string, MemberDeliveryStats>();

  const bucket = (memberId: string) => {
    let entry = stats.get(memberId);
    if (!entry) {
      entry = {
        memberId,
        delivered: 0,
        measurable: 0,
        onTime: 0,
        late: 0,
        openOverdue: 0,
        onTimeRate: null,
      };
      stats.set(memberId, entry);
    }
    return entry;
  };

  for (const card of cards) {
    if (!card.assignee_id || card.assigned_to_client) continue;

    if (card.completed_at) {
      if (card.completed_at < cutoff) continue;
      const entry = bucket(card.assignee_id);
      entry.delivered += 1;
      const onTime = deliveredOnTime(card.due_date, card.completed_at);
      if (onTime === null) continue; // sin fecha límite: fuera del porcentaje
      entry.measurable += 1;
      if (onTime) entry.onTime += 1;
      else entry.late += 1;
    } else if (card.due_date && card.due_date < hoy) {
      bucket(card.assignee_id).openOverdue += 1;
    }
  }

  for (const entry of stats.values()) {
    entry.onTimeRate =
      entry.measurable > 0
        ? Math.round((entry.onTime / entry.measurable) * 100)
        : null;
  }
  return stats;
}
