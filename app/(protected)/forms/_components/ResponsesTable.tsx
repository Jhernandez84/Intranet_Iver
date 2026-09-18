"use client";

import { Dropdown, DropdownItem, TextInput } from "flowbite-react";
import { useMemo, useState, type ReactNode } from "react";

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc" | null;
}

interface ResponsesTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  renderActions?: (row: T) => ReactNode;
  emptyMessage?: string;
}

export default function ResponsesTable<T extends { id: string }>({
  data,
  columns,
  loading,
  renderActions,
  emptyMessage = "No hay respuestas todavía.",
}: ResponsesTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<
    Record<string, string | null>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "",
    direction: null,
  });

  const uniqueValuesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.filterable) {
        const k = String(col.key);
        const values = data.map((item) => String(item[col.key] ?? ""));
        map[k] = Array.from(new Set(values)).filter(Boolean);
      }
    });
    return map;
  }, [data, columns]);

  const filteredData = useMemo(() => {
    let rows = data;

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        rows = rows.filter(
          (row) => String(row[key as keyof T] ?? "") === value,
        );
      }
    });

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? "")
            .toLowerCase()
            .includes(q),
        ),
      );
    }

    if (sortConfig.key && sortConfig.direction) {
      const key = sortConfig.key as keyof T;
      const dir = sortConfig.direction;
      rows = [...rows].sort((a, b) => {
        const av = String(a[key] ?? "");
        const bv = String(b[key] ?? "");
        return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }

    return rows;
  }, [data, columnFilters, searchQuery, sortConfig, columns]);

  const handleSort = (key: string) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <TextInput
          placeholder="Buscar por nombre, rut, email..."
          className="flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {loading && (
          <span className="animate-pulse text-xs text-blue-500">
            Cargando...
          </span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
        <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
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
                            (columnFilters[String(col.key)] as string) ||
                            col.label
                          }
                        >
                          <DropdownItem
                            onClick={() =>
                              setColumnFilters((prev) => ({
                                ...prev,
                                [String(col.key)]: null,
                              }))
                            }
                          >
                            Todos
                          </DropdownItem>
                          {uniqueValuesMap[String(col.key)]?.map((val) => (
                            <DropdownItem
                              key={val}
                              onClick={() =>
                                setColumnFilters((prev) => ({
                                  ...prev,
                                  [String(col.key)]: val,
                                }))
                              }
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
                {renderActions && (
                  <th className="px-6 py-4 text-center">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-6 py-4 text-center">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
