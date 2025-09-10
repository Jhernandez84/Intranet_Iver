import { Dropdown, DropdownItem, DropdownDivider } from "flowbite-react";
import { useState } from "react";
import { formatTableData } from "../../helper/FinanceDataTableFills";
import { useFinanceData } from "../../_Context/FinancesProvider";
import FinanceEntryDataForm from "../FinanceEntryData/FinanceEntryDataForm";

interface MovementsTableProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

export default function MovementsTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editView, setEditView] = useState(false);

  const handleEditForm = () => {
    setEditView(true);
    setModalOpen(true);
  };

  const handleViewDetails = () => {
    setEditView(false);
    setModalOpen(true);
  };

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
      <FinanceEntryDataForm
        editView={editView}
        openModal={modalOpen}
        setOpenModal={setModalOpen}
      />
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
                <td className="grid cursor-pointer grid-cols-3 gap-2 px-6 py-4 hover:text-white">
                  <div>
                    <svg
                      onClick={() => handleViewDetails()}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6 cursor-pointer text-white hover:text-blue-500"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <svg
                      onClick={() => handleEditForm()}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6 cursor-pointer text-white hover:text-yellow-400"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
