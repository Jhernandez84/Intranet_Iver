"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // Importante para evitar errores de SSR
import CardComponent from "../components/CardComponent/CardComponent";
import MovementsTable, {
  ColumnConfig,
  FinanceMovement,
} from "../components/MovementsTable/MovementsTable";
import FinanceEntryDataForm from "../components/FinanceEntryData/FinanceEntryDataForm";
import { useFinanceData } from "../_Context/FinancesProvider";
import { FinanceFiltersComponent } from "../components/Filters/FinancesFilters";
import { formatCurrency } from "../helper/FinanceDataOutputs";

import { MovimientoFinanciero } from "./print/ReportButtonComponent";

/** * Importación dinámica del botón de reporte.
 * Esto asegura que la librería PDF solo se cargue en el navegador del usuario.
 */

// Ejemplo de cómo configurarías las columnas para Finanzas
const columns: ColumnConfig<FinanceMovement>[] = [
  { key: "fecha", label: "Fecha", sortable: true, filterable: false },
  { key: "tipo", label: "Tipo", sortable: true, filterable: true },
  {
    key: "tipo_mov",
    label: "Tipo de movimiento",
    sortable: true,
    filterable: true,
  },
  {
    key: "observaciones",
    label: "Observaciones",
    sortable: true,
    filterable: true,
  },
  {
    key: "metodo_pago",
    label: "Medio de pago",
    sortable: false,
    filterable: true,
  },
  {
    key: "monto",
    label: "Monto",
    sortable: true,
    filterable: false,
    render: (val: number) => formatCurrency(val),
  },
];

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

const ReportButtonResumenPeriodo = dynamic(
  () =>
    import("./print/ReportButtonComponent").then(
      (mod) => mod.ReportButtonResumenPeriodo,
    ),
  { ssr: false },
);

const ReportButtonResumenPeriodo2 = dynamic(
  () =>
    import("./print/ReportButtonComponent").then(
      (mod) => mod.ReportButtonResumenPeriodo3,
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
  const { financeMovements, filters, setFilters } = useFinanceData();
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

  // const ActionButtonRefresh = (
  //   <button
  //     className="cursor-pointer gap-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
  //     onClick={() => {
  //       refreshFinanceMovements({
  //         fromDate: "2026-01-11", // Ahora estamos en 2026
  //         toDate: new Date().toISOString().split("T")[0],
  //       });
  //       console.log("Aplicando filtros");
  //     }}
  //   >
  //     ✅ Actualizar
  //   </button>
  // );

  /**
   * REEMPLAZO: Este es el nuevo botón que genera el PDF.
   * Le pasamos los 'financeMovements' que vienen del Context.
   */
  const ActionButtonToPdf = <ReportButton movimientos={movimientosTipados} />;

  const ActionButtonToPdf2 = (
    <ReportButtonResumenPeriodo2 movimientos={movimientosTipados} />
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
              // actionButton={ActionButton}
            />
            <CardComponent
              label="Balance del mes"
              period="MTD"
              actionButton={ActionButtonToPdf}
              actionButton2={ActionButtonToPdf2} // <--- Inyectamos el nuevo botón aquí
              // actionButton3={ActionButtonToPdf2} // <--- Inyectamos el nuevo botón aquí
            />
          </div>
        </div>
        <div className="h-full w-full overflow-hidden">
          <MovementsTable
            data={financeMovements}
            columns={columns}
            filters={filters}
            setFilters={setFilters}
            //onEdit={(row) => handleEdit(row)}
          />
        </div>
      </div>
    </>
  );
}
