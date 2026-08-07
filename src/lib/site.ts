// Dominio canónico del sitio, para construir enlaces absolutos que salen del
// servidor (correos, por ejemplo).
//
// Deliberadamente NO se deriva del Host de la petición entrante. Ese header lo
// controla quien llama, así que un `Host:` falsificado terminaría convertido en
// un enlace dentro de un correo firmado con nuestro dominio — un vector de
// phishing perfecto contra el propio equipo y los clientes.
const CANONICAL_ORIGIN = "https://www.estudiocdigital.com";

/**
 * Base absoluta para enlaces salientes. `NEXT_PUBLIC_SITE_URL` permite apuntar
 * a un preview o a localhost durante el desarrollo; en producción se cae al
 * dominio canónico, nunca al de la petición.
 */
export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return CANONICAL_ORIGIN;
  // Se descarta una configuración inválida en lugar de generar enlaces roscos.
  try {
    return new URL(configured).origin;
  } catch {
    console.warn(
      `[site] NEXT_PUBLIC_SITE_URL inválida (${configured}); se usa ${CANONICAL_ORIGIN}.`,
    );
    return CANONICAL_ORIGIN;
  }
}
