"use client";
import { createClient } from "../../../lib/supabase/client";
import { useEffect, useState } from "react";

export async function getTempCount(formid: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("temp_registros")
    .select("rut", { count: "exact", head: true })
    .eq("ivercapacita", formid);

  if (error) throw error;
  return count ?? 0;
}

export default function InscritosCount({ formid }: { formid: string }) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    getTempCount(formid)
      .then((c) => alive && setN(c))
      .catch(() => alive && setN(0));
    return () => {
      alive = false;
    };
  }, [formid]);

  return <span>{n ?? 0}</span>; // ← devuelve JSX, no un objeto
}
