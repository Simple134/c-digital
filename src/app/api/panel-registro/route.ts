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

  // El alta son dos escrituras en sistemas distintos (Auth y Postgres) y no hay
  // transacción que las cubra. Si la segunda falla, la cuenta queda huérfana:
  // el cliente puede entrar pero no es nadie para el panel ("no autorizado" en
  // todo) y tampoco puede reintentar, porque su correo ya existe en Auth. De ahí
  // que aquí se adopte una cuenta huérfana previa y se deshaga la creación si el
  // vínculo no llega a grabarse.
  let userId: string | null = null;
  let cuentaAdoptada = false;

  const { data: created, error: signUpError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (created?.user) {
    userId = created.user.id;
  } else {
    // ¿Existe ya una cuenta con este correo? Solo puede ser de este mismo
    // cliente: para llegar hasta aquí su correo tiene que estar en `clients`,
    // activo y sin `auth_user_id`. Se adopta y se le fija la contraseña
    // elegida, que es exactamente lo que habría hecho el alta normal.
    const huerfana = await buscarUsuarioPorCorreo(admin, email);
    if (!huerfana) {
      return NextResponse.json(
        { error: signUpError?.message ?? "No se pudo crear la cuenta." },
        { status: 500 },
      );
    }
    const { error: pwError } = await admin.auth.admin.updateUserById(
      huerfana.id,
      { password, email_confirm: true },
    );
    if (pwError) {
      return NextResponse.json({ error: pwError.message }, { status: 500 });
    }
    userId = huerfana.id;
    cuentaAdoptada = true;
  }

  const { error: linkError } = await admin
    .from("clients")
    .update({ auth_user_id: userId })
    .eq("id", client.id);

  if (linkError) {
    // Sin vínculo la cuenta no sirve para nada y bloquearía el próximo intento;
    // se deshace la creación. Una cuenta adoptada no se borra: no la creamos
    // nosotros y puede tener historia.
    if (!cuentaAdoptada) {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(userId);
      if (cleanupError) {
        console.error(
          `[panel-registro] Cuenta ${userId} (${email}) quedó huérfana: no se pudo vincular ni borrar.`,
          cleanupError,
        );
      }
    }
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Busca un usuario de Auth por correo. La API de admin no expone un "get by
 * email", así que se pagina el listado; son cuentas de clientes, no un padrón.
 */
async function buscarUsuarioPorCorreo(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<{ id: string } | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || !data?.users.length) return null;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return { id: hit.id };
    if (data.users.length < 200) return null;
  }
  return null;
}
