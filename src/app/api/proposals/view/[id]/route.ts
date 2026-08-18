import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { accessCookieName, hasValidAccess } from "@/lib/proposals";
import type { Proposal } from "@/lib/supabase/types";

/**
 * Sirve el HTML de una propuesta para el iframe de la página pública, solo si
 * el navegador trae la cookie de acceso (emitida al validar la contraseña).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("proposals")
    .select("id, file_path, password_hash, is_active")
    .eq("id", id)
    .maybeSingle();
  const proposal = data as Pick<
    Proposal,
    "id" | "file_path" | "password_hash" | "is_active"
  > | null;

  if (!proposal || !proposal.is_active) {
    return new NextResponse("No disponible", { status: 404 });
  }

  const cookie = request.cookies.get(accessCookieName(proposal.id))?.value;
  if (!hasValidAccess(cookie, proposal.id, proposal.password_hash)) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { data: file, error } = await admin.storage
    .from("proposals")
    .download(proposal.file_path);
  if (error || !file) {
    console.error("[proposals] Error al descargar:", error);
    return new NextResponse("Error al cargar la propuesta", { status: 500 });
  }

  return new NextResponse(await file.arrayBuffer(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // `sandbox` sin allow-same-origin: el HTML subido corre con origen
      // opaco incluso si se navega directo a esta URL (no solo en el iframe),
      // así no puede leer cookies ni storage del sitio. frame-ancestors:
      // solo nuestra propia página puede embeberla.
      "Content-Security-Policy":
        "sandbox allow-scripts allow-popups; frame-ancestors 'self'",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "private, no-store",
    },
  });
}
