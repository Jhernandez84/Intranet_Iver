// app/(dashboard)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import SideBarFilters from "./components/SideBarFilters/SideBarFilters";
import { Datepicker, Dropdown, DropdownItem } from "flowbite-react";
import { ToggleSwitch } from "flowbite-react";
import { useState } from "react";

export default function CoffeeLayout({
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
  const [switch1, setSwitch1] = useState(false);

  const pathname = usePathname();

  return (
    <>
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
          <div className="disable mt-20 inline-flex w-full items-center rounded-lg bg-blue-700 px-4 py-3 text-center text-white dark:bg-blue-600">
            <h1>Filtros</h1>
          </div>
          <div className="m-0 p-0">
            <Dropdown
              className="mt-2 cursor-pointer"
              label="Este mes"
              dismissOnClick={true}
            >
              <DropdownItem
                onClick={() => {
                  setSwitch1(false);
                }}
              >
                El mes anterior
              </DropdownItem>
              <DropdownItem>Esta semana</DropdownItem>
              <DropdownItem>Este año</DropdownItem>
              <DropdownItem
                onClick={() => {
                  setSwitch1(true);
                }}
              >
                Rango de Fecha
              </DropdownItem>
            </Dropdown>
            {/* <Datepicker className="w-[180px] pt-2 pb-2" disabled={!switch1} />
            {/* <p className="">Hasta</p> */}
          </div>
          <Dropdown
            className="mt-2 w-[150px] cursor-pointer"
            label="Estado"
            dismissOnClick={true}
          >
            <DropdownItem></DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownItem>Earnings</DropdownItem>
            <DropdownItem>Sign out</DropdownItem>
          </Dropdown>
          <Dropdown
            className="mt-2 w-[150px] cursor-pointer"
            label="Sede"
            dismissOnClick={false}
          >
            <DropdownItem>Dashboard</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownItem>Earnings</DropdownItem>
            <DropdownItem>Sign out</DropdownItem>
          </Dropdown>
        </ul>
        <div className="text-medium w-full rounded-lg bg-gray-50 p-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {children}
        </div>
      </div>
    </>
  );
}
