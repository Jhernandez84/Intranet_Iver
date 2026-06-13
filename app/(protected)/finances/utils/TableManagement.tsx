"use client";

import { useState } from "react";
import { deleteByRange } from "./DeletionCode";
import { AllowedTables } from "./DeletionCode";

export default function BulkDeleteTool() {
  const [table, setTable] = useState<AllowedTables>("bank_movements");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);

  // Estado para el mensaje de respuesta (éxito o error)
  const [status, setStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const executeDelete = async () => {
    if (!dates.start || !dates.end) {
      setStatus({ message: "⚠️ Selecciona el rango de fechas", isError: true });
      return;
    }

    if (!confirm(`¿Confirmas eliminar datos de ${table}?`)) return;

    setLoading(true);
    setStatus(null);

    try {
      // Reemplaza 'TU_TENANT_ID' con el ID real de tu sesión
      await deleteByRange(table, "transaction_day", dates.start, dates.end);

      setStatus({
        message: "✅ Datos eliminados correctamente",
        isError: false,
      });
      setDates({ start: "", end: "" });
    } catch (err: unknown) {
      // Manejo de error sin 'any'
      let errorMessage = "Ocurrió un error inesperado";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        // Captura errores que vienen directamente de la respuesta de Supabase
        errorMessage = String((err as { message: string }).message);
      }

      setStatus({ message: `❌ Error: ${errorMessage}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-bold">Limpieza de Datos</h2>

      <div className="space-y-4">
        {/* Selector de Tabla */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Tabla objetivo
          </label>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value as AllowedTables)}
            className="w-full rounded border bg-transparent p-2 text-gray-900 dark:text-white"
          >
            <option value="bank_movements">Movimientos Bancarios</option>
            <option value="bank_reconciliations">Conciliaciones</option>
            <option value="bank_payment_gateway_details">
              Detalles Pasarela Pagos
            </option>
          </select>
        </div>

        {/* Inputs de fecha */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dates.start}
            onChange={(e) => setDates({ ...dates, start: e.target.value })}
            className="rounded border p-2 dark:bg-gray-900 dark:text-white"
          />
          <input
            type="date"
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
            className="rounded border p-2 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={executeDelete}
          disabled={loading}
          className={`w-full rounded-lg p-3 font-bold text-white transition-all ${
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-red-600 hover:bg-red-700 active:scale-95"
          }`}
        >
          {loading ? "Borrando..." : "Eliminar Información"}
        </button>

        {/* Feedback visual del error o éxito */}
        {status && (
          <div
            className={`mt-4 rounded-md p-3 text-sm font-medium ${
              status.isError
                ? "border border-red-200 bg-red-50 text-red-600"
                : "border border-green-200 bg-green-50 text-green-600"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
