import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión en cada request y protege las rutas del panel.
//
// Todo el cuerpo va dentro de un try/catch: si algo lanza (env ausente en el
// bundle edge, cookie corrupta, fallo de red hacia Supabase) el middleware
// NO debe reventar con MIDDLEWARE_INVOCATION_FAILED. Falla "hacia abierto"
// dejando pasar la request; la protección real del panel vive además en
// dashboard/page.tsx (getUser + redirect), así que no se abre hueco de acceso.
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin credenciales no podemos validar la sesión; dejamos que la página
  // aplique su propio guard en lugar de tumbar la ruta.
  if (!url || !anonKey) {
    console.error(
      "updateSession: faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
    return NextResponse.next({ request });
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // IMPORTANTE: no ejecutar código entre createServerClient y getUser().
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Panel protegido: sin sesión -> login
    if (pathname.startsWith("/dashboard") && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    // Ya logueado no debería ver el login
    if (pathname.startsWith("/login") && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("updateSession falló; se deja pasar la request:", err);
    return NextResponse.next({ request });
  }
}
