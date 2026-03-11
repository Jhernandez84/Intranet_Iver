"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  fastUploadGetnet,
  fastUploadTuu,
  uploadBankMovements,
} from "../bank_management/actions";

interface ExcelUploaderProps {
  companyId: string;
}

// --- INTERFACES DE EXCEL ---

interface TuuExcelRow {
  "Serial POS / Web"?: string | number;
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
  [key: string]: string | number | boolean | undefined | null; // Para el rest operator (...row)
}

interface GetnetExcelRow {
  TERMINAL: string | number;
  "ID TRANSACCIÓN": string | number;
  "VALOR VENTA": number;
  COMISIÓN: number;
  "MONTO ABONO": number;
  "FECHA VENTA": string | number;
  CUOTAS: number;
  MARCA: string;
}

interface BankExcelRow {
  MONTO: number;
  "[DESCRIPCIÓN MOVIMIENTO]": string;
  "DESCRIPCIÓN MOVIMIENTO"?: string;
  FECHA: string | number;
  SALDO: number;
  "[N° DOCUMENTO]": string | number;
  "N° DOCUMENTO"?: string | number;
  SUCURSAL: string;
  "CARGO/ABONO": string;
}

export default function ExcelUploader({ companyId }: ExcelUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const processFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "GETNET" | "BANK" | "TUU",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus({ message: `Procesando archivo de ${type}...`, isError: false });

    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("No se pudo leer el contenido del archivo");

        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: false,
          raw: true,
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        if (type === "TUU") {
          // CORREGIDO: Eliminamos <any>
          const jsonData = XLSX.utils.sheet_to_json<TuuExcelRow>(worksheet);

          const formattedRows = jsonData.map((row) => ({
            "Serial POS / Web": String(row["Serial POS / Web"] || ""),
            "Número único": String(row["Número único"] || ""),
            "Tipo venta": String(row["Tipo venta"] || ""),
            "Fecha transacción": row["Fecha transacción"],
            "Tipo transacción": String(row["Tipo transacción"] || ""),
            "Método de pago": String(row["Método de pago"] || ""),
            "Monto transacción": Number(row["Monto transacción"] || 0),
            "Total comisión": Number(row["Total comisión"] || 0),
            "Monto Neto": Number(row["Monto pagado acumulado"] || 0),
            "Número de cuotas": Number(row["Número de cuotas"] || 0),
            "Código de autorización": String(
              row["Código de autorización"] || "",
            ),
            ...row,
          }));

          const res = await fastUploadTuu(companyId, formattedRows);
          setStatus({
            message: `Éxito: ${res.count} registros de Tuu cargados.`,
            isError: false,
          });
        } else if (type === "GETNET") {
          const jsonData = XLSX.utils.sheet_to_json<GetnetExcelRow>(worksheet);
          const formattedRows = jsonData.map((row) => ({
            terminal: String(row["TERMINAL"] || ""),
            id_transaccion: String(row["ID TRANSACCIÓN"] || ""),
            valor_venta: Number(row["VALOR VENTA"] || 0),
            comision: Number(row["COMISIÓN"] || 0),
            monto_abono: Number(row["MONTO ABONO"] || 0),
            fecha_venta: row["FECHA VENTA"],
            cuotas: Number(row["CUOTAS"] || 0),
            marca: String(row["MARCA"] || "GENERICA"),
          }));
          const res = await fastUploadGetnet(companyId, formattedRows);
          setStatus({
            message: `Éxito: ${res.count} registros de Getnet cargados.`,
            isError: false,
          });
        } else {
          const jsonData = XLSX.utils.sheet_to_json<BankExcelRow>(worksheet);
          const formattedRows = jsonData.map((row) => ({
            monto: Number(row["MONTO"] || 0),
            descripcion: String(
              row["[DESCRIPCIÓN MOVIMIENTO]"] ||
                row["DESCRIPCIÓN MOVIMIENTO"] ||
                "",
            ),
            fecha: row["FECHA"],
            saldo: Number(row["SALDO"] || 0),
            documento: String(
              row["[N° DOCUMENTO]"] || row["N° DOCUMENTO"] || "",
            ),
            sucursal: String(row["SUCURSAL"] || ""),
            tipo: String(row["CARGO/ABONO"] || ""),
          }));
          const res = await uploadBankMovements(companyId, formattedRows);
          setStatus({
            message: `Éxito: ${res.count} movimientos bancarios cargados.`,
            isError: false,
          });
        }
      } catch (err: unknown) {
        console.error(err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setStatus({
          message: `Error: ${errorMessage}. Revisa el formato.`,
          isError: true,
        });
      } finally {
        setLoading(false);
        if (event.target) event.target.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card Tuu */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 font-bold text-purple-600">
            T
          </div>
          <h3 className="text-sm font-bold text-gray-800">Reporte Tuu.cl</h3>
          <p className="mt-1 text-[10px] text-gray-400">
            Soporta POS y Pago Online
          </p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => processFile(e, "TUU")}
            disabled={loading}
            className="mt-4 block w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>

        {/* Card Getnet */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 font-bold text-orange-600">
            G
          </div>
          <h3 className="text-sm font-bold text-gray-800">Reporte Getnet</h3>
          <p className="mt-1 text-[10px] text-gray-400">
            Solo transacciones POS
          </p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => processFile(e, "GETNET")}
            disabled={loading}
            className="mt-4 block w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-orange-700 hover:file:bg-orange-100"
          />
        </div>

        {/* Card Banco */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-600">
            B
          </div>
          <h3 className="text-sm font-bold text-gray-800">Cartola Bancaria</h3>
          <p className="mt-1 text-[10px] text-gray-400">
            Archivo Excel Santander
          </p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => processFile(e, "BANK")}
            disabled={loading}
            className="mt-4 block w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      {status && (
        <div
          className={`rounded-lg p-4 text-sm font-medium ${status.isError ? "border border-red-200 bg-red-50 text-red-800" : "border border-green-200 bg-green-50 text-green-800"}`}
        >
          {status.message}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          Procesando archivos y sincronizando con base de datos...
        </div>
      )}
    </div>
  );
}
