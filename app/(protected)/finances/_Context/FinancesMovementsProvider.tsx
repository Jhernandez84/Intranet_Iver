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
  descripcion: string;
  activo: boolean;
  tipo_mov_contable: string;
  tipo_mov_generico: string;
  tipo_movimiento: string;
  tipo_mov_clase: string;
}

interface FinanceMovementsContextType {
  financeMovementTypes: FinanceMovements[] | null;
  isLoadingFinanceData: boolean;
}

// 👇 aquí ya no es un array, es un objeto
const FinanceMovementsContext =
  createContext<FinanceMovementsContextType | null>(null);

// Hook para usar el contexto
export const useFinanceMovementsType = () => {
  const context = useContext(FinanceMovementsContext);
  if (context === null) {
    console.log("Access to financeMovementTypes is null");
    return { financeMovementTypes: null, isLoadingFinanceData: false };
  }
  return context;
};

// Provider
export const CompanyFinanceMovementsTypeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isLoading } = useUser();
  const [isLoadingFinanceData, setIsLoadingFinanceData] = useState(true);
  const [financeMovementTypes, setFinanceMovementTypes] = useState<
    FinanceMovements[] | null
  >(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getFinanceMovementsTypes = async () => {
      if (isLoading || !user) return;
      setIsLoadingFinanceData(true);

      const query = supabase
        .from("tipos_movimiento")
        .select(
          "id, descripcion, company_id, activo, tipo_mov_contable, tipo_mov_generico, tipo_movimiento, tipo_mov_clase",
        )
        .eq("company_id", user.company_id);

      const { data: financeData, error } = await query;
      if (error) {
        console.error("Error loading finance data:", error.message);
      }

      setFinanceMovementTypes(financeData ?? []);
      setIsLoadingFinanceData(false);
    };

    getFinanceMovementsTypes();
  }, [user, isLoading, supabase]);

  console.log("Movimientos:", financeMovementTypes);

  return (
    <FinanceMovementsContext.Provider
      value={{ financeMovementTypes, isLoadingFinanceData }}
    >
      {children}
    </FinanceMovementsContext.Provider>
  );
};
