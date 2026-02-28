"use client";

import { useState, useEffect } from "react";
import { useFinanceData } from "../../_Context/FinancesProvider";
import ExcelUploader from "../../helper/ExcelUploader";
import {
  reconcileByDateRange,
  getUnreconciledCount,
  syncTuuDataAction,
} from "../../bank_management/actions";
import { getSyncStatus } from "../../helper/GetStatus";
import { useUser } from "../../../../context/UserProvider";

// Definimos la interfaz para el estado
interface SyncStatus {
  label: string;
  lastDate: string | null;
  reconciledDate: string | null;
}

export default function TabComponent() {
  const { user } = useUser();
  const { filters, setFilters, isLoadingFinanceData } = useFinanceData();

  const [activeTab, setActiveTab] = useState("Movimientos");
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado para los datos de la tabla de sincronización
  const [syncRows, setSyncRows] = useState<SyncStatus[]>([]);

  // 1. Cargar el estado de sincronización al iniciar o cambiar a la pestaña Movimientos
  useEffect(() => {
    const fetchStatus = async () => {
      const companyId = user?.company_id || "1"; // Ajustar según tu lógica
      const status = await getSyncStatus(companyId);

      setSyncRows([
        {
          label: "Movimientos Bancarios",
          lastDate: status.last_bank_movement,
          reconciledDate: status.last_reconciled_date.bank,
        },
        {
          label: "Transacciones TUU",
          lastDate: status.last_tuu_sync,
          reconciledDate: status.last_reconciled_date.gateway,
        },
        {
          label: "Transacciones GETNET",
          lastDate: status.last_getnet_sync,
          reconciledDate: status.last_reconciled_date.gateway,
        },
      ]);
    };

    fetchStatus();
  }, [user?.company_id, activeTab]);

  // Efecto para buscar el conteo de pendientes
  useEffect(() => {
    const fetchCount = async () => {
      if (dates.start && dates.end) {
        setIsChecking(true);
        const count = await getUnreconciledCount(
          user?.company_id || "1",
          dates.start,
          dates.end,
        );
        setPendingCount(count);
        setIsChecking(false);
      }
    };
    fetchCount();
  }, [dates.start, dates.end, user?.company_id]);

  const handleReconcile = async () => {
    const companyId = user?.company_id || "1";
    setIsProcessing(true);
    try {
      const result = await reconcileByDateRange(
        companyId,
        dates.start,
        dates.end,
      );
      if (result.success) {
        alert(`Proceso finalizado: ${result.matches} conciliaciones creadas.`);
      } else {
        alert("Error en el proceso");
      }
    } catch (error) {
      alert("Error técnico al procesar la conciliación");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncTuu = async () => {
    setLoading(true);
    const result = await syncTuuDataAction(
      user?.company_id || "1",
      "2026-02-06",
      "2026-02-23",
    );
    if (result.success) {
      alert(`Sincronizado: ${result.count} transacciones.`);
    } else {
      alert(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  const tabs = [
    {
      name: "Movimientos",
      icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    },
    {
      name: "Conciliación",
      icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M9 12l2 2 4-4",
    },
    {
      name: "Carga Masiva",
      icon: "M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4",
    },
    {
      name: "Ajustes",
      icon: "M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Movimientos":
        return (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-start">Origen de Datos</th>
                  <th className="px-6 py-3 text-start">Último Registro</th>
                  <th className="px-6 py-3 text-start">Última Conciliación</th>
                  <th className="px-6 py-3 text-start">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {syncRows.map((row) => (
                  <tr
                    key={row.label}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {row.lastDate
                        ? new Date(row.lastDate).toLocaleDateString("es-CL")
                        : "Sin datos"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {row.reconciledDate
                        ? new Date(row.reconciledDate).toLocaleDateString(
                            "es-CL",
                          )
                        : "Pendiente"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.lastDate
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.lastDate ? "Activo" : "Requiere Carga"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "Conciliación":
        return (
          <div className="mt-4 rounded-xl border bg-gray-50 p-8 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Cierre y Conciliación Automática
            </h2>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  className="rounded-lg border border-gray-300 p-2.5 text-sm"
                  value={dates.start}
                  onChange={(e) =>
                    setDates({ ...dates, start: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  className="rounded-lg border border-gray-300 p-2.5 text-sm"
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                />
              </div>
              <button
                onClick={handleReconcile}
                disabled={isProcessing || !dates.start || !dates.end}
                className="rounded-lg bg-green-600 px-8 py-2.5 font-bold text-white shadow-md disabled:bg-gray-400"
              >
                {isProcessing
                  ? "Procesando..."
                  : `Correr Conciliación ${pendingCount ? `(${pendingCount})` : ""}`}
              </button>
            </div>
          </div>
        );

      case "Carga Masiva":
        return (
          <div className="mx-auto max-w-xl py-10">
            <ExcelUploader companyId={user?.company_id || "1"} />
          </div>
        );

      case "Ajustes":
        return (
          <div className="rounded-lg border bg-gray-50 p-10">
            <button
              onClick={handleSyncTuu}
              className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              {loading ? "Sincronizando..." : "Sincronizar con Tuu.cl"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex w-full flex-col p-4">
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap text-center text-sm font-medium">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <li key={tab.name} className="me-2">
                <button
                  onClick={() => setActiveTab(tab.name)}
                  className={`group inline-flex items-center justify-center border-b-2 p-4 transition-all duration-200 ${
                    isActive
                      ? "rounded-t-lg border-gray-900 bg-gray-900 text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <svg
                    className={`me-2 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={tab.icon}
                    />
                  </svg>
                  {tab.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="transition-all duration-300">{renderContent()}</div>
    </div>
  );
}
