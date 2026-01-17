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
