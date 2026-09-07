import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelAuth } from "@/lib/supabase/guards";

const BUCKET = "kanban-attachments";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 6;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

/**
 * El cliente marca como completada una tarea que se le asignó, dejando
 * opcionalmente una nota y una imagen de evidencia. Solo puede tocar tarjetas
 * suyas y marcadas `assigned_to_client`: el resto del tablero es del equipo.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id: cardId } = await params;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "La solicitud debe enviarse como formulario." },
      { status: 400 },
    );
  }

  const comment = String(form.get("comment") ?? "").trim().slice(0, 2000) || null;
  const files = form
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Máximo ${MAX_FILES} imágenes por tarea.` },
      { status: 400 },
    );
  }
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Cada imagen debe pesar máximo 10 MB." },
        { status: 400 },
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Solo se aceptan imágenes (JPG, PNG, WEBP, HEIC)." },
        { status: 400 },
      );
    }
  }

  const admin = createAdminClient();

  const { data: card } = await admin
    .from("kanban_cards")
    .select("id, client_id, assigned_to_client, completed_at")
    .eq("id", cardId)
    .maybeSingle();

  if (!card || card.client_id !== client.id || !card.assigned_to_client) {
    return NextResponse.json(
      { error: "Tarea no encontrada." },
      { status: 404 },
    );
  }
  if (card.completed_at) {
    return NextResponse.json(
      { error: "Esta tarea ya está completada." },
      { status: 409 },
    );
  }

  // Columna terminal a la que aterriza: la suya si tiene una privada, si no la
  // terminal global (sin dueño), igual que /api/panel/task elige la de "por
  // hacer" — misma regla de reparto, otro extremo del tablero.
  const { data: terminales } = await admin
    .from("kanban_columns")
    .select("id, client_id, assignee_id")
    .eq("is_done", true)
    .or(`client_id.eq.${client.id},and(client_id.is.null,assignee_id.is.null)`)
    .order("sort_order", { ascending: true });

  const doneCol =
    terminales?.find((c) => c.client_id === client.id) ?? terminales?.[0];

  if (!doneCol) {
    return NextResponse.json(
      { error: "El tablero no tiene columna de completadas." },
      { status: 500 },
    );
  }

  const uploadedPaths: string[] = [];
  const evidence: { url: string; path: string }[] = [];
  for (const [i, file] of files.entries()) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 8);
    const path = `evidence/${client.id}/${cardId}/${Date.now()}-${i}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, await file.arrayBuffer(), { contentType: file.type });
    if (uploadError) {
      console.error("[panel/task] Error al subir evidencia:", uploadError);
      if (uploadedPaths.length) await admin.storage.from(BUCKET).remove(uploadedPaths);
      return NextResponse.json(
        { error: "No se pudo subir una de las imágenes." },
        { status: 500 },
      );
    }
    uploadedPaths.push(path);
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    evidence.push({ url: pub.publicUrl, path });
  }

  const { error } = await admin
    .from("kanban_cards")
    .update({
      column_id: doneCol.id,
      completed_at: new Date().toISOString(),
      client_comment: comment,
      ...(evidence.length ? { client_evidence: evidence } : {}),
    })
    .eq("id", cardId);

  if (error) {
    if (uploadedPaths.length) await admin.storage.from(BUCKET).remove(uploadedPaths);
    console.error("[panel/task] Error al completar la tarea:", error);
    return NextResponse.json(
      { error: "No se pudo completar la tarea." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
