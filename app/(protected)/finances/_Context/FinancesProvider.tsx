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
}

interface FinanceAccessContextType {
  financeMovements: FinanceMovements[] | null;
  isLoadingFinanceData: boolean;
}

// 👇 aquí ya no es un array, es un objeto
const CompanyFinanceContext = createContext<FinanceAccessContextType | null>(
  null,
);

// Hook para usar el contexto
export const useFinanceData = () => {
  const context = useContext(CompanyFinanceContext);
  if (context === null) {
    console.log("Access is null");
    return { financeMovements: null, isLoadingFinanceData: false };
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

  useEffect(() => {
    const getFinanceMovements = async () => {
      if (isLoading || !user) return;
      setIsLoadingFinanceData(true);

      let query = supabase
        .from("finanzas")
        .select(
          "id, company_id, responsable_id, fecha, tipo, tipo_mov, metodo_pago, observaciones, mov_grupo, num_doc, monto, estado, sede_id",
        )
        .eq("company_id", user.company_id);

      if (user?.sede_id) {
        query = query.eq("sede_id", user.sede_id);
      }

      const { data: financeData, error } = await query;
      if (error) {
        console.error("Error loading finance data:", error.message);
      }

      setFinanceMovements(financeData ?? []);
      setIsLoadingFinanceData(false);
    };

    getFinanceMovements();
  }, [user, isLoading, supabase]);

  console.log("Movimientos:", financeMovements);

  return (
    <CompanyFinanceContext.Provider
      value={{ financeMovements, isLoadingFinanceData }}
    >
      {children}
    </CompanyFinanceContext.Provider>
  );
};
