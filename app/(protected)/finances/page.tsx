// app/dashboard/page.tsx
"use client";

import { useUser } from "../../context/UserProvider";
import CardComponent from "./components/CardComponent/CardComponent";
import FinanceBarChart from "./components/ChartComponent/FinanceChartComponent";

import MovementsTable from "./components/MovementsTable/MovementsTable";

export default function DashboardPage() {
  const user = useUser();

  console.log(user);

  return (
    <div className="m-2 grid h-[87vh] grid-rows-[60%_40%] gap-4">
      {/* Primera fila (60%) */}
      <div className="grid h-full grid-cols-[60%_40%] gap-2">
        {/* Gráfico a la izquierda */}
        <div className="h-full w-full">
          <FinanceBarChart />
        </div>

        {/* Dos cards a la derecha */}
        <div className="grid h-full w-full grid-rows-2 gap-2">
          <div className="h-full w-full">
            <CardComponent />
          </div>
          <div className="h-full w-full">
            <CardComponent />
          </div>
        </div>
      </div>

      {/* Segunda fila (40%) */}
      <div className="h-full w-full overflow-hidden">
        <MovementsTable />
      </div>
    </div>
  );
}
