"use client";

import { useState } from "react";
import CardComponent from "../components/CardComponent/CardComponent";
import MovementsTable from "../components/MovementsTable/MovementsTable";
import FinanceEntryDataForm from "../components/FinanceEntryData/FinanceEntryDataForm";
import { useFinanceData } from "../_Context/FinancesProvider";

export default function DashboardFinance() {
  const [open, setOpen] = useState(false);
  const { refreshFinanceMovements } = useFinanceData();

  const ActionButton = (
    <button
      className="cursor-pointer gap-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
      onClick={() => setOpen(true)}
    >
      + Ingresar Movimiento
    </button>
  );

  const ActionButtonRefresh = (
    <button
      className="cursor-pointer gap-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
      onClick={() => refreshFinanceMovements()}
    >
      ✅ Actualizar
    </button>
  );

  const ActionButtonExportExcel = (
    <button
    // onClick={() => refreshFinanceMovements()}
    >
      🖨️ Exportar Excel
    </button>
  );
  const ActionButtonToPdf = (
    <button
    // onClick={() => refreshFinanceMovements()}
    >
      🖨️ Generar PDF
    </button>
  );

  return (
    <>
      {open && (
        <FinanceEntryDataForm
          editView={false}
          openModal={open}
          setOpenModal={setOpen}
        />
      )}
      <div className="grid h-[calc(100vh-70px)] grid-rows-[22%_78%] gap-2">
        <div>
          <div className="grid h-full w-full grid-cols-2 gap-2">
            {/* <div className="h-full w-full"> */}
            <CardComponent
              label="Balance de esta semana"
              period="WTD"
              actionButton={ActionButton}
            />
            <CardComponent
              label="Balance del mes"
              period="MTD"
              actionButton={ActionButtonRefresh}
              actionButton2={ActionButtonToPdf}
            />
            {/* </div> */}
          </div>
        </div>

        {/* Segunda fila (40%) */}
        <div className="h-full w-full overflow-hidden">
          <MovementsTable />
        </div>
      </div>
    </>
  );
}
