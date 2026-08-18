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

/** El cliente del panel dueño de la sesión actual, o null. */
export async function getPanelClient(): Promise<Client | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("clients")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return (data as Client) ?? null;
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
