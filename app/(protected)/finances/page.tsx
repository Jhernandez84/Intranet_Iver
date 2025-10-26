// app/dashboard/page.tsx
"use client";

import { useUser } from "../../context/UserProvider";
import { useState } from "react";
import CardComponent from "./components/CardComponent/CardComponent";
import FinanceBarChart from "./components/ChartComponent/FinanceChartComponent";
import { useFinanceData } from "./_Context/FinancesProvider";
import FinanceEntryDataForm from "./components/FinanceEntryData/FinanceEntryDataForm";

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

export default function DashboardPage() {
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

  return (
    <>
      {open && (
        <FinanceEntryDataForm
          initialValues={baseRecordForm} // ✅ pasa un objeto válido
          editView={false}
          movementId="" // ✅ requerido por las props
          openModal={open}
          setOpenModal={setOpen}
        />
      )}

      <div className="grid grid-rows-[60%_40%] gap-2">
        {/* Primera fila (60%) */}
        <div className="grid h-full grid-cols-[60%_40%] gap-2">
          {/* Gráfico a la izquierda */}
          <div className="h-[100%] w-full">
            <FinanceBarChart
              label=""
              period="MTD"
              actionButton={ActionButton}
              actionButton2={ActionButtonRefresh}
            />
          </div>

          {/* 3 cards a la derecha */}
          <div className="grid h-full w-full grid-rows-3 gap-2">
            <div className="h-full w-full pr-2">
              <CardComponent label="Resumen del mes" period="MTD" />
            </div>
            <div className="h-full w-full pr-2">
              <CardComponent
                label="Resumen del mes anterior"
                period="PREV_MONTH"
              />
            </div>

            <div className="h-full w-full pr-2">
              <CardComponent label="Resumen año" period="YTD" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
