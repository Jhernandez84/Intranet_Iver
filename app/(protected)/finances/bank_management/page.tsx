"use client";

import { useState } from "react";
import { getMonthlyReportRPC, getOperationalReportRPC } from "./reports";
import { useUser } from "../../../context/UserProvider";

// --- INTERFACES PARA ESLINT (NO ANY) ---

interface MonthlyReportRow {
  sede: string;
  categoria: string;
  total: number;
  count: number;
}

interface MonthlyRPCRaw {
  sede_nombre: string;
  categoria: string;
  total_monto: number;
  cantidad_transacciones: number;
}

interface OperationalReportRow {
  mes: string;
  sede_nombre: string;
  pasarela: string;
  fuente: string;
  venta_bruta_mensual: number;
  comisiones_pagadas: number;
  neto_a_recibir: number;
}

export default function ReportPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Estados tipados correctamente
  const [data, setData] = useState<MonthlyReportRow[]>([]);
  const [opData, setOpData] = useState<OperationalReportRow[]>([]);

  const { user } = useUser();

  const handleGenerateReport = async (): Promise<void> => {
    if (!fromDate || !toDate || !user?.company_id) return;

    setLoading(true);
    try {
      // 1. Reporte de Recaudación (Banco)
      const resBank: MonthlyRPCRaw[] = await getMonthlyReportRPC(
        user.company_id,
        fromDate,
        toDate,
      );

      const formattedBank: MonthlyReportRow[] = resBank.map((item) => ({
        sede: item.sede_nombre,
        categoria: item.categoria,
        total: item.total_monto,
        count: item.cantidad_transacciones,
      }));

      setData(formattedBank);

      // 2. Reporte Operativo (Pasarelas)
      const resOp: OperationalReportRow[] = await getOperationalReportRPC(
        user.company_id,
        fromDate,
        toDate,
      );

      setOpData(resOp);
    } catch (error) {
      console.error("Error al generar reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Panel de Reportes Financieros
        </h1>
        <p className="text-sm text-gray-500">Empresa ID: {user?.company_id}</p>
      </header>

      {/* --- FILTROS --- */}
      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium tracking-wider text-gray-500 uppercase">
            Fecha Inicio
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium tracking-wider text-gray-500 uppercase">
            Fecha Fin
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-8 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Procesando..." : "Consultar Datos"}
        </button>
      </div>

      {/* --- RECAUDACIÓN REAL (BANCO) --- */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Recaudación Real (Abonos en Banco)
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">Sede</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Transacciones
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Monto Neto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item, idx) => (
                  <tr key={`bank-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.sede}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          item.categoria.includes("DIEZMO")
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{item.count}</td>
                    <td className="px-6 py-4 text-right font-bold">
                      {currencyFormatter.format(item.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Sin datos para el periodo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- VENTAS OPERATIVAS (PASARELAS) --- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Ventas Operativas (Detalle de Pasarelas)
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4">Mes / Sede</th>
                <th className="px-6 py-4">Fuente / Pasarela</th>
                <th className="px-6 py-4 text-right">Monto Bruto</th>
                <th className="px-6 py-4 text-right">Comisiones</th>
                <th className="px-6 py-4 text-right">Neto Esperado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {opData.length > 0 ? (
                opData.map((item, idx) => (
                  <tr key={`op-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {item.sede_nombre}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        {new Date(item.mes).toLocaleDateString("es-CL", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      {item.pasarela} — {item.fuente}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currencyFormatter.format(item.venta_bruta_mensual)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-500">
                      -{currencyFormatter.format(item.comisiones_pagadas)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {currencyFormatter.format(item.neto_a_recibir)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Sin movimientos operativos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
