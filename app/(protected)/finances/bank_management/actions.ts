"use client";

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

// Interfaces para evitar el 'any'
interface TuuApiTransaction {
  amount: number;
  paymentDataTime: string;
  posSerialNumber?: string;
  saleId?: number;
  idVentaWebpay?: string;
  id?: string | number;
  extraData?: {
    amountCommission?: number;
    amountWithoutCommission?: number;
  };
  [key: string]: unknown; // Permite campos adicionales sin 'any'
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

      // --- BLOQUE DE INSPECCIÓN DE DATOS ---
      if (reports.length > 0 && currentPage === 1) {
        console.log("🔍 Analizando estructura de Haulmer (Página 1):");

        // Mapeamos las llaves del primer registro para ver sus tipos reales
        const analysis = Object.keys(reports[0]).map((key) => ({
          Campo: key,
          Valor: (reports[0] as Record<string, unknown>)[key],
          Tipo: typeof (reports[0] as Record<string, unknown>)[key],
        }));

        console.table(analysis);

        // Alerta específica para registros Webpay
        const hasWebpay = reports.some((r) => r.idVentaWebpay);
        const hasPOS = reports.some((r) => r.posSerialNumber);
        console.log(
          `📊 Resumen: Contiene registros POS: ${hasPOS} | Webpay: ${hasWebpay}`,
        );
      }
      // -------------------------------------

      allTransactions = [...allTransactions, ...reports];
      totalPages = result.content.totalPages;
      currentPage++;

      if (currentPage <= totalPages)
        await new Promise((res) => setTimeout(res, 6500));
    }

    const formattedData = allTransactions.map((tx) => ({
      company_id: companyId,
      // Si no hay serie de POS, asumimos que fue una transacción Webpay (Online)
      terminal_id: String(tx.posSerialNumber || "ONLINE-WEBPAY"),
      provider_name: "TUU",
      // Lógica de ID robusta para evitar nulos en el upsert
      external_tx_id: String(
        tx.idVentaWebpay || tx.saleId || tx.id || `GEN-${Math.random()}`,
      ),
      gross_amount: Number(tx.amount || 0),
      fee_amount: Number(tx.extraData?.amountCommission || 0),
      net_amount: Number(tx.extraData?.amountWithoutCommission || tx.amount),
      transaction_date: tx.paymentDataTime,
      transaction_day: tx.paymentDataTime.split("T")[0],
      status: "PENDING",
      metadata: tx as unknown as Record<string, unknown>,
    }));

    const { error } = await supabase
      .from("bank_payment_gateway_details")
      .upsert(formattedData, { onConflict: "external_tx_id" });

    if (error) throw error;

    return { success: true, count: formattedData.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error en syncTuuDataAction:", msg);
    return { success: false, error: msg };
  }
}

export async function uploadBankMovements(
  companyId: string,
  rows: BankMovementRow[],
  //bankAccountId: string | 'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', // Recomiendo pasar este ID por parámetro
) {
  const supabase = createClientComponentClient();

  const dataToInsert = rows.map((row) => {
    // 1. Lógica de Signos: Si es CARGO o CARGOS, el monto es negativo
    // 1. Normalizamos a mayúsculas y quitamos espacios en blanco
    const tipoStr = String(row.tipo).toUpperCase();

    // 2. Definimos los posibles indicadores de una salida de dinero (Gasto)
    // Agregamos 'C' para cubrir tu caso actual
    const indicadoresCargo = ["CARGO", "C", "DEBITO", "DB", "EGRESO"];
    const isCargo = indicadoresCargo.includes(tipoStr);
    const amountFinal = isCargo
      ? Math.abs(Number(row.monto)) * -1
      : Math.abs(Number(row.monto));

    // 2. Formateo de Fecha
    const movementDate = parseChileanDate(row.fecha);
    const dateIso = movementDate.toISOString();

    // 3. Lógica de Provider Slug (Categorización)
    const descUpper = String(row.descripcion).toUpperCase();
    let providerSlug = "Transferencia"; // Default

    if (descUpper.includes("GETNET")) {
      providerSlug = "GETNET";
    } else if (descUpper.includes("HAULMER")) {
      providerSlug = "TUU";
    }

    return {
      company_id: companyId,
      bank_account_id: "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5", //bankAccountId,
      amount: amountFinal,
      description: row.descripcion,
      movement_date: dateIso,
      // NUEVO: Sincronizamos operational_date con la fecha de movimiento
      operational_date: dateIso,
      reconciliation_status: "PENDING",
      provider_slug: providerSlug,
    };
  });

  const { error } = await supabase.from("bank_movements").insert(dataToInsert);

  if (error) {
    console.error("Error en insert de bank_movements:", error.message);
    throw new Error(error.message);
  }

  return {
    success: true,
    count: dataToInsert.length,
    message: "Carga de cartola completada con éxito.",
  };
}

