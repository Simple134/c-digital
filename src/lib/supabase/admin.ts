import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service role key: bypassa RLS. Solo debe usarse en código que
// corre en el servidor (route handlers, server components) para resolver
// accesos públicos por token sin exponer las tablas vía la anon key.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
