import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RegistroPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

// Registro de contactos para /panel. Un cliente puede tener varios contactos
// (logins) compartiendo los mismos proyectos; este endpoint resuelve tres
// entradas distintas para el mismo formulario:
// - invitación de un colega (el correo ya existe en `client_contacts` sin
//   auth_user_id, creada desde /api/panel/contacts): solo se vincula la cuenta;
// - invitación del equipo (el correo existe en `clients` pero aún no tiene
//   ningún contacto): se crea su primer contacto;
// - enlace público: no existe en ningún lado, se crea cliente + contacto.
export async function POST(request: NextRequest) {
  let body: RegistroPayload;
  try {
    body = (await request.json()) as RegistroPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const firstName = cleanText(body.firstName, 80);
  const lastName = cleanText(body.lastName, 80);
  const phone = cleanText(body.phone, 40);
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const passwordConfirm = body.passwordConfirm;
  const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();

  if (!firstName || !lastName || !phone || !email || !isEmail(email)) {
    return NextResponse.json(
      { error: "Completa nombre, apellido, teléfono y correo válidos." },
      { status: 400 },
    );
  }

  if (!password || password.length < 8 || password !== passwordConfirm) {
    return NextResponse.json(
      {
        error:
          "La contraseña debe tener mínimo 8 caracteres y coincidir con la confirmación.",
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: existingContact, error: contactError } = await admin
    .from("client_contacts")
    .select("id, client_id, auth_user_id")
    .ilike("email", email)
    .maybeSingle();

  if (contactError) {
    return NextResponse.json({ error: contactError.message }, { status: 500 });
  }
  if (existingContact?.auth_user_id) {
    return NextResponse.json(
      { error: "Este correo ya tiene una cuenta. Inicia sesión." },
      { status: 409 },
    );
  }
  if (existingContact) {
    const { data: ownerClient } = await admin
      .from("clients")
      .select("active")
      .eq("id", existingContact.client_id)
      .maybeSingle();
    if (ownerClient && !ownerClient.active) {
      return NextResponse.json(
        {
          error:
            "Este correo no está autorizado. Contáctanos para activarlo.",
        },
        { status: 403 },
      );
    }
  }

  let clientId = existingContact?.client_id ?? null;
  let contactId = existingContact?.id ?? null;
  let fichaCreada = false;

  // Sin contacto todavía: puede ser un cliente que el equipo dio de alta con
  // correo pero sin invitar aún, o un registro público de cero.
  if (!clientId) {
    const { data: legacyClient } = await admin
      .from("clients")
      .select("id, active")
      .ilike("email", email)
      .maybeSingle();

    if (legacyClient && !legacyClient.active) {
      return NextResponse.json(
        {
          error: "Este correo no está autorizado. Contáctanos para activarlo.",
        },
        { status: 403 },
      );
    }
    clientId = legacyClient?.id ?? null;
  }

  if (!clientId) {
    const { data: last } = await admin
      .from("clients")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: createdClient, error: createClientError } = await admin
      .from("clients")
      .insert({
        name: fullName,
        contact_name: fullName,
        phone,
        email,
        active: true,
        custom_fields: {},
        sort_order: (last?.sort_order ?? -1) + 1,
      })
      .select("id")
      .single();

    if (createClientError) {
      return NextResponse.json(
        { error: createClientError.message },
        { status: 500 },
      );
    }
    clientId = createdClient.id;
    fichaCreada = true;
  }

  // El alta son varias escrituras en sistemas distintos (Auth y Postgres) y no
  // hay transacción que las cubra. Si una posterior falla, la cuenta queda
  // huérfana: la persona puede entrar pero no es nadie para el panel ("no
  // autorizado" en todo) y tampoco puede reintentar, porque su correo ya
  // existe en Auth. De ahí que aquí se adopte una cuenta huérfana previa y se
  // deshaga lo creado si el vínculo no llega a grabarse.
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
    if (fichaCreada) {
      await admin.from("clients").delete().eq("id", clientId);
      return NextResponse.json(
        { error: "Este correo ya tiene una cuenta. Inicia sesión." },
        { status: 409 },
      );
    }

    // En invitaciones puede existir una cuenta huérfana de un intento anterior.
    // Se adopta porque el correo ya estaba autorizado (por el equipo o por un
    // colega suyo).
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

  const contactUpsert = contactId
    ? await admin
        .from("client_contacts")
        .update({ auth_user_id: userId, name: fullName, accepted_at: new Date().toISOString() })
        .eq("id", contactId)
    : await admin
        .from("client_contacts")
        .insert({
          client_id: clientId,
          auth_user_id: userId,
          name: fullName,
          email,
          accepted_at: new Date().toISOString(),
        })
        .select("id")
        .single();

  if (contactUpsert.error) {
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
    if (fichaCreada) {
      await admin.from("clients").delete().eq("id", clientId);
    }
    return NextResponse.json(
      { error: contactUpsert.error.message },
      { status: 500 },
    );
  }
  if (!contactId && "data" in contactUpsert && contactUpsert.data) {
    contactId = contactUpsert.data.id;
  }

  return NextResponse.json({ ok: true });
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