// --- INTERFACES ADICIONALES PARA CONCILIACIÓN ---

interface DbBankMovement {
  id: string;
  amount: number;
  provider_slug: string | null;
  operational_date: string | null;
  movement_date: string; // Añadida
  reconciliation_status: string;
  bank_account_id: string;
}

interface DbGatewayDetail {
  id: string;
  provider_name: string;
  net_amount: number;
  transaction_day: string;
  bank_movement_id: string | null;
}

interface DbFinanceRecord {
  id: string;
  monto: number;
  tipo: "Ingreso" | "Egreso" | "Traspaso";
  fecha: string;
  current_account_id: string;
}

export async function reconcileByDateRange(
  companyId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = createClientComponentClient();

  console.log("--- INICIANDO PROCESO ---", { startDate, endDate });

  try {
    // 1. Obtener movimientos bancarios pendientes (Abonos y Cargos)
    const { data: bankMovements, error: bankError } = await supabase
      .from("bank_movements")
      .select(
        "id, amount, provider_slug, operational_date,movement_date, reconciliation_status, bank_account_id",
      )
      .eq("company_id", companyId)
      .neq("reconciliation_status", "RECONCILED")
      .gte("operational_date", startDate)
      .lte("operational_date", endDate);

    if (bankError) throw bankError;

    // 2. Traer registros de Finanzas tipo Transferencia no conciliados
    // Ampliamos el rango de búsqueda de finanzas un poco para captar desfases de fechas
    const { data: financeRecords, error: finError } = await supabase
      .from("finanzas")
      .select("id, monto, tipo, fecha, current_account_id")
      .eq("company_id", companyId)
      .eq("metodo_pago", "Transferencia")
      .is("reconciliation_id", null);

    if (finError) throw finError;

    // 3. Traer detalles de Gateway (Tuu/GetNet) con look-back de 3 días
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
    const finances = (financeRecords as DbFinanceRecord[]) || [];
    const details = (gatewayDetails as DbGatewayDetail[]) || [];

    for (const movement of movements) {
      const bankAmount = Number(movement.amount);
      const isAbono = bankAmount > 0;
      const opDate = new Date(
        movement.operational_date.substring(0, 10) + "T12:00:00",
      );

      // --- CASO 1: PASARELAS (GETNET / TUU) ---
      if (
        movement.provider_slug === "GETNET" ||
        movement.provider_slug === "TUU"
      ) {
        let finalDayDetails: DbGatewayDetail[] = [];
        let gatewayMatchFound = false;

        for (let lookback = 0; lookback <= 3; lookback++) {
          const currentDetails = details.filter((d) => {
            if (d.provider_name !== movement.provider_slug) return false;
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
            Math.abs(totalGatewayNet - Math.round(bankAmount)) < 5
          ) {
            finalDayDetails = currentDetails;
            gatewayMatchFound = true;
            break;
          }
        }

        if (gatewayMatchFound) {
          // Registro de conciliación
          await supabase.from("bank_reconciliations").insert({
            company_id: companyId,
            bank_movement_id: movement.id,
            status: "SUCCESS",
            reconciled_at: new Date().toISOString(),
            notes: `Auto-match ${movement.provider_slug}: ${finalDayDetails.length} tx.`,
          });

          // Marcar detalles y movimiento
          const detailIds = finalDayDetails.map((d) => d.id);
          await supabase
            .from("bank_payment_gateway_details")
            .update({ bank_movement_id: movement.id, status: "RECONCILED" })
            .in("id", detailIds);

          await supabase
            .from("bank_movements")
            .update({ reconciliation_status: "RECONCILED" })
            .eq("id", movement.id);

          matchesCount++;
          continue; // Pasa al siguiente movimiento
        }
      }

      // --- CASO 2: FINANZAS MANUALES (TRANSFERENCIAS) ---
      const matchFinance = finances.find((f) => {
        // 1. MONTO: Normalización total
        const montoBanco = Math.round(Math.abs(Number(movement.amount)));
        const montoFinanzas = Math.round(Math.abs(Number(f.monto)));
        const mismoMonto = montoBanco === montoFinanzas;

        // 2. CUENTA: Comparación de strings
        const mismaCuenta =
          String(f.current_account_id) === String(movement.bank_account_id);

        // 3. FECHA: Comparación de Strings (YYYY-MM-DD)
        // Evitamos 'new Date()' para la comparación de igualdad simple
        const dateStrBanco = (
          movement.operational_date || movement.movement_date
        ).substring(0, 10);
        const dateStrFinanzas = f.fecha.substring(0, 10);

        // Para el margen de 2 días, usamos un cálculo de tiempo simplificado
        const d1 = new Date(`${dateStrBanco}T12:00:00Z`);
        const d2 = new Date(`${dateStrFinanzas}T12:00:00Z`);
        const diffDays =
          Math.abs(d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
        const fechaValida = diffDays <= 2;

        // 4. COHERENCIA: Signo vs Tipo
        const bankAmountNum = Number(movement.amount);
        const esCoherente =
          (bankAmountNum < 0 && f.tipo === "Egreso") ||
          (bankAmountNum > 0 && f.tipo === "Ingreso");

        // --- DEBUG LOG ---
        // Si los montos calzan pero no concilia, esto te dirá por qué en la consola:
        if (mismoMonto && mismaCuenta) {
          console.log(`Candidato encontrado para ${montoBanco}:`, {
            mismoMonto,
            mismaCuenta,
            fechaValida,
            esCoherente,
            detalle: `Banco: ${dateStrBanco} (${bankAmountNum}) vs Finanzas: ${dateStrFinanzas} (${f.tipo})`,
          });
        }

        return mismoMonto && mismaCuenta && fechaValida && esCoherente;
      });

      if (matchFinance) {
        // A. Auditoría de Conciliación
        const { data: reconRec, error: reconErr } = await supabase
          .from("bank_reconciliations")
          .insert({
            company_id: companyId,
            bank_movement_id: movement.id,
            ledger_transaction_id: matchFinance.id, // Referencia cruzada
            status: "SUCCESS",
            reconciled_at: new Date().toISOString(),
            notes: `Auto-match Manual: ${matchFinance.tipo} detectado (${bankAmount < 0 ? "Cargo" : "Abono"}).`,
          })
          .select()
          .single();

        if (!reconErr && reconRec) {
          // B. Marcamos el registro administrativo con el ID de la conciliación
          await supabase
            .from("finanzas")
            .update({ reconciliation_id: reconRec.id })
            .eq("id", matchFinance.id);

          // C. Marcamos el registro bancario como RECONCILED
          await supabase
            .from("bank_movements")
            .update({ reconciliation_status: "RECONCILED" })
            .eq("id", movement.id);

          matchesCount++;
        }
      }
    }

    return {
      success: true,
      matches: matchesCount,
      message: `Proceso terminado. Se conciliaron ${matchesCount} movimientos en total.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: msg };
  }
}
