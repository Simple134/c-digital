import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Utilidades de las propuestas públicas con contraseña.
 *
 * La contraseña se guarda como scrypt "salt:hash". El acceso concedido se
 * recuerda con una cookie cuyo valor es un HMAC del id de la propuesta firmado
 * con el propio password_hash: cambiar la contraseña invalida todas las
 * cookies emitidas sin necesidad de guardar sesiones.
 */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

/** Nombre de la cookie que recuerda el acceso a una propuesta concreta. */
export function accessCookieName(proposalId: string): string {
  return `prop_${proposalId.replaceAll("-", "")}`;
}

/** Valor esperado de esa cookie: HMAC(id) con el password_hash como llave. */
export function accessCookieValue(
  proposalId: string,
  passwordHash: string,
): string {
  return createHmac("sha256", passwordHash).update(proposalId).digest("hex");
}

export function hasValidAccess(
  cookieValue: string | undefined,
  proposalId: string,
  passwordHash: string,
): boolean {
  if (!cookieValue) return false;
  const expected = accessCookieValue(proposalId, passwordHash);
  const got = Buffer.from(cookieValue);
  const want = Buffer.from(expected);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** "Ugo Café & Co." → "ugo-cafe-co". Para armar URLs legibles. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
