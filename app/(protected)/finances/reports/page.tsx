"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // Importante para evitar errores de SSR
import CardComponent from "../components/CardComponent/CardComponent";
import MovementsTable from "../components/MovementsTable/MovementsTable";
import FinanceEntryDataForm from "../components/FinanceEntryData/FinanceEntryDataForm";
import { useFinanceData } from "../_Context/FinancesProvider";

import { MovimientoFinanciero } from "./print/ReportButtonComponent";

/** * Importación dinámica del botón de reporte.
 * Esto asegura que la librería PDF solo se cargue en el navegador del usuario.
 */
const ReportButton = dynamic(
  () => import("./print/ReportButtonComponent").then((mod) => mod.ReportButton),
  { ssr: false },
);

const ReportButtonResumen = dynamic(
  () =>
    import("./print/ReportButtonComponent").then(
      (mod) => mod.ReportButtonResumen,
    ),
  { ssr: false },
);

interface FinanceEntryForm {
  fecha: string;
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: string;
  num_doc: string;
  observaciones: string;
  estado: string;
  sede_id?: string | null;
}

const todayStr = new Date().toISOString().slice(0, 10);

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
  const { financeMovements, refreshFinanceMovements } = useFinanceData();
  const [open, setOpen] = useState(false);

  const movimientosTipados =
    financeMovements as unknown as MovimientoFinanciero[];

  // --- BOTONES DE ACCIÓN ---

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

  /**
   * REEMPLAZO: Este es el nuevo botón que genera el PDF.
   * Le pasamos los 'financeMovements' que vienen del Context.
   */
  const ActionButtonToPdf = <ReportButton movimientos={movimientosTipados} />;

  const ActionButtonToPdf2 = (
    <ReportButtonResumen movimientos={movimientosTipados} />
  );

  // --- RENDEREADO ---

  return (
    <>
      <FinanceEntryDataForm
        initialValues={baseRecordForm}
        editView={false}
        movementId=""
        openModal={open}
        setOpenModal={setOpen}
      />

      <div className="grid h-full grid-rows-[200px_1fr] gap-4">
        <div>
          <div className="grid h-full w-full grid-cols-2 gap-2">
            <CardComponent
              label="Balance de esta semana"
              period="WTD"
              actionButton={ActionButton}
            />
            <CardComponent
              label="Balance del mes"
              period="MTD"
              actionButton={ActionButtonRefresh}
              actionButton2={ActionButtonToPdf2} // <--- Inyectamos el nuevo botón aquí
              // actionButton3={ActionButtonToPdf2} // <--- Inyectamos el nuevo botón aquí
            />
          </div>
        </div>

        <div className="h-full w-full overflow-hidden">
          <MovementsTable />
        </div>
      </div>
    </>
  );
}
