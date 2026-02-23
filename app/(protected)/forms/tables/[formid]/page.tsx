"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Definimos el tipo de dato para las filas de la tabla
interface FormResponse {
  [key: string]: string | number | boolean | null | undefined;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function FormsPageDashboard() {
  const params = useParams();
  // Forzamos a que reconozca formid como string si existe
  const formId = typeof params?.formid === "string" ? params.formid : "";

  const [data, setData] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!formId) return;

      setLoading(true);
      try {
        const { data: responses, error } = await supabase
          .from("temp_registros")
          .select("name,last_name,phone,age")
          .eq("event_name", formId);

        if (error) throw error;
        // Casteamos el resultado al tipo definido
        setData((responses as FormResponse[]) || []);
      } catch (err) {
        console.error("Error cargando Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [formId]);

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="mx-auto w-full">
        <header className="mb-6 px-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Resultados:{" "}
            <span className="font-mono text-blue-600">{formId}</span> |{" "}
            {data.length} Inscritos
          </h1>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-500 italic">
            Cargando registros...
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No se encontraron registros.
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="max-h-[calc(100vh-200px)] w-full overflow-auto">
              <table className="w-full min-w-full table-auto border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(data[0]).map((key) => (
                      <th
                        key={key}
                        className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100 px-6 py-4 text-xs font-black whitespace-nowrap text-gray-700 uppercase shadow-sm"
                      >
                        {key.replace("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.map((row, i) => (
                    <tr
                      key={i}
                      className="group transition-colors hover:bg-blue-50/40"
                    >
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="px-6 py-3 whitespace-nowrap text-gray-600 group-hover:text-blue-700"
                        >
                          {val !== null && val !== undefined
                            ? String(val)
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
