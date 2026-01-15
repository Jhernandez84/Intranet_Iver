"use client";

export function exportFinanzasPDF(companyId?: string, sedeId?: string) {
  if (!companyId) return;

  const qs = new URLSearchParams({
    company_id: companyId,
    ...(sedeId ? { sede_id: sedeId } : {}),
  });

  window.open(`/finances/exportData/pdf?${qs.toString()}`, "_blank");
}
