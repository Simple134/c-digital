import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelAuth } from "@/lib/supabase/guards";

/**
 * El cliente solicita una reunión desde su panel.
 *
 * Cae en `meeting_requests` con status "nuevo", igual que las solicitudes del
 * sitio público, así que aparece en el mismo lugar del dashboard (Reuniones).
 * El equipo coordina fecha y Meet desde ahí; esto solo registra el pedido.
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

  let body: { date?: string; time?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const note = body.note?.trim().slice(0, 2000);
  if (!note) {
    return NextResponse.json(
      { error: "Cuéntanos de qué quieres hablar." },
      { status: 400 },
    );
  }
  // Fecha/hora preferidas: opcionales y solo con formato válido.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") ? body.date : null;
  const time = /^\d{2}:\d{2}$/.test(body.time ?? "") ? body.time : null;

  const admin = createAdminClient();
  const { error } = await admin.from("meeting_requests").insert({
    client_id: client.id,
    name: client.contact_name || client.name,
    email: client.email,
    business: client.company || client.name,
    phone: client.phone,
    note,
    meeting_date: date,
    meeting_time: time,
    digital: [],
    services: [],
    status: "nuevo",
  });

  if (error) {
    console.error("[panel/meeting] Error al crear la solicitud:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
