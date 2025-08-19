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

// 1. Define el tipo de datos para el usuario
interface UserData {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  sede_id: string;
  // Puedes añadir más campos de tu tabla 'usuarios' aquí
}

// UserContextType incluye user y loading
interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
}

// 2. Crea el contexto
const UserContext = createContext<UserContextType | null>(null);

// 3. Crea el hook personalizado para acceder al contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    // console.log("user is null");
    return { user: null, isLoading: true };
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};

// 4. Crea el componente Provider
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        const { data: userData } = await supabase
          .from("users")
          .select("id, email, full_name, company_id, sede_id")
          .eq("id", supabaseUser.id)
          .single();

        if (userData) {
          setUser(userData);
          setIsLoading(false); // ✅ Marca como completada la carga
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
