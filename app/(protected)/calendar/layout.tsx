// app/(dashboard)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Datepicker } from "flowbite-react";
import { useCalendarView } from "./_Context/CalendarContext";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { view, setView } = useCalendarView();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const pathname = usePathname();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <>
      <div className="grid h-[calc(100vh-70px)] grid-rows-[70px_1fr] p-2">
        <div className="inline-flex h-[50px] w-full rounded bg-[#1F2937] dark:bg-gray-800">
          <div className="inline-flex rounded-md p-2 shadow-xs" role="group">
            <p>Navegación Fecha</p>
          </div>
          <div className="inline-flex rounded-md p-2 shadow-xs" role="group">
            <button
              type="button"
              onClick={() => setView("Daily")}
              className={`cursor-pointer rounded-s-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 ${view === "Daily" ? "text-blue-400" : "text-gray-900"}`}
            >
              Día
            </button>
            <button
              onClick={() => setView("Week")}
              type="button"
              className="cursor-pointer border-t border-b border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
            >
              Semana
            </button>
            <button
              onClick={() => setView("Month")}
              type="button"
              className="cursor-pointer border border-b border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
            >
              Mes
            </button>
            <button
              onClick={() => setView("Year")}
              type="button"
              className="cursor-pointer rounded-e-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
            >
              Año
            </button>
          </div>
          <div className="inline-flex rounded-md p-2 shadow-xs" role="group">
            <button
              type="button"
              onClick={() => alert("Nuevo Evento")}
              className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mr-2 hidden cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:ring-4 focus:outline-none sm:inline-flex"
            >
              <svg
                aria-hidden="true"
                className="mr-1 -ml-1 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>{" "}
              Agregar Evento
            </button>
          </div>
        </div>
        <section className="h-full overflow-auto rounded bg-gray-800 p-2 text-white">
          {children}
        </section>
      </div>
    </>
  );
}
