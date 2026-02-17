"use client";

import { useState } from "react";
import CardComponent from "../components/CardComponent/CardComponent";
import TabComponent from "./TabComponent/TabComponent";

// --- INTERFACES ---
export interface Movimiento {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: "ingreso" | "egreso";
  conciliado: boolean;
}

export interface ResumenDiario {
  fecha: string;
  cuentaId: string; // Relación con la cuenta bancaria
  totalBanco: number;
  totalSistema: number;
  estado: "conciliado" | "pendiente";
  detalles: {
    banco: Movimiento[];
    sistema: Movimiento[];
  };
}

interface CuentaBancaria {
  id: string;
  nombre: string;
  numero: string;
  color: string;
}

// --- DATA DUMMY ACTUALIZADA ---
const CUENTAS: CuentaBancaria[] = [
  { id: "bci-001", nombre: "BCI Principal", numero: "*4509", color: "blue" },
  { id: "st-002", nombre: "Santander Empresa", numero: "*1120", color: "red" },
];

export default function ReconcilementPage() {
  const [open, setOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState(CUENTAS[0]); // BCI por defecto
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const mockConciliacionData: ResumenDiario[] = [
    {
      fecha: "2026-02-04",
      cuentaId: "bci-001",
      totalBanco: 1250000,
      totalSistema: 1250000,
      estado: "conciliado",
      detalles: {
        banco: [
          {
            id: "b1",
            fecha: "2026-02-04",
            descripcion: "TRF CLIENTE A",
            monto: 1250000,
            tipo: "ingreso",
            conciliado: true,
          },
        ],
        sistema: [
          {
            id: "s1",
            fecha: "2026-02-04",
            descripcion: "Factura #442",
            monto: 1250000,
            tipo: "ingreso",
            conciliado: true,
          },
        ],
      },
    },
    {
      fecha: "2026-02-04",
      cuentaId: "st-002",
      totalBanco: 50000,
      totalSistema: 0,
      estado: "pendiente",
      detalles: {
        banco: [
          {
            id: "b2",
            fecha: "2026-02-04",
            descripcion: "Cargo Mantención",
            monto: -50000,
            tipo: "egreso",
            conciliado: false,
          },
        ],
        sistema: [],
      },
    },
  ];

  // Filtrar data por la cuenta seleccionada
  const filteredData = mockConciliacionData.filter(
    (d) => d.cuentaId === activeAccount.id,
  );

  const ActionButton = (
    <button
      className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
      onClick={() => setOpen(true)}
    >
      + Ingresar Movimiento
    </button>
  );

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-4">
      {/* 1. SECCIÓN DE CARDS SUPERIORES */}
      <div>
        <div className="grid h-full w-full grid-cols-1 gap-4 md:grid-cols-2">
          <CardComponent
            label={`Balance ${activeAccount.nombre}`}
            period="WTD"
            actionButton={ActionButton}
          />
          <CardComponent
            label={`Balance del mes ${activeAccount.nombre}`}
            period="MTD"
            actionButton2={ActionButton} // Inyectamos el nuevo botón aquí
          />
        </div>
      </div>

      {/* 2. SELECTOR DE CUENTAS CORRIENTES */}
      <div>
        <TabComponent />
      </div>
    </div>
  );
}
