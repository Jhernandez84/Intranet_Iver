"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "../../../context/UserProvider";

interface FinanceMovements {
  id: string;
  company_id: string;
  responsable_id: string;
  fecha: string;
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  observaciones: string;
  mov_grupo: string;
  num_doc: string;
  monto: number;
  estado: string;
  sede_id: string;
  sede_nombre: string;
}

interface FinanceAccessContextType {
  financeMovements: FinanceMovements[] | null;
  isLoadingFinanceData: boolean;
  refreshFinanceMovements: () => Promise<void>; // ← agregar función
}

// 👇 aquí ya no es un array, es un objeto
const CompanyFinanceContext = createContext<FinanceAccessContextType | null>(
  null,
);

// Hook para usar el contexto
export const useFinanceData = () => {
  const context = useContext(CompanyFinanceContext);
  if (context === null) {
    // console.log("Access is null");
    return {
      financeMovements: null,
      isLoadingFinanceData: false,
      refreshFinanceMovements: async () => {},
    };
  }
  return context;
};

// Provider
export const CompanyFinanceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isLoading } = useUser();
  const [isLoadingFinanceData, setIsLoadingFinanceData] = useState(true);
  const [financeMovements, setFinanceMovements] = useState<
    FinanceMovements[] | null
  >(null);

  const supabase = createClientComponentClient();

  const getFinanceMovements = async (filters: {
    fromDate?: string | null;
    toDate?: string | null;
    tipo?: string | null;
    tipoMov?: string | null;
    metodoPago?: string | null;
  }) => {
    if (isLoading || !user) return;
    setIsLoadingFinanceData(true);

    const { data, error } = await supabase.rpc("finanzas_buscar", {
      p_company_id: user.company_id,
      p_sede_id: user.sede_id ?? null,
      p_fecha_desde: filters.fromDate ?? null,
      p_fecha_hasta: filters.toDate ?? null,
      p_tipo: filters.tipo ?? null,
      p_tipo_mov: filters.tipoMov ?? null,
      p_metodo_pago: filters.metodoPago ?? null,
    });

    if (error) {
      console.error("Error loading finance data:", error.message);
    }

    setFinanceMovements(data ?? []);
    setIsLoadingFinanceData(false);
  };

  useEffect(() => {
    getFinanceMovements({
      fromDate: "2025-09-01", // 👈 defaults
      toDate: new Date().toISOString().split("T")[0],
    });
  }, [user, isLoading, supabase]);

  const refreshFinanceMovements = async () => {
    await getFinanceMovements({
      fromDate: "2025-01-01", // 👈 defaults
      toDate: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <CompanyFinanceContext.Provider
      value={{
        financeMovements,
        isLoadingFinanceData,
        refreshFinanceMovements,
      }}
    >
      {children}
    </CompanyFinanceContext.Provider>
  );
};
