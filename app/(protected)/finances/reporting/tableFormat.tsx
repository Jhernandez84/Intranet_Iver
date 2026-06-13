"use client";

import React from "react";
import { GatewayReportRow } from "../reports/queries";

interface Props {
  data: GatewayReportRow[];
  loading: boolean;
}

export default function GatewayReportTable({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-gray-50 p-10 text-center text-gray-500 dark:bg-gray-900/50">
        No se encontraron registros para los filtros seleccionados.
      </div>
    );
  }

  // Helper para formatear moneda sin usar 'any'
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm dark:divide-gray-700 dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
              Periodo
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
              Sede
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
              Origen (Type)
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
              Proveedor
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
              Monto Bruto
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
              Comisión
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
              Monto Neto
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
              Trans.
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (
            <tr
              key={`${row.periodo}-${row.nombre_sede}-${index}`}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="px-4 py-3 whitespace-nowrap text-gray-700 capitalize dark:text-gray-300">
                {row.periodo.trim()}
              </td>
              <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                {row.nombre_sede}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {row.setting_type}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                {row.provider_name}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatCurrency(row.total_bruto)}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap text-red-600 dark:text-red-400">
                -{formatCurrency(row.total_comision)}
              </td>
              <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-green-600 dark:text-green-400">
                {formatCurrency(row.total_neto)}
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap text-gray-500 dark:text-gray-400">
                {row.cantidad_transacciones}
              </td>
            </tr>
          ))}
        </tbody>
        {/* Fila de Totales opcional */}
        <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-bold dark:border-gray-700 dark:bg-gray-900">
          <tr>
            <td
              colSpan={4}
              className="px-4 py-3 text-right text-gray-900 dark:text-white"
            >
              TOTAL GENERAL
            </td>
            <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
              {formatCurrency(
                data.reduce((acc, curr) => acc + Number(curr.total_bruto), 0),
              )}
            </td>
            <td className="px-4 py-3 text-right text-red-600">
              -
              {formatCurrency(
                data.reduce(
                  (acc, curr) => acc + Number(curr.total_comision),
                  0,
                ),
              )}
            </td>
            <td className="px-4 py-3 text-right text-green-600">
              {formatCurrency(
                data.reduce((acc, curr) => acc + Number(curr.total_neto), 0),
              )}
            </td>
            <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
              {data.reduce(
                (acc, curr) => acc + Number(curr.cantidad_transacciones),
                0,
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
