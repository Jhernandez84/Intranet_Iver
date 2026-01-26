import { format } from "date-fns";

export const procesarMovimientos = (movimientos) => {
  return movimientos.reduce((acc, mov) => {
    const sede = mov.sede_nombre || "Sin Sede";
    const mes = format(new Date(mov.fecha), "MMMM yyyy"); // Agrupa por Mes/Año

    if (!acc[sede]) acc[sede] = { nombresede: sede, meses: {}, totalSede: 0 };
    if (!acc[sede].meses[mes])
      acc[sede].meses[mes] = { ingresos: 0, egresos: 0, movimientos: [] };

    // Sumar totales
    if (mov.tipo === "Ingreso") acc[sede].meses[mes].ingresos += mov.monto;
    if (mov.tipo === "Egreso") acc[sede].meses[mes].egresos += mov.monto;

    acc[sede].meses[mes].movimientos.push(mov);
    return acc;
  }, {});
};

export const AgruparMovimientosResumen = (movimientos) => {
  if (!movimientos || movimientos.length === 0) return {};

  return movimientos.reduce((acc, mov) => {
    const sede = mov.sede_nombre || "Sin Sede";
    const categoria = mov.tipo_mov || "Otros"; // Ejemplo: ofrendas, servicios, etc.
    const tipoRaiz = mov.tipo; // Ingreso o Egreso

    // 1. Inicializar Sede
    if (!acc[sede]) {
      acc[sede] = {
        nombresede: sede,
        ingresos: {},
        egresos: {},
        totalIngresos: 0,
        totalEgresos: 0,
      };
    }

    // 2. Clasificar por tipo y sumar por categoría
    if (tipoRaiz === "Ingreso") {
      acc[sede].ingresos[categoria] =
        (acc[sede].ingresos[categoria] || 0) + mov.monto;
      acc[sede].totalIngresos += mov.monto;
    } else if (tipoRaiz === "Egreso") {
      acc[sede].egresos[categoria] =
        (acc[sede].egresos[categoria] || 0) + mov.monto;
      acc[sede].totalEgresos += mov.monto;
    }

    return acc;
  }, {});
};

const getMonthKey = (fecha) => {
  if (!fecha) return "Sin Fecha";

  // soporta "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ssZ" o Date
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return "Sin Fecha";

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // ej: "2026-01"
};

export const AgruparMovimientosResumenPorMes = (movimientos) => {
  if (!movimientos || movimientos.length === 0) return [];

  const agrupado = movimientos.reduce((acc, mov) => {
    const d = new Date(mov.fecha);
    const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    // Formato: "enero de 2026"
    const mesLabel = d.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });

    if (!acc[mesKey]) {
      acc[mesKey] = {
        label: mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1),
        sedes: {},
        totalIngresos: 0,
        totalEgresos: 0,
      };
    }

    const sedeNombre = mov.sede_nombre || "Sin Sede";
    if (!acc[mesKey].sedes[sedeNombre]) {
      acc[mesKey].sedes[sedeNombre] = {
        nombresede: sedeNombre,
        movimientos: [],
      };
    }

    acc[mesKey].sedes[sedeNombre].movimientos.push(mov);

    if (mov.tipo === "Ingreso") acc[mesKey].totalIngresos += Number(mov.monto);
    else acc[mesKey].totalEgresos += Number(mov.monto);

    return acc;
  }, {});

  return Object.values(agrupado); // Convertimos a array para el PDF
};

export const AgruparMovimientosResumenPorMes2 = (movimientos) => {
  if (!movimientos || movimientos.length === 0) return [];

  const agrupado = movimientos.reduce((acc, mov) => {
    const d = new Date(mov.fecha);
    const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mesLabel = d.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });

    if (!acc[mesKey]) {
      acc[mesKey] = {
        label: mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1),
        sedes: {},
        totalIngresos: 0,
        totalEgresos: 0,
      };
    }

    const sedeNombre = mov.sede_nombre || "Sin Sede";
    if (!acc[mesKey].sedes[sedeNombre]) {
      acc[mesKey].sedes[sedeNombre] = {
        nombresede: sedeNombre,
        conceptos: {}, // Aquí agruparemos por tipo_mov
      };
    }

    const categoria = mov.tipo_mov || "Otros";
    if (!acc[mesKey].sedes[sedeNombre].conceptos[categoria]) {
      acc[mesKey].sedes[sedeNombre].conceptos[categoria] = {
        nombre: categoria,
        monto: 0,
        tipoRaiz: mov.tipo, // "Ingreso" o "Egreso"
      };
    }

    const monto = Number(mov.monto) || 0;
    acc[mesKey].sedes[sedeNombre].conceptos[categoria].monto += monto;

    if (mov.tipo === "Ingreso") acc[mesKey].totalIngresos += monto;
    else acc[mesKey].totalEgresos += monto;

    return acc;
  }, {});

  return Object.values(agrupado);
};
