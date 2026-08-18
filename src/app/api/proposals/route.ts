import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import { hashPassword, slugify } from "@/lib/proposals";
import type { Client, Proposal } from "@/lib/supabase/types";

/**
 * Gestión (del equipo) de propuestas HTML con link público protegido por
 * contraseña. El HTML va al bucket privado `proposals` y solo se sirve vía
 * /api/proposals/view/[id] tras validar la contraseña.
 */

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!(await isTeamMember())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const clientId = String(form.get("clientId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const file = form.get("file");

  if (!clientId || !title || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Faltan cliente, título o archivo HTML." },
      { status: 400 },
    );
  }
  if (password.length < 4) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 4 caracteres." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El HTML debe pesar entre 1 byte y 5 MB." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select("id, name")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) {
    return NextResponse.json({ error: "Cliente no existe." }, { status: 404 });
  }

  const clientSlug = slugify((client as Pick<Client, "id" | "name">).name);
  const slug = slugify(title);
  if (!clientSlug || !slug) {
    return NextResponse.json(
      { error: "El nombre del cliente o el título no generan un slug válido." },
      { status: 400 },
    );
  }

  const filePath = `${clientId}/${Date.now()}-${slug}.html`;
  const { error: uploadError } = await admin.storage
    .from("proposals")
    .upload(filePath, await file.arrayBuffer(), {
      contentType: "text/html; charset=utf-8",
    });
  if (uploadError) {
    console.error("[proposals] Error al subir:", uploadError);
    return NextResponse.json(
      { error: "No se pudo subir el HTML." },
      { status: 500 },
    );
  }

  const { data: inserted, error } = await admin
    .from("proposals")
    .insert({
      client_id: clientId,
      client_slug: clientSlug,
      slug,
      title,
      file_path: filePath,
      password_hash: hashPassword(password),
    })
    .select("id, client_slug, slug")
    .single();

  if (error) {
    await admin.storage.from("proposals").remove([filePath]);
    const msg =
      error.code === "23505"
        ? "Ya existe una propuesta con ese título para este cliente."
        : "No se pudo guardar.";
    console.error("[proposals] Error al registrar:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const p = inserted as Pick<Proposal, "id" | "client_slug" | "slug">;
  return NextResponse.json({
    ok: true,
    url: `/propuestas/${p.client_slug}/${p.slug}`,
  });
}

export async function DELETE(request: NextRequest) {
  if (!(await isTeamMember())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("proposals")
    .select("id, file_path")
    .eq("id", body.id)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const { error } = await admin.from("proposals").delete().eq("id", row.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Si el objeto no se borra, queda huérfano pero invisible: no bloquea.
  await admin.storage.from("proposals").remove([row.file_path]);
  return NextResponse.json({ ok: true });
}
