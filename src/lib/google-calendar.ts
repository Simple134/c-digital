import { google } from "googleapis";

// Zona horaria por defecto para los eventos (República Dominicana).
const TIME_ZONE = process.env.GOOGLE_CALENDAR_TZ ?? "America/Santo_Domingo";

// ID del calendario donde se crean los eventos. "primary" = el calendario
// principal de la cuenta dueña del refresh token (diazc6001@gmail.com).
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "primary";

export interface MeetingEventInput {
  summary: string;
  description: string;
  // Instante de inicio en ISO 8601 calculado en el cliente (conoce la hora
  // local real del visitante). El servidor NO reinterpreta la hora.
  startISO: string;
  // Duración en minutos (por defecto 30).
  durationMinutes?: number;
  // Correos a invitar (cliente + equipo). Reciben la invitación de Google.
  attendees: string[];
}

export interface MeetingEventResult {
  eventId: string;
  meetLink: string | null;
  htmlLink: string | null;
}

// Indica si las credenciales de Google Calendar están configuradas. Permite
// que el endpoint degrade con elegancia (guardar + correo) cuando aún no se
// ha completado el setup de OAuth.
export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN,
  );
}

function getCalendarClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // El redirect URI solo se usa durante el consentimiento inicial; para
    // refrescar el access token con el refresh token no se necesita, pero la
    // librería lo acepta igual.
    process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/oauth2callback",
  );
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2 });
}

// Crea un evento en Google Calendar con un enlace de Google Meet generado
// automáticamente e invita a los asistentes indicados.
export async function createMeetingEvent(
  input: MeetingEventInput,
): Promise<MeetingEventResult> {
  const calendar = getCalendarClient();
  const start = new Date(input.startISO);
  const end = new Date(
    start.getTime() + (input.durationMinutes ?? 30) * 60_000,
  );

  // requestId debe ser único por solicitud de conferencia. Derivarlo del
  // instante evita usar Math.random (no disponible en algunos runtimes) y es
  // suficientemente único para este volumen.
  const requestId = `cdigital-${start.getTime()}`;

  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    // Necesario para que Google procese la creación del Meet.
    conferenceDataVersion: 1,
    // Envía las invitaciones por correo a los asistentes.
    sendUpdates: "all",
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: start.toISOString(), timeZone: TIME_ZONE },
      end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
      attendees: input.attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const data = res.data;
  const meetLink =
    data.hangoutLink ??
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")
      ?.uri ??
    null;

  return {
    eventId: data.id ?? "",
    meetLink,
    htmlLink: data.htmlLink ?? null,
  };
}
