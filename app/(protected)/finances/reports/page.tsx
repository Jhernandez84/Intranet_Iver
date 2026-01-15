"use client";

import { useState } from "react";
import CardComponent from "../components/CardComponent/CardComponent";
import MovementsTable from "../components/MovementsTable/MovementsTable";
import FinanceEntryDataForm from "../components/FinanceEntryData/FinanceEntryDataForm";
import { useFinanceData } from "../_Context/FinancesProvider";
import { exportFinanzasPDF } from "../exportData/ExportFinanzasPDF";
import { openFinanzasPrintReport } from "./openPrintReports";

import { useUser } from "../../../context/UserProvider";
// import { useUserAccess } from "../../../context/UserAccessProvider";

interface FinanceEntryForm {
  // Unificamos fecha como string "YYYY-MM-DD" para ser 100% compatible con el provider y los inputs
  fecha: string;
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: string; // string para input number; casteamos al guardar
  num_doc: string;
  observaciones: string;
  estado: string;
  sede_id?: string | null;
}

const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

const baseRecordForm: FinanceEntryForm = {
  fecha: todayStr,
  tipo: "Ingreso",
  tipo_mov: "",
  metodo_pago: "Efectivo",
  monto: "0",
  num_doc: "",
  observaciones: "",
  estado: "Ingresado",
  sede_id: null,
};

export default function DashboardFinance() {
  const { user } = useUser();

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

  const ActionButtonToPdfSimple = (
    <button
      className="btn btn-outline"
      onClick={() => openFinanzasPrintReport(user?.company_id, user?.sede_id)}
    >
      🖨️ Generar PDF (simple)
    </button>
  );

  const ActionButtonExportExcel = (
    <button onClick={() => refreshFinanceMovements()}>🖨️ Exportar Excel</button>
  );

  const ActionButtonToPdf = (
    <button
      onClick={() => openFinanzasPrintReport(user?.company_id, user?.sede_id)}
    >
      🖨️ Generar PDF
    </button>
  );

  return (
    <>
      <FinanceEntryDataForm
        initialValues={baseRecordForm} // ✅ pasa un objeto válido
        editView={false}
        movementId="" // ✅ requerido por las props
        openModal={open}
        setOpenModal={setOpen}
      />
      <div className="grid h-full grid-rows-[200px_1fr] gap-4">
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
