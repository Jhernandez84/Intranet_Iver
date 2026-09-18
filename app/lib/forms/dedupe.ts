// Normaliza el valor de un campo (rut, email, etc.) para usarlo como llave
// de detección de duplicados: mismo formato sin importar mayúsculas, puntos
// o guiones que la persona haya tipeado distinto entre un envío y otro.
export function normalizeDedupeKey(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const str = String(value).trim().toLowerCase();
  if (str.length === 0) return null;

  // rut chileno: quita puntos y guion (12.345.678-9 -> 123456789)
  return str.replace(/[.\-\s]/g, "");
}
