"use server";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// --- INTERFACES DE TIPADO ---

interface GetnetRow {
  terminal: string | number;
  fecha_venta: string | number | Date;
  id_transaccion: string | number;
  valor_venta: number;
  comision: number;
  monto_abono: number;
  cuotas?: number;
  marca?: string;
}

interface TuuTransaction {
  paymentDataTime: string;
  posSerialNumber: string;
  saleId: string | number;
  amount: number;
  typeTransaction: string;
  brandCard: string;
  extraData?: {
    amountCommission?: number;
    amountWithoutCommission?: number;
  };
}

interface BankMovementRow {
  descripcion: string;
  tipo: string;
  monto: number;
  fecha: string | number | Date;
  saldo?: number;
  documento?: string;
  sucursal?: string;
}

// --- FUNCIONES ---

export async function getUnreconciledCount(
  companyId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = createClientComponentClient();

  const { count, error } = await supabase
    .from("bank_movements")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("movement_date", startDate)
    .lte("movement_date", endDate)
    .gt("amount", 0)
    .is("id", null);

  if (error) return 0;
  return count || 0;
}

function parseChileanDate(dateValue: unknown): Date {
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }

  if (typeof dateValue === "string") {
    const matches = dateValue.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const day = parseInt(matches[0], 10);
      const month = parseInt(matches[1], 10) - 1;
      const year = parseInt(matches[2], 10);
      const hour = matches[3] ? parseInt(matches[3], 10) : 0;
      const minute = matches[4] ? parseInt(matches[4], 10) : 0;
      const second = matches[5] ? parseInt(matches[5], 10) : 0;

      const d = new Date(year, month, day, hour, minute, second);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (typeof dateValue === "number") {
    return new Date((dateValue - 25569) * 86400 * 1000);
  }

  return new Date();
}

