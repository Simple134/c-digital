import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  accessCookieName,
  accessCookieValue,
  verifyPassword,
} from "@/lib/proposals";
import type { Proposal } from "@/lib/supabase/types";

/**
 * El cliente envía la contraseña de una propuesta. Si es correcta se emite la
 * cookie de acceso y se registra la lectura (primera vista + contador): eso es
 * lo que le dice al equipo que el cliente abrió la propuesta.
 */
export async function POST(request: NextRequest) {
  let body: { id?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.id || !body.password) {
    return NextResponse.json(
      { error: "Falta la contraseña." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("proposals")
    .select("id, password_hash, is_active, view_count, first_viewed_at")
    .eq("id", body.id)
    .maybeSingle();
  const proposal = data as Pick<
    Proposal,
    "id" | "password_hash" | "is_active" | "view_count" | "first_viewed_at"
  > | null;

  if (!proposal || !proposal.is_active) {
    return NextResponse.json({ error: "No disponible." }, { status: 404 });
  }
  if (!verifyPassword(body.password, proposal.password_hash)) {
    return NextResponse.json(
      { error: "Contraseña incorrecta." },
      { status: 401 },
    );
  }

  const now = new Date().toISOString();
  await admin
    .from("proposals")
    .update({
      view_count: proposal.view_count + 1,
      last_viewed_at: now,
      first_viewed_at: proposal.first_viewed_at ?? now,
    })
    .eq("id", proposal.id);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    accessCookieName(proposal.id),
    accessCookieValue(proposal.id, proposal.password_hash),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  );
  return res;
}
