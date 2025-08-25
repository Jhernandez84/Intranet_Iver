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

// // 1. Define el tipo de datos para el acceso del usuario
interface BranchesAccess {
  id: string;
  nombre: string;
}
[];

// 2. Crea el contexto
const CompanyBranchesContext = createContext<BranchesAccess[] | null>(null);

// 3. Crea el hook personalizado para acceder al contexto
export const useCompanyBranchesAccess = () => {
  const context = useContext(CompanyBranchesContext);
  if (context === null) {
    console.log("Access is null");
    return [];
    // throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};

// 4. Crea el componente Provider
export const CompanyBranchesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isLoading } = useUser();

  const [branches, setBranches] = useState<BranchesAccess[] | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Función para cargar los datos del usuario
    const loadCompanyBranches = async () => {
      if (isLoading || !user) return; // ⛔️ Espera a que cargue

      if (user?.sede_id) {
        // 🔍 Trae SOLO la sede específica asignada al usuario
        const { data: rawAccess, error } = await supabase
          .from("sedes")
          .select("id, nombre")
          .eq("company_id", user.company_id)
          .eq("id", user.sede_id); // 👈 filtro adicional

        const branchesAccess =
          rawAccess?.map((item: BranchesAccess) => ({
            id: item.id,
            nombre: item.nombre,
          })) ?? [];

        setBranches(branchesAccess);
      } else {
        // 🔍 Trae TODAS las sedes de la empresa
        const { data: rawAccess, error } = await supabase
          .from("sedes")
          .select("id, nombre")
          .eq("company_id", user.company_id);

        const branchesAccess =
          rawAccess?.map((item: BranchesAccess) => ({
            id: item.id,
            nombre: item.nombre,
          })) ?? [];

        setBranches(branchesAccess);
      }
    };

    loadCompanyBranches();
  }, [user]);

  return (
    <CompanyBranchesContext.Provider value={branches}>
      {children}
    </CompanyBranchesContext.Provider>
  );
};
