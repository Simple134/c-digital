import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Corre en login/registro/dashboard/panel y en la API del panel;
  // excluye estáticos, imágenes y favicon.
  matcher: [
    "/login/:path*",
    "/registro/:path*",
    "/dashboard/:path*",
    "/panel/:path*",
    // Las llamadas del panel del cliente también pasan por aquí: es el único
    // punto donde la sesión se refresca Y las cookies nuevas se persisten. Sin
    // esto, un POST hecho desde un panel abierto hace rato puede llegar al
    // handler con una sesión que ya no valida y responder "No autorizado".
    "/api/panel/:path*",
  ],
};
