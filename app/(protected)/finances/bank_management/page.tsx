"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { fastUploadGetnet, uploadBankMovements } from "./actions";
import { useUser } from "../../../context/UserProvider";

// --- Interfaces para Tipado Estricto ---
interface GetnetExcelRow {
  TERMINAL: string | number;
  "ID TRANSACCIÓN": string | number;
  "VALOR VENTA": number;
  COMISIÓN: number;
  "MONTO ABONO": number;
  "FECHA VENTA": string | Date;
  CUOTAS: number;
  MARCA: string;
}

interface BankExcelRow {
  MONTO: number;
  "[DESCRIPCIÓN MOVIMIENTO]": string;
  "DESCRIPCIÓN MOVIMIENTO"?: string;
  FECHA: string | Date;
  SALDO: number;
  "[N° DOCUMENTO]": string | number;
  "N° DOCUMENTO"?: string | number;
  SUCURSAL: string;
  "CARGO/ABONO": string;
}

type UploadType = "GETNET" | "BANK";

export default function BankManagementPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const { user } = useUser();
  // ID de la empresa (Viene de tu Auth/Session Context)
  const currentCompanyId = user?.company_id;

  const processFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: UploadType,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus({ message: `Procesando archivo de ${type}...`, isError: false });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: false,
          raw: true,
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (type === "GETNET") {
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

          const res = await fastUploadGetnet(currentCompanyId, formattedRows);
          setStatus({
            message: `Éxito: ${res.count} registros de Getnet cargados.`,
            isError: false,
          });
        } else if (type === "BANK") {
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

          const res = await uploadBankMovements(
            currentCompanyId,
            formattedRows,
          );
          setStatus({
            message: `Éxito: ${res.count} movimientos bancarios cargados.`,
            isError: false,
          });
        }
      } catch (err) {
        console.error(err);
        setStatus({
          message:
            "Error al procesar el archivo. Revisa el formato y las columnas.",
          isError: true,
        });
      } finally {
        setLoading(false);
        // Limpiar el input para permitir cargar el mismo archivo si es necesario
        event.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Módulo de Conciliación Bancaria
        </h1>
        <p className="text-gray-500">
          Carga tus reportes de proveedores y cartolas bancarias.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card Getnet */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
            <span className="font-bold text-orange-600">G</span>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Reporte Getnet (POS)</h2>
          <p className="mb-6 text-sm text-gray-500">
            Detalle de ventas por terminal y comisiones.
          </p>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => processFile(e, "GETNET")}
            disabled={loading}
            className="block w-full cursor-pointer text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-orange-700 hover:file:bg-orange-100"
          />
        </div>

        {/* Card Banco */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <span className="font-bold text-blue-600">B</span>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Cartola Bancaria</h2>
          <p className="mb-6 text-sm text-gray-500">
            Movimientos de la cuenta corriente (Totales).
          </p>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => processFile(e, "BANK")}
            disabled={loading}
            className="block w-full cursor-pointer text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      {/* Feedback Status */}
      {status && (
        <div
          className={`mt-8 flex items-center rounded-lg p-4 ${status.isError ? "border border-red-200 bg-red-50 text-red-800" : "border border-green-200 bg-green-50 text-green-800"}`}
        >
          <span className="mr-2">{status.isError ? "⚠️" : "✅"}</span>
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Procesando información...</span>
        </div>
      )}
    </div>
  );
}
