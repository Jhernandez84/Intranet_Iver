// ReportButtonComponent.tsx
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyReport } from "./pdfReport";
import { MyReportResumen } from "./pdfReportResumen";
import { MyReportPeriodSummary } from "./pdfReportResumenPeriodo";
import { MyReportPeriodSummary2 } from "./pdfReportResumenPeriodo2";
import {
  AgruparMovimientosResumen,
  procesarMovimientos,
  AgruparMovimientosResumenPorMes,
  AgruparMovimientosResumenPorMes2,
} from "./formatData";

// 1. Definimos la interfaz basada en los campos de tu tabla de Supabase
export interface MovimientoFinanciero {
  id: string;
  responsable_id: string;
  fecha: string;
  tipo: string; // Cambiado a string para mayor compatibilidad
  metodo_pago: string;
  observaciones: string;
  monto: number;
  estado: string;
  sede_nombre: string;
}

interface ReportButtonProps {
  movimientos: MovimientoFinanciero[]; // Reemplazamos 'any[]' por el tipo real
}

// BOTÓN 1: REPORTE DETALLADO
export const ReportButton = ({ movimientos }: ReportButtonProps) => {
  const datosAgrupados = movimientos ? procesarMovimientos(movimientos) : {};

  return (
    <PDFDownloadLink
      document={<MyReport data={datosAgrupados} />}
      fileName={`detalle-finanzas-${new Date().toLocaleDateString()}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <span className="inline-block cursor-pointer gap-2 rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700">
          {loading ? "Generando..." : "🖨️ Detalle PDF"}
        </span>
      )}
    </PDFDownloadLink>
  );
};

// BOTÓN 2: REPORTE RESUMEN (Estilo EEFF)
export const ReportButtonResumen = ({ movimientos }: ReportButtonProps) => {
  const datosResumen = movimientos
    ? AgruparMovimientosResumen(movimientos)
    : {};

  return (
    <PDFDownloadLink
      document={<MyReportResumen data={datosResumen} />}
      fileName={`resumen-eeff-${new Date().toLocaleDateString()}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <span className="inline-block cursor-pointer gap-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
          {loading ? "Generando..." : "📊 Resumen EEFF"}
        </span>
      )}
    </PDFDownloadLink>
  );
};

export const ReportButtonResumenPeriodo = ({
  movimientos,
}: ReportButtonProps) => {
  const datosResumen = movimientos
    ? AgruparMovimientosResumenPorMes(movimientos)
    : {};

  return (
    <PDFDownloadLink
      document={<MyReportPeriodSummary data={datosResumen} />}
      fileName={`resumen-eeff-por-periodo${new Date().toLocaleDateString()}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <span className="inline-block cursor-pointer gap-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
          {loading ? "Generando..." : "📊 Resumen Periodo"}
        </span>
      )}
    </PDFDownloadLink>
  );
};

export const ReportButtonResumenPeriodo2 = ({
  movimientos,
}: ReportButtonProps) => {
  const datosResumen = movimientos
    ? AgruparMovimientosResumenPorMes(movimientos)
    : {};

  return (
    <PDFDownloadLink
      document={<MyReportPeriodSummary data={datosResumen} />}
      fileName={`resumen-eeff-por-periodo${new Date().toLocaleDateString()}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <span className="inline-block cursor-pointer gap-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
          {loading ? "Generando..." : "📊 Resumen Periodo"}
        </span>
      )}
    </PDFDownloadLink>
  );
};

export const ReportButtonResumenPeriodo3 = ({
  movimientos,
}: ReportButtonProps) => {
  const datosResumen = movimientos
    ? AgruparMovimientosResumenPorMes2(movimientos)
    : {};

  return (
    <PDFDownloadLink
      document={<MyReportPeriodSummary2 data={datosResumen} />}
      fileName={`resumen-eeff-por-periodo${new Date().toLocaleDateString()}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <span className="inline-block cursor-pointer gap-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
          {loading ? "Generando..." : "📊 Resumen Periodo"}
        </span>
      )}
    </PDFDownloadLink>
  );
};
