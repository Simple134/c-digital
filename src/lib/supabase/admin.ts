import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service role key: bypassa RLS. Solo debe usarse en código que
// corre en el servidor (route handlers, server components) para resolver
// accesos públicos por token sin exponer las tablas vía la anon key.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Sin esto el error en producción llega al navegador como un digest opaco.
  if (!url || !serviceRoleKey) {
    throw new Error(
      `[supabase/admin] Faltan variables de entorno: ${[
        !url && "NEXT_PUBLIC_SUPABASE_URL",
        !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
      ]
        .filter(Boolean)
        .join(", ")}. Configúralas en el proyecto de Vercel (Production) y redeploy.`,
    );
  }

  return createSupabaseClient(
    url,
    serviceRoleKey,
    {
      auth: { persistSession: false },
      // Next.js parchea el fetch global y cachea agresivamente las
      // peticiones de Server Components; sin esto, resultados viejos (ej.
      // "cliente no encontrado" de una prueba anterior) quedan pegados.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}
