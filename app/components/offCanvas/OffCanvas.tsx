// src/components/SideDrawer.tsx
"use client";

import { useEffect } from "react";
import { initFlowbite } from "flowbite";

export default function SideDrawer() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <button
        type="button"
        data-drawer-target="drawer-example"
        data-drawer-show="drawer-example"
        aria-controls="drawer-example"
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
      >
        Abrir menú lateral
      </button>

      <div
        id="drawer-example"
        className="fixed top-0 left-0 z-40 h-screen w-80 -translate-x-full overflow-y-auto bg-white p-4 transition-transform dark:bg-gray-800"
        tabIndex={-1}
        aria-labelledby="drawer-label"
      >
        <h5
          id="drawer-label"
          className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          Menú lateral
        </h5>
        <button
          type="button"
          data-drawer-hide="drawer-example"
          aria-controls="drawer-example"
          className="absolute top-2.5 right-2.5 rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="overflow-y-auto py-4">
          <ul className="space-y-2 font-medium">
            <li>
              <a href="#" className="text-gray-900 dark:text-white">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-900 dark:text-white">
                Ajustes
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
