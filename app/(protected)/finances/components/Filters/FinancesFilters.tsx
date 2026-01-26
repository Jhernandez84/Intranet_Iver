"use client";
import { useFinanceData } from "../../_Context/FinancesProvider";

export const FinanceFiltersComponent = () => {
  // Extraemos lo necesario del nuevo Provider
  const { filters, setFilters, isLoadingFinanceData } = useFinanceData();

  // Para las fechas, queremos que dispare la búsqueda en Supabase
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Esto actualizará el estado global y el useEffect del Provider
    // disparará el fetch de Supabase automáticamente
    setFilters({ [e.target.name]: e.target.value });
  };

  // Para el tipo, queremos que sea instantáneo (Filtro local)
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "" ? null : e.target.value;
    setFilters({ tipo: value });
  };

  return (
    <div className="flex gap-4 rounded-lg bg-gray-100 p-4">
      <input
        type="date"
        name="fromDate"
        value={filters.fromDate || ""}
        onChange={handleDateChange}
        className="rounded border p-1"
      />
      <input
        type="date"
        name="toDate"
        value={filters.toDate || ""}
        onChange={handleDateChange}
        className="rounded border p-1"
      />
      <select
        value={filters.tipo || ""}
        onChange={handleTypeChange}
        className="rounded border p-1"
      >
        <option value="">Todos los tipos</option>
        <option value="Ingreso">Ingreso</option>
        <option value="Egreso">Egreso</option>
      </select>

      {isLoadingFinanceData && (
        <span className="text-xs text-gray-500">Actualizando...</span>
      )}
    </div>
  );
};
