"use server";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// --- INTERFACES DE TIPADO ESTRICTO ---

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

interface TuuExcelRow {
  "Serial POS / Web"?: string | number; // Permitimos number aquí para que no falle al leer el Excel
  "Número único"?: string | number;
  "Tipo venta"?: string;
  "Fecha transacción": string | number;
  "Tipo transacción"?: string;
  "Método de pago"?: string;
  "Monto transacción"?: number;
  "Total comisión"?: number;
  "Monto pagado acumulado"?: number;
  "Número de cuotas"?: number;
  "Código de autorización"?: string | number;
  [key: string]: string | number | boolean | undefined | null;
}

interface TuuApiResponse {
  content: {
    reports: TuuApiTransaction[];
    totalPages: number;
  };
}

interface TuuApiTransaction {
  paymentDataTime: string;
  posSerialNumber?: string;
  saleId?: string | number;
  idVentaWebpay?: string | number;
  id?: string | number;
  amount: number;
  typeTransaction?: string;
  brandCard?: string;
  pagoMetodo?: string;
  extraData?: {
    amountCommission?: number;
    amountWithoutCommission?: number;
  };
}

interface BankAccountSetting {
  id: string;
  external_identifier: string;
  sede_id: string | null;
  bank_account_id: string | null;
}

interface BankMovementRow {
  descripcion: string;
  tipo: string;
  monto: number;
  fecha: string | number | Date;
  saldo?: number;
  documento?: string | number;
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
    .is("reconciliation_status", "PENDING"); // Corregido: antes buscabas id null

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
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return new Date();
}

export async function fastUploadGetnet(companyId: string, rows: GetnetRow[]) {
  const supabase = createClientComponentClient();

  const { data: settings } = await supabase
    .from("bank_account_settings")
    .select("id, external_identifier, sede_id, bank_account_id")
    .eq("company_id", companyId);

  const dataToInsert = rows.map((row) => {
    const config = (settings as BankAccountSetting[] | null)?.find(
      (s) => s.external_identifier === String(row.terminal),
    );

    const fullDate = parseChileanDate(row.fecha_venta);

    return {
      company_id: companyId,
      terminal_id: String(row.terminal || ""),
      setting_id: config?.id || null,
      sede_id: config?.sede_id || null,
      bank_account_id: config?.bank_account_id || null,
      provider_name: "GETNET",
      external_tx_id: String(row.id_transaccion || ""),
      gross_amount: Number(row.valor_venta || 0),
      fee_amount: Number(row.comision || 0),
      net_amount: Number(row.monto_abono || 0),
      transaction_date: fullDate.toISOString(),
      transaction_day: fullDate.toISOString().split("T")[0],
      status: "PENDING",
      metadata: { cuotas: row.cuotas, marca: row.marca },
    };
  });

  const { error } = await supabase
    .from("bank_payment_gateway_details")
    .upsert(dataToInsert, { onConflict: "external_tx_id" });

  if (error) throw new Error(error.message);
  return { success: true, count: dataToInsert.length };
}

