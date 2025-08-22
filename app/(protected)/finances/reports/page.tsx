"use client";
import FinanceBarChart from "../components/ChartComponent/FinanceChartComponent";
import CardComponent from "../components/CardComponent/CardComponent";
import MovementsTable from "../components/MovementsTable/MovementsTable";

export default function DashboardFinance() {
  return (
    <>
      <div className="grid h-[calc(100vh-70px)] grid-rows-[30%_60%] gap-2">
        <div>
          <div className="grid h-full w-full grid-cols-2 gap-2">
            {/* <div className="h-full w-full"> */}
            <CardComponent />
            <CardComponent />
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
