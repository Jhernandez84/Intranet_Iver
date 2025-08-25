import { Dropdown, DropdownItem, DropdownDivider } from "flowbite-react";
import { formatTableData } from "../../helper/FinanceDataTableFills";
import { useFinanceData } from "../../_Context/FinancesProvider";

export default function MovementsTable() {
  const selectedKeys = [
    "fecha",
    "tipo",
    "tipo_mov",
    "monto",
    "metodo_pago",
    "num_doc",
    // "observaciones",
  ] as const;
  const { financeMovements, isLoadingFinanceData } = useFinanceData();

  const { headers, rows } = formatTableData(financeMovements, selectedKeys);

  return (
    <div className="relative rounded shadow-md sm:rounded-lg">
      <div className="h-[calc(100vh-350px)] overflow-y-auto">
        <table className="w-full table-fixed text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-900 dark:text-gray-400">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900"
                >
                  {header}
                </th>
              ))}
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                Opciones
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                {row.map((cell, i) => (
                  <td className="px-6 py-4" key={i}>
                    {cell}
                  </td>
                ))}
                <td className="px-6 py-4">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
