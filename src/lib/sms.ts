import twilio from "twilio";

/**
 * Envío de SMS a clientes vía Twilio (recordatorios de pago, links, tareas
 * asignadas). Un solo helper para que todas las rutas compartan el mismo
 * manejo de errores y formato de número, igual que Resend en src/lib/delivery.
 */

export type SmsResult =
  | { sent: true; sid: string }
  | { sent: false; reason: string };

let client: ReturnType<typeof twilio> | null = null;

function getClient(): ReturnType<typeof twilio> | null {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !authToken) return null;
  if (!client) client = twilio(sid, authToken);
  return client;
}

/**
 * Normaliza a E.164. Si ya trae "+" se deja igual; si no, asume República
 * Dominicana (código 1) — la mayoría de los números guardados son locales de
 * 10 dígitos sin código de país.
 */
export function toE164(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : null;
}

export async function sendSms(opts: {
  to: string;
  body: string;
}): Promise<SmsResult> {
  const twilioClient = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!twilioClient || !from) {
    console.warn(
      "[sms] Twilio no configurado (falta TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN o TWILIO_PHONE_NUMBER).",
    );
    return { sent: false, reason: "El servicio de SMS no está configurado." };
  }

  const to = toE164(opts.to);
  if (!to) {
    return { sent: false, reason: "Número de teléfono inválido." };
  }

  try {
    const message = await twilioClient.messages.create({
      to,
      from,
      body: opts.body,
    });
    return { sent: true, sid: message.sid };
  } catch (err) {
    console.error("[sms] Twilio rechazó el envío:", err);
    const reason = err instanceof Error ? err.message : "Error desconocido";
    return { sent: false, reason: `Twilio rechazó el envío — ${reason}` };
  }
}
