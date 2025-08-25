"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import ApexCharts from "apexcharts";
import { Dropdown, DropdownItem } from "flowbite-react";
import { initFlowbite } from "flowbite";

import { useFinanceData } from "../../_Context/FinancesProvider";
import { groupByMesTipoForChartPretty } from "../../helper/FinanceDataOutputs";
import { getTotalsByTipo } from "../../helper/FinanceDataOutputs";
import { formatCurrency } from "../../helper/FinanceDataOutputs";
import {
  getDateRange,
  type DateRangeKey,
} from "../../helper/FinanceDataOutputs";

interface CardComponentProps {
  label: string;
  period: DateRangeKey;
  actionButton?: ReactNode; // 👈 Aquí pasas el botón u otro elemento
  actionButton2?: ReactNode; // 👈 Aquí pasas el botón u otro elemento
  actionButton3?: ReactNode; // 👈 Aquí pasas el botón u otro elemento
}

const FinanceBarChart = ({
  label,
  period,
  actionButton,
  actionButton2,
  actionButton3,
}: CardComponentProps) => {
  const chartRef = useRef<ApexCharts | null>(null);
  const chartElRef = useRef<HTMLDivElement | null>(null);

  const { financeMovements, isLoadingFinanceData } = useFinanceData();
  const safeData = financeMovements ?? [];

  const [dateRange, setDateRange] = useState<DateRangeKey>("WTD");

  const { fechaDesde, fechaHasta } = getDateRange(dateRange);

  const { series, categories } = groupByMesTipoForChartPretty(safeData, {
    fechaDesde: new Date(fechaDesde),
    fechaHasta: new Date(fechaHasta),
  });

  const Balance = getTotalsByTipo(safeData, { fechaDesde, fechaHasta });

  useEffect(() => {
    const options = {
      series: [
        {
          name: series[0].name,
          color: "#31C48D",
          data: series[0].data,
        },
        {
          name: series[1].name,
          color: "#F05252",
          data: series[1].data,
        },
      ],
      chart: {
        type: "bar",
        // height: 300,
        toolbar: { show: false },
        sparkline: { enabled: false },
      },
      fill: {
        opacity: 1,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          // columnWidth: "100%",
          barHeight: "50%", // mejor que columnWidth en horizontal
          borderRadius: 6,
          borderRadiusApplication: "end",
          dataLabels: { position: "top" },
        },
      },
      legend: {
        show: true,
        position: "bottom",
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number) => `${formatCurrency(value)}`,
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          show: true,
          formatter: (value: number) => `${formatCurrency(value / 1000000)}mln`,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
        },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
          },
        },
      },
      grid: {
        show: true,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: -20 },
      },
    };

    if (chartElRef.current && typeof ApexCharts !== "undefined") {
      // Destruir instancia anterior si existe
      chartRef.current?.destroy();

      // Crear nueva instancia
      chartRef.current = new ApexCharts(chartElRef.current, options);
      chartRef.current.render();
    }

    return () => {
      chartRef.current?.destroy();
    };
  }, [financeMovements, isLoadingFinanceData, series, categories]);

  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <div className="w-full rounded-lg bg-white shadow-sm md:p-6 dark:bg-gray-900">
      <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
        <dl>
          <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
            Balance {dateRange}
          </dt>
          <dd className="text-3xl leading-none font-bold text-gray-900 dark:text-white">
            {formatCurrency(Balance.total)}
          </dd>
        </dl>
        <div>
          {actionButton && (
            <div className="cursor-pointer rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
              {actionButton}
            </div>
          )}
          {!actionButton && (
            <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
              <svg
                className="me-1.5 h-2.5 w-2.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13V1m0 0L1 5m4-4 4 4"
                />
              </svg>
              Profit rate 23.5%
            </span>
          )}
        </div>
      </div>

      <div ref={chartElRef} id="finance-bar-chart" />

      <div className="grid grid-cols-2 items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between pt-5">
          <Dropdown
            label=""
            dismissOnClick={true}
            renderTrigger={() => (
              <span className="text-blue-600">🗓️ Seleccione periodo</span>
            )}
          >
            <DropdownItem
              onClick={() => {
                setDateRange("WTD");
              }}
            >
              Esta semana
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setDateRange("MTD");
              }}
            >
              Este mes
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setDateRange("PREV_MONTH");
              }}
            >
              Mes anterior
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setDateRange("YTD");
              }}
            >
              Este año
            </DropdownItem>
            {/* <DropdownItem
              onClick={() => {
                setDateRange("CUSTOM");
              }}
            >
              Seleccionar Rango
            </DropdownItem> */}
          </Dropdown>
        </div>

        <div className="flex items-center justify-between pt-5"></div>
      </div>
    </div>
  );
};

export default FinanceBarChart;