export async function fastUploadTuu(companyId: string, rows: TuuExcelRow[]) {
  const supabase = createClientComponentClient();

  const { data: settings } = await supabase
    .from("bank_account_settings")
    .select("id, external_identifier, sede_id, bank_account_id")
    .eq("company_id", companyId);

  const dataToInsert = rows.map((row) => {
    const terminalId = String(row["Serial POS / Web"] || "ONLINE-WEB");
    const config = (settings as BankAccountSetting[] | null)?.find(
      (s) => s.external_identifier === terminalId,
    );
    const fullDate = new Date(row["Fecha transacción"]);

    return {
      company_id: companyId,
      terminal_id: terminalId,
      setting_id: config?.id || null,
      sede_id: config?.sede_id || null,
      bank_account_id: config?.bank_account_id || null,
      provider_name: "TUU",
      external_tx_id: String(row["Número único"] || ""),
      gross_amount: Number(row["Monto transacción"] || 0),
      fee_amount: Number(row["Total comisión"] || 0),
      net_amount: Number(
        row["Monto pagado acumulado"] || row["Monto transacción"] || 0,
      ),
      transaction_date: fullDate.toISOString(),
      transaction_day: fullDate.toISOString().split("T")[0],
      status: "PENDING",
      metadata: { ...row },
    };
  });

  const { error } = await supabase
    .from("bank_payment_gateway_details")
    .upsert(dataToInsert, { onConflict: "external_tx_id" });

  if (error) throw new Error(error.message);
  return { success: true, count: dataToInsert.length };
}

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
  let allTransactions: TuuApiTransaction[] = [];

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
          page: currentPage,
          pageSize: 20,
        }),
      });

      if (!response.ok) throw new Error(`Error API: ${response.status}`);

      const result = (await response.json()) as TuuApiResponse;
      const reports = result.content.reports || [];
      allTransactions = [...allTransactions, ...reports];
      totalPages = result.content.totalPages;
      currentPage++;

      if (currentPage <= totalPages)
        await new Promise((res) => setTimeout(res, 6500));
    }

    const formattedData = allTransactions.map((tx) => ({
      company_id: companyId,
      terminal_id: String(tx.posSerialNumber || "ONLINE-WEB"),
      provider_name: "TUU",
      external_tx_id: String(
        tx.saleId || tx.idVentaWebpay || tx.id || Math.random(),
      ),
      gross_amount: Number(tx.amount || 0),
      fee_amount: Number(tx.extraData?.amountCommission || 0),
      net_amount: Number(tx.extraData?.amountWithoutCommission || tx.amount),
      transaction_date: tx.paymentDataTime,
      transaction_day: tx.paymentDataTime.split("T")[0],
      status: "PENDING",
      metadata: { ...tx },
    }));

    const { error } = await supabase
      .from("bank_payment_gateway_details")
      .upsert(formattedData, { onConflict: "external_tx_id" });
    if (error) throw error;

    return { success: true, count: formattedData.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

export async function uploadBankMovements(
  companyId: string,
  rows: BankMovementRow[],
) {
  const supabase = createClientComponentClient();
  const dataToInsert = rows.map((row) => {
    const isCargo = String(row.tipo).toUpperCase().includes("CARGO");
    const movementDate = parseChileanDate(row.fecha);
    return {
      company_id: companyId,
      bank_account_id: "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5", // Cambiar por ID real
      amount: isCargo ? Math.abs(row.monto) * -1 : Math.abs(row.monto),
      description: row.descripcion,
      movement_date: movementDate.toISOString(),
      reconciliation_status: "PENDING",
      provider_slug: row.descripcion.toUpperCase().includes("GETNET")
        ? "GETNET"
        : "TUU",
    };
  });

  const { error } = await supabase.from("bank_movements").insert(dataToInsert);
  if (error) throw new Error(error.message);
  return { success: true, count: dataToInsert.length };
}

// --- INTERFACES ADICIONALES PARA CONCILIACIÓN ---

interface DbBankMovement {
  id: string;
  amount: number;
  provider_slug: string;
  operational_date: string;
  reconciliation_status: string;
}

interface DbGatewayDetail {
  id: string;
  provider_name: string;
  net_amount: number;
  transaction_day: string;
  bank_movement_id: string | null;
}

export async function reconcileByDateRange(
  companyId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = createClientComponentClient();

  try {
    // 1. Obtener abonos bancarios pendientes
    const { data: bankMovements, error: bankError } = await supabase
      .from("bank_movements")
      .select(
        "id, amount, provider_slug, operational_date, reconciliation_status",
      )
      .eq("company_id", companyId)
      .in("provider_slug", ["GETNET", "TUU"])
      .neq("reconciliation_status", "RECONCILED")
      .gte("operational_date", startDate)
      .lte("operational_date", endDate);

    if (bankError) throw bankError;

    // 2. Traer detalles de ventas con margen de 3 días hacia atrás
    const extendedStartDate = new Date(startDate);
    extendedStartDate.setDate(extendedStartDate.getDate() - 3);
    const startStr = extendedStartDate.toISOString().split("T")[0];

    const { data: gatewayDetails, error: gatewayError } = await supabase
      .from("bank_payment_gateway_details")
      .select(
        "id, provider_name, net_amount, transaction_day, bank_movement_id",
      )
      .eq("company_id", companyId)
      .is("bank_movement_id", null)
      .gte("transaction_day", startStr)
      .lte("transaction_day", endDate);

    if (gatewayError) throw gatewayError;

    let matchesCount = 0;
    const movements = (bankMovements as DbBankMovement[]) || [];
    const details = (gatewayDetails as DbGatewayDetail[]) || [];

    for (const movement of movements) {
      const provider = movement.provider_slug;
      const bankAmount = Math.round(Number(movement.amount));
      const opDate = new Date(
        movement.operational_date.substring(0, 10) + "T12:00:00",
      );

      let finalDayDetails: DbGatewayDetail[] = [];
      let matchFound = false;

      // LÓGICA DE VENTANA DINÁMICA (LOOK-BACK)
      for (let lookback = 0; lookback <= 3; lookback++) {
        const currentDetails = details.filter((d) => {
          if (d.provider_name !== provider) return false;

          const txDate = new Date(
            d.transaction_day.substring(0, 10) + "T12:00:00",
          );
          const diffDays =
            (opDate.getTime() - txDate.getTime()) / (1000 * 3600 * 24);

          return diffDays >= 0 && diffDays <= lookback;
        });

        const totalGatewayNet = Math.round(
          currentDetails.reduce((sum, d) => sum + Number(d.net_amount), 0),
        );

        if (
          currentDetails.length > 0 &&
          Math.abs(totalGatewayNet - bankAmount) < 5
        ) {
          finalDayDetails = currentDetails;
          matchFound = true;
          break;
        }
      }

      if (matchFound) {
        // A. Auditoría
        await supabase.from("bank_reconciliations").insert({
          company_id: companyId,
          bank_movement_id: movement.id,
          status: "SUCCESS",
          reconciled_at: new Date().toISOString(),
          notes: `Auto-match ${provider}: ${finalDayDetails.length} transacciones.`,
        });

        // B. Marcar ventas
        const detailIds = finalDayDetails.map((d) => d.id);
        await supabase
          .from("bank_payment_gateway_details")
          .update({ bank_movement_id: movement.id, status: "RECONCILED" })
          .in("id", detailIds);

        // C. Marcar movimiento bancario
        await supabase
          .from("bank_movements")
          .update({ reconciliation_status: "RECONCILED" })
          .eq("id", movement.id);

        matchesCount++;
      }
    }

    return {
      success: true,
      matches: matchesCount,
      message: `Proceso terminado. Se conciliaron ${matchesCount} abonos.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: msg };
  }
}
