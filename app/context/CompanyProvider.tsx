// app/(dashboard)/components/UserProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // O @supabase/ssr
import { useUser } from "./UserProvider";

// 1. Define el tipo de datos para el usuario
interface CompanyData {
  id: string;
  name: string;
  subscription_status: string;
  // Puedes añadir más campos de tu tabla 'usuarios' aquí
}

interface CompanyContextType {
  companyData: CompanyData | null;
  isLoadingCompany: boolean;
}

// 2. Crea el contexto
const CompanyContext = createContext<CompanyContextType | null>(null);

// 3. Crea el hook personalizado para acceder al contexto
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === null) {
    console.log("Company is null");
    return { companyData: null, isLoadingCompany: true };
  }
  return context;
};

// 4. Crea el componente Provider
export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useUser();

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Función para cargar los datos del usuario
    if (isLoading || !user) return; // ⛔️ Espera a que cargue

    const loadCompany = async () => {
      setIsLoadingCompany(true); // ✅ comienza carga

      // const {
      //   data: { user: supabaseUser },
      // } = await supabase.auth.getUser();

      if (user) {
        // Asume que la tabla se llama 'usuarios' y tiene una columna 'id_supabase'
        const { data: companyData } = await supabase
          .from("companies")
          .select("id, name, subscription_status")
          .eq("id", user.company_id)
          .single();

        if (companyData) {
          setCompanyData(companyData);
          setIsLoadingCompany(false); // ✅ termina carga
        }
      } else {
        setCompanyData(null);
      }
    };

    loadCompany();
  }, [isLoading, user]);

  return (
    <CompanyContext.Provider value={{ companyData, isLoadingCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};
