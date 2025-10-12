import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type MovementDetail = {
  company_id: string;
  tipo_mov_contable: string | null;
  tipo_mov_generico: string | null;
  tipo_mov_clase: string | null;
  // ... cualquier otro campo de detalle que necesites
};

export async function fetchMovementDetail(
  movementId: string,
): Promise<MovementDetail | null> {
  try {
    const supabase = createClientComponentClient();

    const query = supabase
      .from("tipos_movimiento")
      // Ahora sí, traemos todas las columnas o la que necesitamos para el detalle
      .select(
        "id, descripcion, company_id, activo, tipo_mov_contable, tipo_mov_generico, tipo_movimiento, tipo_mov_clase",
      )
      .eq("id", movementId)
      .single(); // Esperamos un solo registro

    const { data, error } = await query;

    if (error) {
      // Manejar error (ej. movimiento no encontrado)
      console.error(
        `Error cargando detalle del movimiento ${movementId}:`,
        error.message,
      );
      return null;
    }

    return (data as MovementDetail) ?? null;
  } catch (e) {
    console.error("Excepción en fetchMovementDetail:", e);
    return null;
  }
}
