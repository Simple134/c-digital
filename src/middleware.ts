import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Corre en login/dashboard; excluye estáticos, imágenes y favicon.
  matcher: ["/login/:path*", "/dashboard/:path*"],
};
