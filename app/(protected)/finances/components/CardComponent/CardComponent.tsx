"use client";

import { initFlowbite } from "flowbite";
import { useEffect } from "react";

export default function CardComponent() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div className="w-full rounded-lg bg-white shadow-sm md:p-6 dark:bg-gray-900">
        <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <dl>
            <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
              Movimientos último mes
            </dt>
            <dd className="text-3xl leading-none font-bold text-gray-900 dark:text-white">
              $5,405
            </dd>
          </dl>
          <div>
            <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
              <svg
                className="me-1.5 h-2.5 w-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13V1m0 0L1 5m4-4 4 4"
                />
              </svg>
              Profit rate 23.5%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 py-3">
          <dl>
            <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
              Ingresos
            </dt>
            <dd className="text-xl leading-none font-bold text-green-500 dark:text-green-400">
              $23,635
            </dd>
          </dl>
          <dl>
            <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
              Gastos
            </dt>
            <dd className="text-xl leading-none font-bold text-red-600 dark:text-red-500">
              -$18,230
            </dd>
          </dl>
        </div>
        <div className="grid grid-cols-1 items-center justify-between border-t border-gray-200 dark:border-gray-700">
          Detalle de los principales movimientos
        </div>
      </div>
    </>
  );
}
