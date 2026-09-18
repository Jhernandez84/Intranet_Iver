// hooks/useSignOut.ts
"use client";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export function useSignOut() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return { handleSignOut };
}
