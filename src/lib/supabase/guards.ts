import { createClient } from "./server";
import { createAdminClient } from "./admin";
import type { Client, ClientContact } from "./types";

/**
 * Guards de identidad para páginas y API routes.
 *
 * Desde que los clientes tienen cuenta de auth (/panel), "tiene sesión" ya no
 * significa "es del equipo": todo lo que antes se protegía con getUser() a
 * secas necesita distinguir a quién pertenece la sesión.
 */

/**
 * Resultado de resolver la sesión del panel.
 *
 * "sin sesión" y "sesión que no pertenece a ningún cliente" son dos fallos
 * distintos con arreglos opuestos —volver a entrar vs. vincular la cuenta en
 * `client_contacts`—, así que se distinguen en vez de colapsar ambos en un null.
 */
export type PanelAuth =
  | { client: Client; contact: ClientContact; reason: null }
  | { client: null; contact: null; reason: "sin-sesion" | "sin-cliente" };

/**
 * Resuelve la sesión del panel diciendo por qué falló, si falló.
 *
 * Un cliente puede tener varios contactos (logins) desde `client_contacts`;
 * todos ven el mismo `client` (mismos proyectos, tareas, facturas). `contact`
 * es quién de ellos entró, para atribuir invitaciones y acciones personales.
 */
export async function getPanelAuth(): Promise<PanelAuth> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // La sesión caducada o revocada llega hasta aquí como un error de getUser();
    // dejarlo en el log es lo que permite distinguirla de un contacto sin vincular.
    if (error) console.error("[panel] getUser() falló:", error.message);
    return { client: null, contact: null, reason: "sin-sesion" };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("client_contacts")
    .select("*, clients(*)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!data) {
    console.error(
      `[panel] La sesión ${user.id} (${user.email}) no está vinculada a ningún contacto.`,
    );
    return { client: null, contact: null, reason: "sin-cliente" };
  }
  const { clients, ...contact } = data as ClientContact & { clients: Client };
  return { client: clients, contact: contact as ClientContact, reason: null };
}

/** El cliente del panel dueño de la sesión actual, o null. */
export async function getPanelClient(): Promise<Client | null> {
  return (await getPanelAuth()).client;
}

/** true si la sesión actual pertenece a un miembro del equipo. */
export async function isTeamMember(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("team_members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return Boolean(data);
}
