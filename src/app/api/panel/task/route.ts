import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelClient } from "@/lib/supabase/guards";

/**
 * El cliente agrega una tarea desde su panel.
 *
 * Entra a la primera columna del tablero (la de "por hacer") como una tarjeta
 * normal del equipo, marcada en la descripción con su procedencia. No se
 * asigna al cliente: él la pide, el equipo la hace.
 */
export async function POST(request: NextRequest) {
  const client = await getPanelClient();
  if (!client) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { title?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title || title.length > 200) {
    return NextResponse.json(
      { error: "El título es obligatorio (máximo 200 caracteres)." },
      { status: 400 },
    );
  }
  const description = body.description?.trim().slice(0, 2000) || null;

  const admin = createAdminClient();

  const { data: firstCol } = await admin
    .from("kanban_columns")
    .select("id")
    .eq("is_done", false)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstCol) {
    return NextResponse.json(
      { error: "El tablero no tiene columnas." },
      { status: 500 },
    );
  }

  // Al final de la columna: el orden lo decide el equipo.
  const { data: last } = await admin
    .from("kanban_cards")
    .select("sort_order")
    .eq("column_id", firstCol.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await admin
    .from("kanban_cards")
    .insert({
      column_id: firstCol.id,
      title,
      description: description
        ? `${description}\n\n— Solicitada por ${client.name} desde su panel.`
        : `— Solicitada por ${client.name} desde su panel.`,
      client_id: client.id,
      assigned_to_client: false,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[panel/task] Error al crear la tarea:", error);
    return NextResponse.json(
      { error: "No se pudo crear la tarea." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: created.id });
}
