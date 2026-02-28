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

  // 3. Última conciliación exitosa (en bank_movements)
  const { data: lastReconciledBank } = await supabase
    .from("bank_movements")
    .select("movement_date")
    .eq("company_id", companyId)
    .eq("reconciliation_status", "RECONCILED")
    .order("movement_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 4. Última conciliación exitosa (en gateway_details)
  const { data: lastReconciledGateway } = await supabase
    .from("bank_payment_gateway_details")
    .select("transaction_date")
    .eq("company_id", companyId)
    .eq("status", "RECONCILED")
    .order("transaction_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    last_bank_movement: maxBankMov?.movement_date || null,
    last_tuu_sync: await getProviderMax("TUU"),
    last_getnet_sync: await getProviderMax("GETNET"),
    last_reconciled_date: {
      bank: lastReconciledBank?.movement_date || null,
      gateway: lastReconciledGateway?.transaction_date || null,
    },
  };
}
