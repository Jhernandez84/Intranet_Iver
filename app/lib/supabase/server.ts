import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Llamar de nuevo en cada Server Component / Route Handler — no cachear
// la instancia entre requests. cookies() es async en Next 15.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll llamado desde un Server Component (no Route Handler ni
            // Server Action). Se puede ignorar porque el middleware refresca
            // la sesión en cada request.
          }
        },
      },
    },
  );
}
