// actions/reports.ts
"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function getMonthlyReportRPC(
  companyId: string,
  fromDate: string,
  toDate: string,
) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc("get_revenue_report_by_sede", {
    p_company_id: companyId,
    p_from_date: fromDate,
    p_to_date: toDate,
  });

  if (error) {
    console.error("❌ Error en RPC:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getOperationalReportRPC(
  companyId: string,
  fromDate: string,
  toDate: string,
) {
  const supabase = createClientComponentClient();

  // DEBUG: Verifica en tu terminal de VS Code que los valores sean correctos
  console.log("🚀 Llamando RPC con:", { companyId, fromDate, toDate });

  const { data, error } = await supabase.rpc("get_operational_gateway_report", {
    p_company_id: companyId,
    p_from_date: fromDate, // Asegúrate que venga como "2024-03-01"
    p_to_date: toDate,
  });

  if (error) {
    // Esto te dirá exactamente qué campo está fallando (ej: column "xxx" does not exist)
    console.error("❌ Error Detallado RPC:", error);
    throw new Error(`Error en Base de Datos: ${error.message}`);
  }

  return data || [];
}
