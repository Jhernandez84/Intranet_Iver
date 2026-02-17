"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CompanyFinanceProvider,
  useFinanceData,
} from "./_Context/FinancesProvider";
import { CompanyFinanceMovementsTypeProvider } from "./_Context/FinancesMovementsProvider";
import { Datepicker } from "flowbite-react";
import { FinanceFiltersComponent } from "./components/Filters/FinancesFilters";

interface FinanceAccessItem {
  Menu: string;
  hRef: string;
  svgPath: string;
}

/**
 * COMPONENTE INTERNO: Maneja la UI y el consumo de Contexto
 */
function FinancesLayoutContent({
  children,
  financesAccess,
}: {
  children: React.ReactNode;
  financesAccess: FinanceAccessItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="h-[calc(100vh-70px)] p-2 md:flex">
      {/* Navegación Lateral */}
      <aside className="flex w-full flex-col border-r border-gray-100 pr-2 md:me-4 md:w-64 dark:border-gray-700">
        {/* 1. Menú superior */}
        <ul className="space-y-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          {financesAccess.map((access) => {
            const isActive = pathname === access.hRef;
            return (
              <li key={access.hRef}>
                <Link
                  href={access.hRef}
                  className={`inline-flex w-full items-center rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white shadow-md"
                      : "bg-gray-900 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-900"
                  }`}
                >
                  <svg
                    className="me-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d={access.svgPath}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  {access.Menu}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 2. ESPACIADOR FLEXIBLE (Empuja los filtros a la mitad) */}
        <FinanceFiltersComponent />
      </aside>

      {/* Área de Contenido Principal */}
      <main className="w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        {children}
      </main>
    </div>
  );
}

/**
 * EXPORT PRINCIPAL: Envuelve todo con los Providers necesarios
 */
export default function FinancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const FinancesAccess: FinanceAccessItem[] = [
    {
      Menu: "Dashboard",
      hRef: "/finances",
      svgPath:
        "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
    },
    {
      Menu: "Reportes",
      hRef: "/finances/reports",
      svgPath:
        "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    },
    {
      Menu: "Bancos",
      hRef: "/finances/accounts",
      svgPath:
        "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    },
    {
      Menu: "Ajustes",
      hRef: "/finances/settings",
      svgPath:
        "M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5",
    },
  ];

  return (
    <CompanyFinanceProvider>
      <CompanyFinanceMovementsTypeProvider>
        <FinancesLayoutContent financesAccess={FinancesAccess}>
          {children}
        </FinancesLayoutContent>
      </CompanyFinanceMovementsTypeProvider>
    </CompanyFinanceProvider>
  );
}
