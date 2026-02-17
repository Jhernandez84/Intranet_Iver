"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ExcelRow {
  date: string;
  branch_code: string;
  account_external_id: string;
  amount: number;
  description: string;
  type: "Ingreso" | "Egreso" | "Traspaso";
}

export default function ExcelUploader({ companyId }: { companyId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClientComponentClient();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as ExcelRow[];

        await uploadToSupabase(data);
      } catch (error) {
        console.error("Error procesando Excel:", error);
        alert("Error al leer el archivo. Revisa el formato.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const uploadToSupabase = async (rows: ExcelRow[]) => {
    // 1. Traemos los maestros para mapear códigos -> IDs
    const { data: branches } = await supabase
      .from("branches")
      .select("id, internal_code")
      .eq("company_id", companyId);

    const { data: accounts } = await supabase
      .from("account_settings")
      .select("id, external_identifier")
      .eq("company_id", companyId);

    // 2. Preparamos el insert
    const insertData = rows.map((row) => {
      const branch = branches?.find(
        (b) => b.internal_code === String(row.branch_code),
      );
      const account = accounts?.find(
        (a) => a.external_identifier === String(row.account_external_id),
      );

      return {
        company_id: companyId,
        branch_id: branch?.id,
        account_id: account?.id,
        transaction_date: row.date,
        amount: row.amount,
        description: row.description,
        flow_type: row.type === "Ingreso" ? "Inflow" : "Outflow",
        data_source: "Excel",
      };
    });

    // 3. Ejecutamos la carga
    const { error } = await supabase.from("bank_movements").insert(insertData);

    if (error) {
      alert("Error al subir a la base de datos: " + error.message);
    } else {
      alert(`¡Éxito! Se cargaron ${insertData.length} movimientos.`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800/50">
      <svg
        className="mb-4 h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> */}
      </svg>

      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Haz clic para cargar</span> o arrastra
        tu archivo Excel
      </p>
      <p className="mb-4 text-xs text-gray-400">
        Columnas requeridas: date, branch_code, account_external_id, amount,
        description, type
      </p>

      <input
        type="file"
        accept=".xlsx, .xls"
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
        onChange={handleFile}
        disabled={isUploading}
      />

      {isUploading && (
        <div className="mt-4 flex animate-pulse items-center text-sm font-bold text-blue-500">
          Procesando carga masiva...
        </div>
      )}
    </div>
  );
}
