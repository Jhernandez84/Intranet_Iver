import { createClient } from "@supabase/supabase-js";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

/**
 * T es el tipo de la fila de tu tabla (opcional)
 */

export type AllowedTables =
  | "bank_movements"
  | "bank_reconciliations"
  | "bank_payment_gateway_details";

export async function deleteByRange<T>(
  tableName: AllowedTables,
  dateColumn: keyof T | string,
  start: string,
  end: string,
  extras: Partial<T> = {},
) {
  let query = supabase
    .from(tableName)
    .delete()
    .gte(dateColumn as string, start)
    .lte(dateColumn as string, end);

  // Agrega filtros extra si existen (ej: tenant_id)
  Object.entries(extras).forEach(([key, value]) => {
    if (value !== undefined) {
      query = query.eq(key, value);
    }
  });

  const { error } = await query;
  if (error) throw error;
}
