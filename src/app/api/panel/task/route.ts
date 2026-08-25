import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelAuth } from "@/lib/supabase/guards";

/**
 * El cliente agrega una tarea desde su panel.
 *
 * Entra a la primera columna del tablero (la de "por hacer") como una tarjeta
 * normal del equipo, marcada en la descripción con su procedencia. No se
 * asigna al cliente: él la pide, el equipo la hace.
 */
export async function POST(request: NextRequest) {
  const { client, reason } = await getPanelAuth();
  if (!client) {
    // 401 = la sesión caducó y basta con volver a entrar (el frontend lo usa
    // para mandar al login). 403 = la cuenta existe pero nadie la vinculó a un
    // cliente: reloguear no arregla nada, hay que tocar la tabla `clients`.
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

  let body: { title?: string; description?: string; projectId?: string | null };
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
  const projectId = body.projectId?.trim() || null;

  const admin = createAdminClient();

  if (projectId) {
    const { data: project } = await admin
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("client_id", client.id)
      .maybeSingle();
    if (!project) {
      return NextResponse.json(
        { error: "El proyecto no pertenece a tu cuenta." },
        { status: 403 },
      );
    }
  }

  // Las columnas pueden tener dueño (un cliente o un miembro del equipo), así
  // que no vale coger la primera pendiente del tablero: la tarea de este
  // cliente podría acabar en la columna privada de otro cliente o en la de una
  // persona, donde no le corresponde estar y donde nadie la vería al filtrar.
  // Se prefiere la primera columna pendiente de ESTE cliente y, si no tiene
  // ninguna, la primera pendiente global (client_id e assignee_id nulos).
  const { data: pendientes } = await admin
    .from("kanban_columns")
    .select("id, client_id, assignee_id")
    .eq("is_done", false)
    .or(`client_id.eq.${client.id},and(client_id.is.null,assignee_id.is.null)`)
    .order("sort_order", { ascending: true });

  const firstCol =
    pendientes?.find((c) => c.client_id === client.id) ?? pendientes?.[0];

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
      project_id: projectId,
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
