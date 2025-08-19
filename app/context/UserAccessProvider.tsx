// app/(dashboard)/components/UserProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "./UserProvider";

// 1) Tipos locales para el resultado del SELECT
type MenuItem = {
  key: string | null;
  name: string | null;
  path: string | null;
};

type UserAccessRow = {
  menu_item_id: string;
  menu_items: MenuItem | null;
};

// 2) El contexto
interface UserAccess {
  menu_item_id: string;
  key: string | null;
  name: string | null;
  path: string | null;
}
interface UserAccessContextType {
  access: UserAccess[] | null;
  isLoadingAccess: boolean;
}

const UserAccessContext = createContext<UserAccessContextType | null>(null);

export const useUserAccess = () => {
  const context = useContext(UserAccessContext);
  if (context === null) {
    console.warn("UserAccessContext is null");
    return { access: null, isLoadingAccess: true } as const;
  }
  return context;
};

// ⚠️ Revisa: tienes escrito "UserAcessProvider" (sin la 'c')
export const UserAccessProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useUser();

  const [access, setAccess] = useState<UserAccess[] | null>(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isLoading || !user) return;

    const loadAccess = async () => {
      setIsLoadingAccess(true);

      const { data: rawAccess, error } = await supabase
        .from("user_access")
        .select(
          `
            menu_item_id,
            menu_items (
              name,
              path,
              key
            )
          `,
        )
        .eq("user_id", user.id)
        .returns<UserAccessRow[]>(); // ← Tipamos el resultado del query

      if (error) {
        console.error("Error loading access:", error.message);
        setAccess([]);
        setIsLoadingAccess(false);
        return;
      }

      const mapped: UserAccess[] =
        rawAccess?.map((item) => ({
          menu_item_id: item.menu_item_id,
          key: item.menu_items?.key ?? null,
          name: item.menu_items?.name ?? null,
          path: item.menu_items?.path ?? null,
        })) ?? [];

      setAccess(mapped);
      setIsLoadingAccess(false);
    };

    loadAccess();
  }, [isLoading, user, supabase]);

  return (
    <UserAccessContext.Provider value={{ access, isLoadingAccess }}>
      {children}
    </UserAccessContext.Provider>
  );
};