export async function fastUploadGetnet(companyId: string, rows: GetnetRow[]) {
  const supabase = createClientComponentClient();

  const { data: settings } = await supabase
    .from("bank_account_settings")
    .select("external_identifier, sede_id, bank_account_id, id")
    .eq("company_id", companyId);

  const dataToInsert = rows.map((row) => {
    const config = settings?.find(
      (s) => s.external_identifier === String(row.terminal),
    );

    const fullDate = parseChileanDate(row.fecha_venta);
    const year = fullDate.getFullYear();
    const month = String(fullDate.getMonth() + 1).padStart(2, "0");
    const day = String(fullDate.getDate()).padStart(2, "0");
    const hours = String(fullDate.getHours()).padStart(2, "0");
    const minutes = String(fullDate.getMinutes()).padStart(2, "0");
    const seconds = String(fullDate.getSeconds()).padStart(2, "0");

    return {
      company_id: companyId,
      terminal_id: String(row.terminal || ""),
      sede_id: config?.sede_id || null,
      bank_account_id: config?.bank_account_id || null,
      setting_id: config?.id || null,
      provider_name: "GETNET",
      external_tx_id: String(row.id_transaccion || ""),
      gross_amount: Number(row.valor_venta || 0),
      fee_amount: Number(row.comision || 0),
      net_amount: Number(row.monto_abono || 0),
      transaction_date: fullDate.toISOString(),
      transaction_day: `${year}-${month}-${day}`,
      transaction_time: `${hours}:${minutes}:${seconds}`,
      status: "PENDING",
      metadata: {
        cuotas: row.cuotas,
        marca: row.marca,
      },
    };
  });

  const { error } = await supabase
    .from("bank_payment_gateway_details")
    .insert(dataToInsert);

  if (error) throw new Error(error.message);

  return { success: true, count: dataToInsert.length };
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function syncTuuDataAction(
  companyId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = createClientComponentClient();
  const TUU_API_URL =
    "https://integrations.payment.haulmer.com/Report/get-report";

  let currentPage = 1;
  let totalPages = 1;
  let allTransactions: TuuTransaction[] = [];

  try {
    while (currentPage <= totalPages) {
      const response = await fetch(TUU_API_URL, {
        method: "POST",
        headers: {
          "X-API-Key": process.env.TUU_API_KEY as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Filters: { StartDate: startDate, EndDate: endDate },
          page: Number(currentPage),
          pageSize: 20,
        }),
        cache: "no-store",
      });

      if (response.status === 429) throw new Error("Límite de API excedido.");

      const result = await response.json();
      totalPages = result.content.totalPages;
      allTransactions = [...allTransactions, ...(result.content.reports || [])];

      currentPage++;
      if (currentPage <= totalPages) await delay(6500);
    }

    const formattedData = allTransactions.map((tx) => {
      const fullDate = new Date(tx.paymentDataTime);
      const y = fullDate.getFullYear();
      const m = String(fullDate.getMonth() + 1).padStart(2, "0");
      const d = String(fullDate.getDate()).padStart(2, "0");
      const hh = String(fullDate.getHours()).padStart(2, "0");
      const mm = String(fullDate.getMinutes()).padStart(2, "0");
      const ss = String(fullDate.getSeconds()).padStart(2, "0");

      return {
        company_id: companyId,
        terminal_id: String(tx.posSerialNumber || "TUU_API"),
        provider_name: "TUU",
        external_tx_id: String(tx.saleId),
        gross_amount: Number(tx.amount),
        fee_amount: Number(tx.extraData?.amountCommission || 0),
        net_amount: Number(tx.extraData?.amountWithoutCommission || tx.amount),
        transaction_date: tx.paymentDataTime,
        transaction_day: `${y}-${m}-${d}`,
        transaction_time: `${hh}:${mm}:${ss}`,
        status: "PENDING",
        metadata: {
          pos_serial: tx.posSerialNumber,
          type: tx.typeTransaction,
          brand: tx.brandCard,
        },
      };
    });

    const uniqueData = Array.from(
      new Map(
        formattedData.map((item) => [item.external_tx_id, item]),
      ).values(),
    );

    const { error } = await supabase
      .from("bank_payment_gateway_details")
      .upsert(uniqueData, { onConflict: "external_tx_id" });

    if (error) throw error;

    return { success: true, count: uniqueData.length };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export async function uploadBankMovements(
  companyId: string,
  rows: BankMovementRow[],
) {
  const supabase = createClientComponentClient();

  const dataToInsert = rows.map((row) => {
    const description = String(row.descripcion || "");
    const isCargo = String(row.tipo).toUpperCase().includes("CARGO");
    const montoBase = Math.abs(Number(row.monto || 0));
    const movementDate = parseChileanDate(row.fecha);

    let providerSlug: "GETNET" | "TUU" | null = null;
    if (description.toUpperCase().includes("GETNET")) providerSlug = "GETNET";
    if (description.toUpperCase().includes("HAULMER SPA")) providerSlug = "TUU";

    let extractedDate: string | null = null;
    const dateMatch = description.match(/(\d{2})\/(\d{2})\/(\d{2,4})/);

    if (dateMatch) {
      const [_, day, month, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      extractedDate = `${fullYear}-${month}-${day}`;
    }

    let operationalDate = extractedDate;

    if (providerSlug === "TUU" && !operationalDate) {
      const opDateObj = new Date(movementDate);
      opDateObj.setDate(opDateObj.getDate() - 1);
      operationalDate = opDateObj.toISOString().split("T")[0];
    } else if (!operationalDate) {
      operationalDate = movementDate.toISOString().split("T")[0];
    }

    return {
      company_id: companyId,
      bank_account_id: "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
      sede_id: "a64548cc-7515-415b-9df5-1404f55e3fca",
      amount: isCargo ? montoBase * -1 : montoBase,
      description: description,
      movement_date: movementDate.toISOString(),
      operational_date: operationalDate,
      provider_slug: providerSlug,
      balance: Number(row.saldo || 0),
      banking_document_number: String(row.documento || ""),
      banking_branch_name: String(row.sucursal || ""),
      account_mov_type: isCargo ? "CARGO" : "ABONO",
      reconciliation_status: "PENDING",
    };
  });

  const { error } = await supabase.from("bank_movements").insert(dataToInsert);
  if (error) throw new Error(error.message);

  return { success: true, count: dataToInsert.length };
}

export async function reconcileByDateRange(
  companyId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = createClientComponentClient();

  try {
    const { data: bankMovements, error: bankError } = await supabase
      .from("bank_movements")
      .select("*")
      .eq("company_id", companyId)
      .in("provider_slug", ["GETNET", "TUU"])
      .neq("reconciliation_status", "RECONCILED")
      .gte("operational_date", startDate)
      .lte("operational_date", endDate);

    if (bankError) throw bankError;

    const { data: gatewayDetails, error: gatewayError } = await supabase
      .from("bank_payment_gateway_details")
      .select("*")
      .eq("company_id", companyId)
      .is("bank_movement_id", null)
      .gte("transaction_day", startDate)
      .lte("transaction_day", endDate);

    if (gatewayError) throw gatewayError;

    let matchesCount = 0;
    const movements = bankMovements || [];

    for (const movement of movements) {
      const provider = movement.provider_slug;
      const bankAmount = Math.round(parseFloat(String(movement.amount)));
      const opDate = movement.operational_date;

      const dayDetails = (gatewayDetails || []).filter((d) => {
        const sameDate =
          String(d.transaction_day).substring(0, 10) ===
          String(opDate).substring(0, 10);
        const sameProvider = d.provider_name === provider;
        return sameDate && sameProvider;
      });

      const totalGatewayNet = Math.round(
        dayDetails.reduce(
          (sum, d) => sum + parseFloat(String(d.net_amount)),
          0,
        ),
      );

      if (dayDetails.length > 0 && Math.abs(totalGatewayNet - bankAmount) < 1) {
        const { error: reconError } = await supabase
          .from("bank_reconciliations")
          .insert({
            company_id: companyId,
            bank_movement_id: movement.id,
            status: "SUCCESS",
            reconciled_at: new Date().toISOString(),
          });

        if (reconError) continue;

        const detailIds = dayDetails.map((d) => d.id);
        await supabase
          .from("bank_payment_gateway_details")
          .update({ bank_movement_id: movement.id, status: "RECONCILED" })
          .in("id", detailIds);

        await supabase
          .from("bank_movements")
          .update({ reconciliation_status: "RECONCILED" })
          .eq("id", movement.id);

        matchesCount++;
      }
    }

    return { success: true, matches: matchesCount };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
