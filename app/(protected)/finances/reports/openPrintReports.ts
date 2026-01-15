"use client";

export function openFinanzasPrintReport(
  companyId?: string,
  sedeId?: string,
  from?: string,
  to?: string,
) {
  if (!companyId) return;

  const qs = new URLSearchParams({
    company_id: companyId,
    ...(sedeId ? { sede_id: sedeId } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  });

  window.open(`/finances/reports/print?${qs.toString()}`, "_blank");
}
