import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function getSyncStatus(companyId: string) {
  const supabase = createClientComponentClient();

  // 1. Máximo de bank_movements (General)
  const { data: maxBankMov } = await supabase
    .from("bank_movements")
    .select("movement_date")
    .eq("company_id", companyId)
    .order("movement_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. Máximo de bank_payment_gateway_details por Proveedor
  const getProviderMax = async (provider: "TUU" | "GETNET") => {
    const { data } = await supabase
      .from("bank_payment_gateway_details")
      .select("transaction_date")
      .eq("company_id", companyId)
      .eq("provider_name", provider)
      .order("transaction_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.transaction_date || null;
  };

  // 3. Últimas conciliaciones exitosas
  const { data: lastReconciledBank } = await supabase
    .from("bank_movements")
    .select("movement_date")
    .eq("company_id", companyId)
    .eq("reconciliation_status", "RECONCILED")
    .order("movement_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: lastReconciledGateway } = await supabase
    .from("bank_payment_gateway_details")
    .select("transaction_date")
    .eq("company_id", companyId)
    .eq("status", "RECONCILED")
    .order("transaction_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  // --- NUEVA LÓGICA: Verificar si hay pendientes ---

  // Contar movimientos bancarios pendientes (solo abonos, asumiendo amount > 0)
  const { count: pendingBankCount } = await supabase
    .from("bank_movements")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .neq("reconciliation_status", "RECONCILED")
    .gt("amount", 0); // Omitimos cargos si tu lógica de conciliación solo cruza abonos

  // Contar detalles de pasarela pendientes
  const { count: pendingGatewayCount } = await supabase
    .from("bank_payment_gateway_details")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .neq("status", "RECONCILED");

  const bankIsDone = (pendingBankCount || 0) === 0;
  const gatewayIsDone = (pendingGatewayCount || 0) === 0;

  return {
    last_bank_movement: maxBankMov?.movement_date || null,
    last_tuu_sync: await getProviderMax("TUU"),
    last_getnet_sync: await getProviderMax("GETNET"),
    last_reconciled_date: {
      bank: lastReconciledBank?.movement_date || null,
      gateway: lastReconciledGateway?.transaction_date || null,
    },
    // Indicadores de estado completo
    is_fully_reconciled: bankIsDone && gatewayIsDone,
    status_counts: {
      pending_bank: pendingBankCount || 0,
      pending_gateway: pendingGatewayCount || 0,
    },
  };
}
