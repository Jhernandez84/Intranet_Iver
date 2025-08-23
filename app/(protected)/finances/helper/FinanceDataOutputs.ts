import { useFinanceData } from "../_Context/FinancesProvider";

interface FinanceMovements {
  id: string;
  company_id: string;
  responsable_id: string;
  fecha: string;
  tipo: string;
  // tipo_mov: string;
  metodo_pago: string;
  observaciones: string;
  mov_grupo: string;
  num_doc: string;
  monto: number;
  estado: string;
  sede_id: string;
  //   sede: string;
}
[];

interface DataFilters {
  fechaDesde?: string; // ISO string "2025-01-01"
  fechaHasta?: string; // ISO string "2025-12-31"
  tipo?: "Ingreso" | "Egreso";
  sede_id?: string;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date | null) {
  if (!date) return null;
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

// Función para rangos de fecha en la consulta

export type DateRangeKey = "WTD" | "MTD" | "PREV_MONTH" | "YTD" | "CUSTOM";

export interface DateRange {
  fechaDesde: string;
  fechaHasta: string;
}

// 👉 función que calcula los rangos
export function getDateRange(
  type: DateRangeKey,
  custom?: { from: Date; to: Date },
): DateRange {
  const today = new Date();
  let start: Date;
  let end: Date;

  switch (type) {
    case "WTD": {
      // Week To Date (desde lunes hasta hoy)
      const day = today.getDay(); // 0=domingo, 1=lunes...
      const diff = day === 0 ? 6 : day - 1; // ajustar si es domingo
      start = new Date(today);
      start.setDate(today.getDate() - diff);
      end = today;
      break;
    }

    case "MTD": {
      // Month To Date
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      break;
    }

    case "PREV_MONTH": {
      // Mes anterior completo
      const prevMonth = today.getMonth() - 1;
      const year =
        prevMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const month = (prevMonth + 12) % 12;
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0); // último día del mes
      break;
    }

    case "YTD": {
      // Year To Date
      start = new Date(today.getFullYear(), 0, 1);
      end = today;
      break;
    }

    case "CUSTOM": {
      if (!custom) throw new Error("CUSTOM necesita {from, to}");
      start = custom.from;
      end = custom.to;
      break;
    }

    default:
      start = today;
      end = today;
  }

  // Normalizar a ISO string (yyyy-mm-dd)
  const toISO = (d: Date) => d.toISOString().split("T")[0];
  return { fechaDesde: toISO(start), fechaHasta: toISO(end) };
}

// Total por tipo de movimiento (ingreso/egreso)
export function getTotalsByTipo(
  data: FinanceMovements[],
  filters: DataFilters = {},
) {
  // Paso los filtros a la función
  const { fechaDesde, fechaHasta, tipo, sede_id } = filters;

  const filtered = data.filter((mov) => {
    const fecha = new Date(mov.fecha);

    if (fechaDesde && fecha < new Date(fechaDesde)) return false;
    if (fechaHasta && fecha > new Date(fechaHasta)) return false;
    if (tipo && mov.tipo !== tipo) return false;
    if (sede_id && mov.sede_id !== sede_id) return false;

    return true;
  });

  return filtered?.reduce(
    (acc, mov) => {
      if (mov.tipo === "Ingreso") acc.ingresos += mov.monto;
      if (mov.tipo === "Egreso") acc.egresos += mov.monto;
      acc.total = acc.ingresos - acc.egresos;
      return acc;
    },
    { ingresos: 0, egresos: 0, total: 0 },
  );
}

export function groupByMes(data: FinanceMovements[]) {
  return data.reduce(
    (acc, mov) => {
      const date = new Date(mov.fecha);
      // Normalizar a formato YYYY-MM
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + mov.monto;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function groupByMesTipoForChartPretty(data: FinanceMovements[]) {
  const resumen = data.reduce(
    (acc, mov) => {
      const date = new Date(mov.fecha);

      // Clave para ordenar (YYYY-MM)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;

      if (!acc[key]) {
        acc[key] = { ingresos: 0, egresos: 0, total: 0, date };
      }

      if (mov.tipo.toLowerCase() === "ingreso") {
        acc[key].ingresos += mov.monto;
      } else if (mov.tipo.toLowerCase() === "egreso") {
        acc[key].egresos += mov.monto;
      }

      acc[key].total += mov.monto;
      return acc;
    },
    {} as Record<
      string,
      { ingresos: number; egresos: number; total: number; date: Date }
    >,
  );

  // Ordenar por clave
  const keys = Object.keys(resumen).sort();

  // Formatear mes bonito → Ene 2025, Feb 2025, ...
  const categories = keys.map((k) =>
    resumen[k].date.toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric",
    }),
  );

  const series = [
    {
      name: "Ingresos",
      data: keys.map((m) => resumen[m].ingresos),
    },
    {
      name: "Egresos",
      data: keys.map((m) => resumen[m].egresos),
    },
    {
      name: "Total",
      data: keys.map((m) => resumen[m].total),
    },
  ];

  return { series, categories };
}

export function getFinanceSummary(data: FinanceMovements[]) {
  if (!data || data.length === 0) {
    return {
      estados: [],
      metodosPago: [],
      tipos: [],
      responsables: [],
      sedes: [],
      fechaMin: null,
      fechaMax: null,
    };
  }

  // Fechas mín y máx
  const fechas = data.map((d) => new Date(d.fecha).getTime());
  const fechaMin = new Date(Math.min(...fechas));
  const fechaMax = new Date(Math.max(...fechas));

  // Valores únicos por campo
  const estados = Array.from(new Set(data.map((d) => d.estado))).filter(
    Boolean,
  );
  const metodosPago = Array.from(
    new Set(data.map((d) => d.metodo_pago)),
  ).filter(Boolean);
  const tipos = Array.from(new Set(data.map((d) => d.tipo))).filter(Boolean);
  const responsables = Array.from(
    new Set(data.map((d) => d.responsable_id)),
  ).filter(Boolean);
  const sedes = Array.from(new Set(data.map((d) => d.sede_id))).filter(Boolean);

  return {
    estados,
    metodosPago,
    tipos,
    responsables,
    sedes,
    fechaMin: formatDate(fechaMin),
    fechaMax: formatDate(fechaMax),
  };
}
