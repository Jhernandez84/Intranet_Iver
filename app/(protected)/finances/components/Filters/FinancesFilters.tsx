"use client";
import { useState } from "react";
import { useFinanceData } from "../../_Context/FinancesProvider";
import { useUser } from "../../../../context/UserProvider";
import { useCompanyBranchesAccess } from "../../../../context/CompanyBranchesProvider";

type PeriodType = "WTD" | "LW" | "MTD" | "LM" | "YTD" | "LY" | "Custom";

export const FinanceFiltersComponent = () => {
  const { financeMovements, filters, setFilters, isLoadingFinanceData } =
    useFinanceData();
  const { user } = useUser();
  const branches = useCompanyBranchesAccess();

  // Estado local para manejar el valor del selector de periodo
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("WTD");

  const getDateRange = (period: PeriodType) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    let fromDate = today;
    let toDate = today;

    switch (period) {
      case "WTD": {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        fromDate = monday.toISOString().split("T")[0];
        break;
      }
      case "LW": {
        // Last Week
        const day = now.getDay();
        // 1. Calculamos la diferencia para llegar al lunes de ESTA semana
        // Si es domingo (0), retrocedemos 6 días. Si no, restamos day - 1.
        const diffToMonday = now.getDate() - (day === 0 ? 6 : day - 1);

        // 2. Restamos 7 días para posicionarnos en el lunes de la SEMANA PASADA
        const lastMonday = new Date(
          now.getFullYear(),
          now.getMonth(),
          diffToMonday - 7,
        );
        const lastSunday = new Date(
          now.getFullYear(),
          now.getMonth(),
          diffToMonday - 1,
        );

        fromDate = lastMonday.toISOString().split("T")[0];
        toDate = lastSunday.toISOString().split("T")[0]; // Actualizamos también el toDate
        break;
      }
      case "MTD": {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        break;
      }
      case "LM": {
        // Primer día del mes pasado
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          .toISOString()
          .split("T")[0];

        // Último día del mes pasado (día 0 del mes actual)
        toDate = new Date(now.getFullYear(), now.getMonth(), 0)
          .toISOString()
          .split("T")[0];
        break;
      }
      case "YTD": {
        fromDate = `${now.getFullYear()}-01-01`;
        break;
      }
      case "LY": {
        const lastYear = now.getFullYear() - 1;
        fromDate = `${lastYear}-01-01`;
        toDate = `${lastYear}-12-31`;
        break;
      }
      case "Custom":
        return null;
    }
    return { fromDate, toDate };
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value as PeriodType;
    setSelectedPeriod(newPeriod);

    const range = getDateRange(newPeriod);
    if (range) {
      // Actualizamos el Provider con las fechas calculadas
      setFilters({
        fromDate: range.fromDate,
        toDate: range.toDate,
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Usamos el 'name' del select para saber qué propiedad actualizar
    // Manteniendo el resto de filtros intactos
    setFilters({
      [name]: value === "" ? null : value,
    });
  };

  return (
    <div className="flex flex-grow flex-col justify-center">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-4 text-center text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:text-white">
          Filtros generales
        </p>

        <div className="flex flex-col space-y-4">
          {/* SELECTOR DE PERIODO */}
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-[10px] font-semibold text-gray-500">
              Seleccione periodo
            </label>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="WTD">Esta semana</option>
              <option value="LW">Semana anterior</option>
              <option value="MTD">Este mes</option>
              <option value="LM">Mes anterior</option>
              <option value="YTD">Este año</option>
              <option value="LY">Año anterior</option>
              <option value="Custom">Rango de Fecha</option>
            </select>
          </div>

          <div className="grid gap-2">
            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-[10px] font-semibold text-gray-500">
                Desde
              </label>
              <input
                name="fromDate"
                type="date"
                onChange={handleDateChange}
                value={filters.fromDate}
                disabled={selectedPeriod !== "Custom"}
                className={`w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${
                  selectedPeriod !== "Custom"
                    ? "cursor-not-allowed bg-gray-100 opacity-50 dark:bg-gray-700"
                    : ""
                }`}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-[10px] font-semibold text-gray-500">
                Hasta
              </label>
              <input
                name="toDate"
                type="date"
                onChange={handleDateChange}
                value={filters.toDate}
                disabled={selectedPeriod !== "Custom"}
                className={`w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${
                  selectedPeriod !== "Custom"
                    ? "cursor-not-allowed bg-gray-100 opacity-50 dark:bg-gray-700"
                    : ""
                }`}
              />
            </div>
          </div>

          <div className="group z-0 grid w-full">
            <label className="mb-1 ml-1 text-[10px] font-semibold text-gray-500">
              Tipo de Movimiento
            </label>
            <select
              id="tipo"
              name="tipo"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              onChange={handleTypeChange}
              value={filters.tipo || ""}
            >
              <option value="">Todos...</option>
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
              <option value="Traspaso">Traspaso</option>
            </select>
          </div>
          {user?.sede_id ? (
            []
          ) : (
            <div className="group z-0 grid w-full">
              <label className="mb-1 ml-1 text-[10px] font-semibold text-gray-500">
                Sede
              </label>
              <select
                id="sede_id"
                name="sede_id"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={handleTypeChange}
                value={filters.sede_id || ""}
              >
                <option value="">Todos...</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
