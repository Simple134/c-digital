import { createClient } from "./server";
import { createAdminClient } from "./admin";
import type { Client } from "./types";

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
 * `clients`—, así que se distinguen en vez de colapsar ambos en un null.
 */
export type PanelAuth =
  | { client: Client; reason: null }
  | { client: null; reason: "sin-sesion" | "sin-cliente" };

/** Resuelve la sesión del panel diciendo por qué falló, si falló. */
export async function getPanelAuth(): Promise<PanelAuth> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // La sesión caducada o revocada llega hasta aquí como un error de getUser();
    // dejarlo en el log es lo que permite distinguirla de un cliente sin vincular.
    if (error) console.error("[panel] getUser() falló:", error.message);
    return { client: null, reason: "sin-sesion" };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("clients")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!data) {
    console.error(
      `[panel] La sesión ${user.id} (${user.email}) no está vinculada a ningún cliente.`,
    );
    return { client: null, reason: "sin-cliente" };
  }
  return { client: data as Client, reason: null };
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
