"use client";

import { Dropdown, DropdownItem, TextInput } from "flowbite-react";
import { useMemo, ReactNode } from "react";
import { useFinanceData } from "../../_Context/FinancesProvider";
import { FinanceFilters } from "../../_Context/FinancesProvider";

// 1. Interfaz de la data
export interface FinanceMovement {
  id: string;
  fecha: string;
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: number;
  sede_nombre: string;
  observaciones: string;
}

// 2. Interfaz de configuración de columnas (Sin 'any')
export interface ColumnConfig<T> {
  key: keyof T | "acciones";
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  // Cambiamos 'any' por 'unknown' o el tipo específico de la propiedad
  render?: (value: T[keyof T], row: T) => ReactNode;
}

// 3. Interfaz para los filtros (Evitamos 'any')
interface TableFilters {
  tipo?: string | null;
  tipo_mov?: string | null;
  metodo_pago?: string | null;
  searchQuery?: string;
  sortConfig: { key: string; direction: "asc" | "desc" | null };
  [key: string]: unknown; // Permite acceso dinámico seguro
}

interface GenericTableProps {
  data: FinanceMovement[] | null;
  columns: ColumnConfig<FinanceMovement>[];
  filters: FinanceFilters; // Cambiado de 'any'
  setFilters: (f: Partial<TableFilters>) => void; // Cambiado de 'any'
  onEdit?: (row: FinanceMovement) => void;
  onView?: (row: FinanceMovement) => void;
}

export default function MovementsTable({
  data,
  columns,
  filters,
  setFilters,
  onEdit,
  onView,
}: GenericTableProps) {
  const { isLoadingFinanceData } = useFinanceData();

  const uniqueValuesMap = useMemo(() => {
    if (!data) return {} as Record<string, string[]>;

    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filterable && col.key !== "acciones") {
        const k = col.key as keyof FinanceMovement;
        const values = data.map((item) => String(item[k] || ""));
        map[String(k)] = Array.from(new Set(values)).filter(Boolean);
      }
    });
    return map;
  }, [data, columns]);

  const handleSort = (key: string) => {
    const direction =
      filters.sortConfig.key === key && filters.sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setFilters({ sortConfig: { key, direction } });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <TextInput
          placeholder="Búsqueda rápida..."
          className="flex-1"
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
        />
        {isLoadingFinanceData && (
          <span className="animate-pulse text-xs text-blue-500">
            Cargando...
          </span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
        <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="sticky top-0 z-20 bg-gray-100 font-bold text-gray-700 uppercase dark:bg-gray-900 dark:text-gray-400">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      {col.filterable ? (
                        <Dropdown
                          inline
                          label={
                            (filters[col.key as string] as string) || col.label
                          }
                        >
                          <DropdownItem
                            onClick={() => setFilters({ [col.key]: null })}
                          >
                            Todos
                          </DropdownItem>
                          {uniqueValuesMap[String(col.key)]?.map((val) => (
                            <DropdownItem
                              key={val}
                              onClick={() => setFilters({ [col.key]: val })}
                            >
                              {val}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                      ) : (
                        <span
                          className={
                            col.sortable ? "cursor-pointer hover:underline" : ""
                          }
                          onClick={() =>
                            col.sortable && handleSort(String(col.key))
                          }
                        >
                          {col.label}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4">
                      {col.render && col.key !== "acciones"
                        ? col.render(row[col.key as keyof FinanceMovement], row)
                        : String(row[col.key as keyof FinanceMovement] ?? "")}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center">
                    <Dropdown inline label="⚙️" arrowIcon={false}>
                      {onEdit && (
                        <DropdownItem onClick={() => onEdit(row)}>
                          Editar
                        </DropdownItem>
                      )}
                      {onView && (
                        <DropdownItem onClick={() => onView(row)}>
                          Detalles
                        </DropdownItem>
                      )}
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
