import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Sustituye con tus variables de entorno o cliente configurado
const supabase = createClientComponentClient();

// Interfaz estricta para la respuesta del RPC
export interface GatewayReportRow {
  periodo: string;
  nombre_sede: string;
  provider_name: string;
  setting_type: string;
  total_bruto: number;
  total_comision: number;
  total_neto: number;
  cantidad_transacciones: number;
}

interface ReportParams {
  p_fecha_desde: string;
  p_fecha_hasta: string;
  p_sede_id?: string | null;
  p_company_id?: string | null;
}

export async function fetchGatewayReport(
  params: ReportParams,
): Promise<GatewayReportRow[]> {
  console.log("Enviando parámetros al RPC:", params); // DEBUG 1

  const { data, error } = await supabase.rpc(
    "get_gateway_report_by_filters",
    params,
  );

  if (error) {
    console.error("Error detallado de Supabase:", error); // DEBUG 2
    throw new Error(error.message);
  }

  console.log("Data recibida del RPC:", data); // DEBUG 3

  if (!data || data.length === 0) {
    console.warn(
      "El RPC no devolvió ninguna fila. Revisa si los filtros coinciden con los datos en la DB.",
    );
  }

  return data as GatewayReportRow[];
}
