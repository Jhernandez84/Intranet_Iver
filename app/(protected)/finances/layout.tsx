"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CompanyFinanceProvider,
  useFinanceData,
} from "./_Context/FinancesProvider";
import { CompanyFinanceMovementsTypeProvider } from "./_Context/FinancesMovementsProvider";

// 1. Definimos la interfaz para los items de navegación
interface FinanceAccessItem {
  Menu: string;
  hRef: string;
  svgPath: string;
}

/**
 * COMPONENTE INTERNO
 */
function FinancesLayoutContent({
  children,
  financesAccess,
}: {
  children: React.ReactNode;
  financesAccess: FinanceAccessItem[]; // Reemplazamos any[] por la interfaz
}) {
  const pathname = usePathname();

  // Consumimos el contexto (ahora disponible por estar envuelto en el Provider)
  const { isLoadingFinanceData } = useFinanceData();

  return (
    <div className="h-[calc(100vh-70px)] p-2 md:flex">
      {/* Navegación Lateral */}
      <ul className="flex-column mb-4 w-full space-y-4 text-sm font-medium text-gray-500 md:me-4 md:mb-0 md:w-64 dark:text-gray-400">
        {financesAccess.map((access) => {
          const isActive = pathname === access.hRef;

          const linkClasses = `
            inline-flex w-full items-center rounded-lg px-4 py-3 transition-colors
            ${
              isActive
                ? "bg-blue-700 text-white dark:bg-blue-600 cursor-default"
                : "bg-gray-50 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
            }
          `;

          return (
            <li key={access.hRef}>
              <Link href={access.hRef} className={linkClasses}>
                <svg
                  className={`me-2 h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d={access.svgPath}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {access.Menu}
                {/* 5. Agregamos un indicador visual de carga si es necesario */}
                {isLoadingFinanceData && isActive && (
                  <span className="ms-2 h-2 w-2 animate-ping rounded-full bg-blue-300"></span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Área de Contenido Principal */}
      <div className="w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
}

/**
 * EXPORT PRINCIPAL
 */
export default function FinancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 3. Tipamos la constante de accesos
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
        "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
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
