"use client";

import { useState } from "react";
import { useFinanceData } from "../../_Context/FinancesProvider";
// Importa tus componentes aquí (ajusta las rutas según tu proyecto)
import ExcelUploader from "../../helper/ExcelUploader";
// import { FinanceFiltersComponent } from "@/components/movements/FinanceFiltersComponent";

export default function TabComponent() {
  const [activeTab, setActiveTab] = useState("Movimientos");
  const { filters, setFilters, isLoadingFinanceData } = useFinanceData();

  const tabs = [
    {
      name: "Movimientos",
      icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    },
    {
      name: "POS",
      icon: "M9.143 4H4.857A.857.857 0 0 0 4 4.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 10 9.143V4.857A.857.857 0 0 0 9.143 4Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 20 9.143V4.857A.857.857 0 0 0 19.143 4Zm-10 10H4.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286A.857.857 0 0 0 9.143 14Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z",
    },
    {
      name: "Conciliación",
      icon: "M9.143 4H4.857A.857.857 0 0 0 4 4.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 10 9.143V4.857A.857.857 0 0 0 9.143 4Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 20 9.143V4.857A.857.857 0 0 0 19.143 4Zm-10 10H4.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286A.857.857 0 0 0 9.143 14Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z",
    },
    {
      name: "Carga Masiva",
      icon: "M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4",
    },
    {
      name: "Ajustes",
      icon: "M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2",
    },
  ];

  // Renderizado condicional según el tab activo
  const renderContent = () => {
    switch (activeTab) {
      case "Movimientos":
        return (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Detalle de Movimientos</h1>
            {/* Aquí iría tu tabla de movimientos */}
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <p className="text-gray-500">
                Mostrando datos desde {filters.fromDate} hasta {filters.toDate}
              </p>
            </div>
          </div>
        );
      case "Conciliación":
        return <h1>Módulo de Conciliación Bancaria</h1>;
      case "Carga Masiva":
        return (
          <div className="mx-auto max-w-xl py-10">
            <ExcelUploader companyId="1" />
          </div>
        );
      case "Ajustes":
        return <h1>Configuración de Sedes y Cuentas</h1>;
      default:
        return null;
    }
  };

  return (
    <div className="flex w-full flex-col">
      {/* NAVEGACIÓN DE TABS */}
      <div className="border-default mb-6 border-b">
        <ul className="text-body -mb-px flex flex-wrap text-center text-sm font-medium">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <li key={tab.name} className="me-2">
                <button
                  onClick={() => setActiveTab(tab.name)}
                  className={`group rounded-t-base inline-flex cursor-pointer items-center justify-center border-b-2 p-4 transition-all duration-200 ${
                    isActive
                      ? "border-brand rounded-t-lg bg-gray-900 text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <svg
                    className={`me-2 h-4 w-4 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={tab.icon}
                    />
                  </svg>
                  {tab.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CONTENIDO DEL TAB */}
      <div className="animate-in fade-in p-4 transition-opacity duration-300">
        {renderContent()}
      </div>
    </div>
  );
}
