import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type MenuItemKey = { key: string };
type UserAccessRow = {
  // Supabase puede devolver relación como objeto o como array
  menu_items: MenuItemKey | MenuItemKey[] | null;
};

export async function syncUserMetadataAccess(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_access")
    .select("menu_items(key)") // relación a menu_items
    .eq("user_id", userId);

  if (error) throw error;

  const rows = (data ?? []) as UserAccessRow[];

  // Extrae las keys sin importar si es objeto o array
  const accessKeys = rows.flatMap((row) => {
    const mi = row.menu_items;
    if (!mi) return [];
    if (Array.isArray(mi)) {
      // caso que te está pasando: { menu_items: [{ key: 'finances' }] }
      return mi.map((x) => x?.key).filter((k): k is string => !!k);
    }
    // caso objeto: { menu_items: { key: 'finances' } }
    return mi.key ? [mi.key] : [];
  });

  // Opcional: deduplicar
  const uniqueKeys = Array.from(new Set(accessKeys));

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: { access: uniqueKeys } },
  );

  if (updateError) throw updateError;
}
