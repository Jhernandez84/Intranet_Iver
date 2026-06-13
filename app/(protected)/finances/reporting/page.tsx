"use client";

import { useState } from "react";
import { fetchGatewayReport, GatewayReportRow } from "../reports/queries";
import { useUser } from "../../../context/UserProvider";
import GatewayReportTable from "./tableFormat";

export default function ReportPage() {
  const [data, setData] = useState<GatewayReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();

  // 1. Estados para las fechas (inicializamos con el mes actual o vacío)
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const getReport = async () => {
    // Validación básica
    if (!fechaDesde || !fechaHasta) {
      alert("Por favor, selecciona ambas fechas");
      return;
    }

    setLoading(true);
    try {
      const results = await fetchGatewayReport({
        p_fecha_desde: fechaDesde,
        p_fecha_hasta: fechaHasta,
        p_sede_id: null,
        p_company_id: user?.company_id, // Asegúrate de tener acceso al objeto 'user'
      });
      setData(results);
    } catch (err) {
      console.error(err);
      alert("Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Filtros de Reporte
        </h2>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Selector Fecha Desde */}
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha Inicial
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Selector Fecha Hasta */}
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha Final
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Botón de Acción */}
          <button
            onClick={getReport}
            disabled={loading}
            className={`rounded-md px-6 py-2 font-semibold text-white shadow-sm transition-all ${
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando
              </span>
            ) : (
              "Generar Reporte"
            )}
          </button>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <GatewayReportTable data={data} loading={loading} />
      </div>
    </div>
  );
}
