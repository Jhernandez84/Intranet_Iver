// app/dashboard/page.tsx
"use client";

import { useUser } from "../../context/UserProvider";
import CardComponent from "./components/CardComponent/CardComponent";
import FinanceBarChart from "./components/ChartComponent/FinanceChartComponent";

export default function DashboardPage() {
  const user = useUser();

  console.log(user);

  return (
    <div className="grid h-[calc(100vh-70px)] grid-rows-[60%_40%] gap-2">
      {/* Primera fila (60%) */}
      <div className="grid h-full grid-cols-[60%_40%] gap-2">
        {/* Gráfico a la izquierda */}
        <div className="h-[100%] w-full">
          <FinanceBarChart />
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
  );
}
