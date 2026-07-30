import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RegistroPayload {
  email: string;
  password: string;
}

// Solo permite crear cuenta si el correo ya existe en team_members y aún no
// tiene una cuenta de auth vinculada (auth_user_id). Así el registro queda
// restringido a miembros del equipo dados de alta por un admin, sin abrir
// un signup público.
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

  const { data: member, error: memberError } = await admin
    .from("team_members")
    .select("id, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json(
      { error: "Este correo no está autorizado para registrarse." },
      { status: 403 },
    );
  }
  if (member.auth_user_id) {
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
    .from("team_members")
    .update({ auth_user_id: created.user.id })
    .eq("id", member.id);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
