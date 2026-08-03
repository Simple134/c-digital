// Zona horaria del negocio. Se fija explícitamente porque estas fechas se
// formatean tanto en el navegador como en Server Components: en Vercel el
// servidor corre en UTC, así que sin esto la misma tarjeta mostraría una hora
// distinta en el dashboard y en el link público del cliente.
const TIME_ZONE = "America/Santo_Domingo";

/** "3 ago 2026, 08:09" — fecha y hora en español dominicano. */
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-DO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: TIME_ZONE,
    });
  } catch {
    return iso;
  }
}

/** "3 ago" — versión corta para etiquetas donde el año sobra. */
export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-DO", {
      day: "numeric",
      month: "short",
      timeZone: TIME_ZONE,
    });
  } catch {
    return iso;
  }
}
