// app/(dashboard)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import SideBarFilters from "./components/SideBarFilters/SideBarFilters";
import { Datepicker, Dropdown, DropdownItem } from "flowbite-react";
import { useState } from "react";
import {
  CompanyFinanceProvider,
  useFinanceData,
} from "./_Context/FinancesProvider";
import { CompanyFinanceMovementsTypeProvider } from "./_Context/FinancesMovementsProvider";

export default function FinancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const FinancesAccess = [
    {
      Menu: "Dashboard",
      hRef: "/finances",
      svgPath:
        "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
      isActive: "",
    },
    {
      Menu: "Reportes",
      hRef: "/finances/reports",
      svgPath:
        "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
      isActive: "",
    },
    {
      Menu: "Ajustes",
      hRef: "/finances/settings",
      svgPath:
        "M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5",
    },
  ];

  const pathname = usePathname();

  const financeMovements = useFinanceData();

  console.log(financeMovements);

  return (
    <>
      <CompanyFinanceProvider>
        <CompanyFinanceMovementsTypeProvider>
          <div className="h-[calc(100vh-70px)] p-2 md:flex">
            <ul className="active flex-column space-y mb-4 space-y-4 text-sm font-medium text-gray-500 md:me-4 md:mb-0 dark:text-gray-400">
              <button
                id="toggleSidebar"
                aria-expanded="true"
                data-drawer-target="drawer-navigation"
                data-drawer-show="drawer-navigation"
                aria-controls="drawer-navigation"
                className="mr-3 hidden cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:inline dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 12"
                >
                  {" "}
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 1h14M1 6h14M1 11h7"
                  />{" "}
                </svg>
              </button>
              <SideBarFilters />
              {FinancesAccess.map((access) => {
                const isActive = pathname === access.hRef;

                const linkClasses = `
            inline-flex w-full items-center rounded-lg px-4 py-3
            ${
              isActive
                ? "bg-blue-700 text-white dark:bg-blue-600 disable"
                : "bg-gray-50 hover:bg-gray-400 hover:text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-900 dark:hover:text-white"
            }
          `;

                return (
                  <li key={access.hRef}>
                    <Link href={access.hRef} className={linkClasses}>
                      <svg
                        className="me-2 size-4 h-4 w-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        // className="mx-auto size-6"
                      >
                        <path d={access.svgPath} />
                      </svg>
                      {access.Menu}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="text-medium w-full rounded-lg bg-gray-50 p-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {children}
            </div>
          </div>
        </CompanyFinanceMovementsTypeProvider>
      </CompanyFinanceProvider>
    </>
  );
}
