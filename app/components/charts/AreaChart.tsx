"use client";

import { useEffect } from "react";
import ApexCharts from "apexcharts";

const AreaChart = () => {
  useEffect(() => {
    const options = {
      chart: {
        height: "300",
        // with: 800,
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0,
        },
      },
      series: [
        {
          name: "New users",
          data: [6500, 6418, 6456, 6526, 6356, 6456],
          color: "#1A56DB",
        },
      ],
      xaxis: {
        categories: [
          "01 February",
          "02 February",
          "03 February",
          "04 February",
          "05 February",
          "06 February",
          "07 February",
        ],
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
    };

    const chartContainer = document.getElementById("area-chart");

    if (chartContainer && typeof ApexCharts !== "undefined") {
      const chart = new ApexCharts(chartContainer, options);
      chart.render();

      return () => {
        chart.destroy(); // cleanup when component unmounts
      };
    }
  }, []);

  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-sm md:p-6 dark:bg-gray-800">
      <div className="flex justify-between">
        <div>
          <h5 className="pb-2 text-3xl leading-none font-bold text-gray-900 dark:text-white">
            32.4k
          </h5>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">
            Users this week
          </p>
        </div>
        <div className="flex items-center px-2.5 py-0.5 text-center text-base font-semibold text-green-500 dark:text-green-500">
          12%
          <svg
            className="ms-1 h-3 w-3"
            aria-hidden="true"
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
        </div>
      </div>

      <div id="area-chart" className="h-64 w-full"></div>

      <div className="grid grid-cols-1 items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between pt-5">
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="lastDaysdropdown"
            data-dropdown-placement="bottom"
            className="inline-flex items-center text-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            type="button"
          >
            Last 7 days
            <svg
              className="m-2.5 ms-1.5 w-2.5"
              aria-hidden="true"
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

          <div
            id="lastDaysdropdown"
            className="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700"
          >
            {/* Dropdown list */}
          </div>

          <a
            href="#"
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 uppercase hover:bg-gray-100 hover:text-blue-700 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-blue-500 dark:focus:ring-gray-700"
          >
            Users Report
            <svg
              className="ms-1.5 h-2.5 w-2.5 rtl:rotate-180"
              aria-hidden="true"
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

export default AreaChart;
