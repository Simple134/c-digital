import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RegistroPayload {
  email: string;
  password: string;
}

// Registro de clientes para /panel. Mismo modelo que /api/registro-submit
// (equipo): solo permite crear cuenta si el correo ya existe en `clients` y
// aún no tiene auth vinculada. El equipo da de alta al cliente con su correo;
// el cliente solo elige su contraseña. Sin signup abierto.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as RegistroPayload;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Correo o contraseña inválidos (mínimo 8 caracteres)." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("id, auth_user_id, active")
    .ilike("email", email)
    .maybeSingle();

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }
  if (!client || !client.active) {
    return NextResponse.json(
      { error: "Este correo no está autorizado. Contáctanos para activarlo." },
      { status: 403 },
    );
  }
  if (client.auth_user_id) {
    return NextResponse.json(
      { error: "Este correo ya tiene una cuenta. Inicia sesión." },
      { status: 409 },
    );
  }

  const { data: created, error: signUpError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (signUpError || !created.user) {
    return NextResponse.json(
      { error: signUpError?.message ?? "No se pudo crear la cuenta." },
      { status: 500 },
    );
  }

  const { error: linkError } = await admin
    .from("clients")
    .update({ auth_user_id: created.user.id })
    .eq("id", client.id);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
