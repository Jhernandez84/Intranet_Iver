export function formatTableData<T extends object>(
  data: T[],
  keys: readonly (keyof T)[],
): { headers: string[]; rows: string[][] } {
  const headers = keys.map((k) => String(k));

  const rows = data.map((item) =>
    keys.map((k) => {
      const value = item[k];
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    }),
  );

  return { headers, rows };
}
