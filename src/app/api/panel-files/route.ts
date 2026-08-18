import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import type { ClientFileKind } from "@/lib/supabase/types";

/**
 * Gestión (del equipo) de los archivos que ve el cliente en su panel:
 * credenciales, contratos, documentos y links. Los archivos van al bucket
 * privado `client-files` y se sirven con URLs firmadas.
 */

const KINDS: ClientFileKind[] = ["credencial", "contrato", "documento", "link"];
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!(await isTeamMember())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const clientId = String(form.get("clientId") ?? "");
  const kind = String(form.get("kind") ?? "") as ClientFileKind;
  const title = String(form.get("title") ?? "").trim();
  const url = String(form.get("url") ?? "").trim() || null;
  const note = String(form.get("note") ?? "").trim() || null;
  const file = form.get("file");

  if (!clientId || !title || !KINDS.includes(kind)) {
    return NextResponse.json(
      { error: "Faltan cliente, título o tipo válido." },
      { status: 400 },
    );
  }
  if (kind === "link") {
    // El href se renderiza en el panel del cliente: un esquema javascript:
    // sería XSS almacenado. Solo http(s).
    let ok = false;
    try {
      ok = ["http:", "https:"].includes(new URL(url ?? "").protocol);
    } catch {
      ok = false;
    }
    if (!ok) {
      return NextResponse.json(
        { error: "Un link necesita una URL http(s) válida." },
        { status: 400 },
      );
    }
  }
  if (kind !== "link" && !(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  const admin = createAdminClient();

  let filePath: string | null = null;
  if (file instanceof File) {
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "El archivo debe pesar entre 1 byte y 25 MB." },
        { status: 400 },
      );
    }
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
    filePath = `${clientId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("client-files")
      .upload(filePath, await file.arrayBuffer(), { contentType: file.type });
    if (uploadError) {
      console.error("[panel-files] Error al subir:", uploadError);
      return NextResponse.json(
        { error: "No se pudo subir el archivo." },
        { status: 500 },
      );
    }
  }

  const { error } = await admin.from("client_files").insert({
    client_id: clientId,
    kind,
    title,
    url: kind === "link" ? url : null,
    file_path: filePath,
    note,
  });

  if (error) {
    if (filePath) await admin.storage.from("client-files").remove([filePath]);
    console.error("[panel-files] Error al registrar:", error);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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
    .from("client_files")
    .select("id, file_path")
    .eq("id", body.id)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { error } = await admin.from("client_files").delete().eq("id", row.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (row.file_path) {
    // Si el objeto no se borra, queda huérfano pero invisible: no bloquea.
    await admin.storage.from("client-files").remove([row.file_path]);
  }
  return NextResponse.json({ ok: true });
}
