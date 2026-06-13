"use client";

import { useState, useEffect } from "react";
import { useFinanceData } from "../../_Context/FinancesProvider";
import ExcelUploader from "../../helper/ExcelUploader";
import {
  reconcileByDateRange,
  getUnreconciledCount,
  syncTuuDataAction,
} from "../../bank_management/actions";
import SimpleDelete from "../../utils/TableManagement";

import { getSyncStatus } from "../../helper/GetStatus";
import { useUser } from "../../../../context/UserProvider";

// Definimos la interfaz para el estado
interface SyncStatus {
  id: "BANK" | "TUU" | "GETNET";
  label: string;
  lastDate: string | null;
  rec_status: string | null;
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
  const [isSyncingRow, setIsSyncingRow] = useState<string | null>(null);

  // Estado para los datos de la tabla de sincronización
  const [syncRows, setSyncRows] = useState<SyncStatus[]>([]);

  // 1. Cargar el estado de sincronización al iniciar o cambiar a la pestaña Movimientos
  useEffect(() => {
    const fetchStatus = async () => {
      const companyId = user?.company_id || "1"; // Ajustar según tu lógica
      const status = await getSyncStatus(companyId);

      setSyncRows([
        {
          id: "BANK",
          label: "Movimientos Bancarios",
          lastDate: status.last_bank_movement,
          rec_status: status.is_fully_reconciled
            ? "Todo al día"
            : "Pendientes detectados",
          reconciledDate: status.last_reconciled_date.bank,
        },
        {
          id: "TUU",
          label: "Transacciones TUU",
          lastDate: status.last_tuu_sync,
          rec_status: status.is_fully_reconciled
            ? "Todo al día"
            : "Pendientes detectados",

          reconciledDate: status.last_reconciled_date.gateway,
        },
        {
          id: "GETNET",
          label: "Transacciones GETNET",
          lastDate: status.last_getnet_sync,
          rec_status: status.is_fully_reconciled
            ? "Todo al día"
            : "Pendientes detectados",

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
      name: "Eliminar",
      icon: "M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4",
    },
    {
      name: "Ajustes",
      icon: "M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2",
    },
  ];

  const handleRowSync = async (row: SyncStatus) => {
    const companyId = user?.company_id || "1";
    setIsSyncingRow(row.id);

    try {
      if (row.id === "TUU") {
        // Ejemplo: Sincronizar desde la última fecha + 1 día hasta hoy
        const startDate = row.lastDate
          ? new Date(new Date(row.lastDate).getTime() + 86400000)
              .toISOString()
              .split("T")[0]
          : "2026-01-01";
        const endDate = new Date().toISOString().split("T")[0];

        await syncTuuDataAction(companyId, startDate, endDate);
        alert("Sincronización de TUU completada");
      } else if (row.id === "BANK") {
        alert(
          "Para movimientos bancarios, por favor usa la pestaña de Carga Masiva",
        );
      } else if (row.id === "GETNET") {
        alert(
          "Sincronización automática de Getnet no disponible (Requiere Excel)",
        );
      }

      // Refrescar los datos de la tabla después de sincronizar
      const status = await getSyncStatus(companyId);
      // ... (repetir lógica de setSyncRows para actualizar la vista)
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncingRow(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Movimientos":
        return (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Origen de Datos</th>
                  <th className="px-6 py-3">Último Registro</th>
                  <th className="px-6 py-3">Última Conciliación</th>
                  <th className="px-6 py-3">Estado Conciliación</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Acción</th>{" "}
                  {/* Nueva Columna */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {syncRows.map((row) => (
                  <tr
                    key={row.id}
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
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900">
                      {row.rec_status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        if (!row.lastDate) {
                          return (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                              Requiere Carga
                            </span>
                          );
                        }

                        // Obtenemos la fecha de "Ayer" (Hoy - 1 día)
                        const today = new Date();
                        const yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);
                        yesterday.setHours(0, 0, 0, 0); // Limpiamos horas para comparar solo días

                        const lastDateObj = new Date(row.lastDate);
                        lastDateObj.setHours(0, 0, 0, 0);

                        // Es "Actualizado" si la fecha es igual o posterior a ayer
                        const isUpToDate =
                          lastDateObj.getTime() >= yesterday.getTime();

                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isUpToDate
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {isUpToDate ? "Actualizado" : "Requiere Actualizar"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleRowSync(row)}
                        disabled={isSyncingRow !== null}
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                          row.id === "BANK"
                            ? "cursor-not-allowed bg-gray-100 text-gray-400" // Deshabilitado para banco si es por Excel
                            : "cursor-pointer bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                        }`}
                      >
                        {isSyncingRow === row.id ? (
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3 animate-spin text-white"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Sincronizando...
                          </span>
                        ) : (
                          "Actualizar"
                        )}
                      </button>
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
          <div className="mx-auto max-w-2xl">
            <header className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Carga de Documentos
              </h2>
              <p className="text-sm text-gray-500">
                Sube tus archivos Excel para procesar la información bancaria y
                de POS.
              </p>
            </header>

            {/* Solo pasamos el ID necesario */}
            <ExcelUploader companyId={user?.company_id || "1"} />
          </div>
        );

      case "Eliminar":
        return (
          <div className="mx-auto max-w-2xl">
            <header className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Carga de Documentos
              </h2>
              <p className="text-sm text-gray-500">
                Selecciona rango de fecha que deseas eliminar
              </p>
            </header>

            {/* Solo pasamos el ID necesario */}
            <SimpleDelete />
          </div>
        );

      case "Ajustes":
        return (
          <div className="rounded-lg border bg-gray-50 p-10">
            <p>Proximamente</p>
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
