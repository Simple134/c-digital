import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelAuth } from "@/lib/supabase/guards";

type AccountPayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

export async function PATCH(request: NextRequest) {
  const { client, reason } = await getPanelAuth();
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

  let body: AccountPayload;
  try {
    body = (await request.json()) as AccountPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const firstName = cleanText(body.firstName, 80);
  const lastName = cleanText(body.lastName, 80);
  const phone = cleanText(body.phone, 40);
  const email = body.email?.trim().toLowerCase() ?? "";
  const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();

  if (!firstName || !lastName || !phone || !isEmail(email)) {
    return NextResponse.json(
      { error: "Completa nombre, apellido, teléfono y correo válidos." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const currentEmail = client.email?.trim().toLowerCase() ?? "";
  let authEmailUpdated = false;

  if (email !== currentEmail) {
    const { data: existingClient, error: existingError } = await admin
      .from("clients")
      .select("id")
      .ilike("email", email)
      .neq("id", client.id)
      .maybeSingle();

    if (existingError) {
      console.error("[panel/account] Error validando correo:", existingError);
      return NextResponse.json(
        { error: "No se pudo validar el correo." },
        { status: 500 },
      );
    }
    if (existingClient) {
      return NextResponse.json(
        { error: "Ese correo ya está asociado a otro cliente." },
        { status: 409 },
      );
    }

    if (client.auth_user_id) {
      const { error: authError } = await admin.auth.admin.updateUserById(
        client.auth_user_id,
        { email, email_confirm: true },
      );
      if (authError) {
        console.error("[panel/account] Error actualizando Auth:", authError);
        return NextResponse.json(
          { error: "No se pudo actualizar el correo de acceso." },
          { status: 500 },
        );
      }
      authEmailUpdated = true;
    }
  }

  const { error: updateError } = await admin
    .from("clients")
    .update({
      name: fullName,
      contact_name: fullName,
      phone,
      email,
    })
    .eq("id", client.id)
    .eq("auth_user_id", client.auth_user_id);

  if (updateError) {
    console.error("[panel/account] Error actualizando cliente:", updateError);
    if (authEmailUpdated && client.auth_user_id && currentEmail) {
      const { error: rollbackError } = await admin.auth.admin.updateUserById(
        client.auth_user_id,
        { email: currentEmail, email_confirm: true },
      );
      if (rollbackError) {
        console.error(
          "[panel/account] No se pudo revertir el correo de Auth:",
          rollbackError,
        );
      }
    }
    return NextResponse.json(
      { error: "No se pudieron guardar los cambios." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    client: {
      name: fullName,
      contact_name: fullName,
      phone,
      email,
    },
  });
}

function cleanText(value: string | undefined, max: number): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
