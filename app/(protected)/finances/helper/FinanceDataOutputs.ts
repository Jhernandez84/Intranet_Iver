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

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

// Total por tipo de movimiento (ingreso/egreso)
export function getTotalsByTipo(data: FinanceMovements[]) {
  return data?.reduce(
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
