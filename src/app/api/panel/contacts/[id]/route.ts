import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelAuth } from "@/lib/supabase/guards";

/**
 * Quita a otro contacto del mismo cliente (revoca su acceso a este panel).
 * Cualquier contacto puede quitar a otro, pero no a sí mismo: eso dejaría al
 * cliente potencialmente sin nadie con acceso por accidente.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { client, contact, reason } = await getPanelAuth();
  if (!client) {
    return reason === "sin-sesion"
      ? NextResponse.json(
          { error: "Tu sesión expiró. Vuelve a iniciar sesión." },
          { status: 401 },
        )
      : NextResponse.json(
          {
            error:
              "Tu cuenta no está vinculada a ningún cliente. Escríbenos para activarla.",
          },
          { status: 403 },
        );
  }

  const { id } = await params;
  if (id === contact.id) {
    return NextResponse.json(
      { error: "No puedes quitarte a ti mismo." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("client_contacts")
    .select("id, client_id, auth_user_id")
    .eq("id", id)
    .maybeSingle();

  if (!target || target.client_id !== client.id) {
    return NextResponse.json(
      { error: "Contacto no encontrado." },
      { status: 404 },
    );
  }

  const { error } = await admin.from("client_contacts").delete().eq("id", id);
  if (error) {
    console.error("[panel/contacts] Error al quitar contacto:", error);
    return NextResponse.json(
      { error: "No se pudo quitar el contacto." },
      { status: 500 },
    );
  }

  // Si ya se había registrado, también se le cierra el acceso a Supabase Auth;
  // una invitación pendiente (auth_user_id null) no tiene nada que revocar ahí.
  if (target.auth_user_id) {
    const { error: authError } = await admin.auth.admin.deleteUser(
      target.auth_user_id,
    );
    if (authError) {
      console.error(
        "[panel/contacts] No se pudo borrar la cuenta de Auth:",
        authError,
      );
    }
  }

  return NextResponse.json({ ok: true });
}
