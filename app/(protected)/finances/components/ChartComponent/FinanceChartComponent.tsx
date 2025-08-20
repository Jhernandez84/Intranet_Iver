"use client";

import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const FinanceBarChart = () => {
  const chartRef = useRef<ApexCharts | null>(null);
  const chartElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const options = {
      series: [
        {
          name: "Income",
          color: "#31C48D",
          data: [1420, 1620, 1820],
        },
        {
          name: "Expense",
          color: "#F05252",
          data: [788, 810, 866],
        },
      ],
      chart: {
        type: "bar",
        height: 320,
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
          formatter: (value: number) => `$${value}`,
        },
      },
      xaxis: {
        categories: ["Jul", "Aug", "Sep"],
        labels: {
          show: true,
          formatter: (value: string) => `$${value}`,
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
  }, []);

  return (
    <div className="h-full w-full rounded-lg bg-white p-4 shadow-sm md:p-6 dark:bg-gray-900">
      <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
        <dl>
          <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
            Profit
          </dt>
          <dd className="text-3xl leading-none font-bold text-gray-900 dark:text-white">
            $5,405
          </dd>
        </dl>
        <div>
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
        </div>
      </div>

      <div ref={chartElRef} id="finance-bar-chart" />

      <div className="grid grid-cols-1 items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between pt-5">
          <button
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            type="button"
          >
            Last 6 months
            <svg
              className="m-2.5 ms-1.5 w-2.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <a
            href="#"
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 uppercase hover:bg-gray-100 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-500"
          >
            Revenue Report
            <svg
              className="ms-1.5 h-2.5 w-2.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FinanceBarChart;
