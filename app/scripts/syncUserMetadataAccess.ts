// scripts/syncUserMetadataAccess.ts
import { createClient } from "@supabase/supabase-js";

import { config } from "dotenv";
config({ path: ".env.local" }); // <-- lee .env.local en la raíz del repo

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!, // ¡clave de servicio!
);

async function main() {
  // 1) Leer mapping user_id -> access_keys desde la vista
  const { data: rows, error } = await supabaseAdmin
    .from("user_access_keys")
    .select("user_id, access_keys");

  if (error) throw error;

  // 2) Paginación de usuarios para asegurar consistencia (opcional)
  let page = 1;
  const perPage = 1000;

  for (;;) {
    const { data: usersPage, error: listErr } =
      await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (listErr) throw listErr;

    if (!usersPage?.users?.length) break;

    for (const u of usersPage.users) {
      const row = rows?.find((r) => r.user_id === u.id);
      const access = row?.access_keys ?? [];

      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(
        u.id,
        { user_metadata: { ...(u.user_metadata ?? {}), access } },
      );

      if (updErr) {
        console.error(`❌ Falló metadata de ${u.id}:`, updErr.message);
      } else {
        console.log(`✅ Sync metadata de ${u.id}:`, access);
      }
    }

    page += 1;
  }

  console.log("🎉 Bulk sync completado");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
