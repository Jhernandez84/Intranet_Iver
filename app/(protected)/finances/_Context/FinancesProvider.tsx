"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "../../../context/UserProvider";
import { useCallback } from "react";

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

export interface FinanceFilters {
  fromDate?: string | null;
  toDate?: string | null;
  tipo?: string | null;
  tipo_mov?: string | null;
  metodo_pago?: string | null;
  observaciones: string;
  sede_id: string | null;
  sortConfig: { key: string; direction: "asc" | "desc" | null };
  [key: string]: unknown;
}

interface FinanceAccessContextType {
  financeMovements: FinanceMovements[] | null;
  isLoadingFinanceData: boolean;
  filters: FinanceFilters;
  setFilters: (filters: Partial<FinanceFilters>) => void;
  refreshFinanceMovements: () => Promise<void>;
}

const CompanyFinanceContext = createContext<FinanceAccessContextType | null>(
  null,
);

const getFirstDayOfMonth = () =>
  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];
const getToday = () => new Date().toISOString().split("T")[0];

export const CompanyFinanceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isLoading } = useUser();
  const supabase = createClientComponentClient();

  const [isLoadingFinanceData, setIsLoadingFinanceData] = useState(true);
  const [rawMovements, setRawMovements] = useState<FinanceMovements[] | null>(
    null,
  );

  const [filters, setFiltersState] = useState<FinanceFilters>({
    fromDate: getFirstDayOfMonth(),
    toDate: getToday(),
    tipo: null,
    tipo_mov: null,
    metodo_pago: null,
    observaciones: "",
    sede_id: null,
    sortConfig: { key: "fecha", direction: "desc" },
  });

  const setFilters = (newFilters: Partial<FinanceFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  // 2. Corregimos el error de dependencia envolviendo fetch en useCallback
  const fetchFromSupabase = useCallback(async () => {
    if (isLoading || !user) return;
    setIsLoadingFinanceData(true);

    const { data, error } = await supabase.rpc("finanzas_buscar", {
      p_company_id: user.company_id,
      p_sede_id: user.sede_id ?? null,
      p_fecha_desde: filters.fromDate,
      p_fecha_hasta: filters.toDate,
      p_tipo: null,
      p_tipo_mov: null,
      p_metodo_pago: null,
    });

    if (error) console.error("Error:", error.message);
    setRawMovements(data ?? []);
    setIsLoadingFinanceData(false);
  }, [user, isLoading, filters.fromDate, filters.toDate, supabase]);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO LOCAL ---
  const filteredMovements = useMemo(() => {
    if (!rawMovements) return null;

    // 3. Cambiamos a 'let' porque 'result' se reasigna al ordenar
    let result = rawMovements.filter((mov) => {
      const matchTipo = !filters.tipo || mov.tipo === filters.tipo;
      const matchMetodo =
        !filters.metodo_pago || mov.metodo_pago === filters.metodo_pago;
      const matchTipoMov =
        !filters.tipo_mov || mov.tipo_mov === filters.tipo_mov;
      const matchSede =
        !filters.sede_id || String(mov.sede_id) === String(filters.sede_id);
      return matchTipo && matchMetodo && matchTipoMov && matchSede;
    });

    const { key, direction } = filters.sortConfig;
    if (direction && key) {
      // 4. Quitamos los @ts-ignore y usamos casting de tipo seguro
      result = [...result].sort((a, b) => {
        const aValue = a[key as keyof FinanceMovements];
        const bValue = b[key as keyof FinanceMovements];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        return direction === "asc" ? 1 : -1;
      });
    }

    return result;
  }, [rawMovements, filters]);

  useEffect(() => {
    if (!isLoading && user) {
      fetchFromSupabase();
    }
  }, [fetchFromSupabase, isLoading, user]); // ✅ fetchFromSupabase ahora es una dependencia válida

  return (
    <CompanyFinanceContext.Provider
      value={{
        financeMovements: filteredMovements,
        isLoadingFinanceData,
        filters,
        setFilters,
        refreshFinanceMovements: fetchFromSupabase,
      }}
    >
      {children}
    </CompanyFinanceContext.Provider>
  );
};

export const useFinanceData = () => {
  const context = useContext(CompanyFinanceContext);
  if (!context) throw new Error("useFinanceData must be used within Provider");
  return context;
};
