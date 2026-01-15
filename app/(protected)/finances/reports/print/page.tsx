"use client";

import { useEffect } from "react";

export default function PrintPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const company_id =
    typeof searchParams?.company_id === "string"
      ? searchParams.company_id
      : undefined;
  const sede_id =
    typeof searchParams?.sede_id === "string"
      ? searchParams.sede_id
      : undefined;
  const from =
    typeof searchParams?.from === "string" ? searchParams.from : undefined;
  const to = typeof searchParams?.to === "string" ? searchParams.to : undefined;

  useEffect(() => {
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Reporte de Finanzas</h1>

      <p>
        <strong>Empresa:</strong> {company_id ?? "—"}
      </p>
      {sede_id && (
        <p>
          <strong>Sede:</strong> {sede_id}
        </p>
      )}
      {(from || to) && (
        <p>
          <strong>Período:</strong> {from ?? "—"} a {to ?? "—"}
        </p>
      )}

      <hr />

      <p>Print OK (aquí conectas tu tabla real)</p>
    </div>
  );
}
