"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import {
  HiPlus,
  HiTrash,
  HiArrowUp,
  HiArrowDown,
  HiOutlineViewList,
  HiOutlineDocumentText,
  HiOutlineHashtag,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineChevronDown,
  HiOutlineCheckCircle,
  HiOutlineAdjustments,
} from "react-icons/hi";
import type { FieldDefinition, FieldType } from "../../../lib/forms/types";

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texto corto",
  textarea: "Texto largo",
  number: "Número",
  email: "Email",
  tel: "Teléfono",
  date: "Fecha",
  select: "Lista desplegable",
  checkbox: "Casilla (sí/no)",
  radio: "Opción única",
};

const FIELD_TYPE_ICONS: Record<FieldType, React.ComponentType<{ className?: string }>> = {
  text: HiOutlineViewList,
  textarea: HiOutlineDocumentText,
  number: HiOutlineHashtag,
  email: HiOutlineMail,
  tel: HiOutlinePhone,
  date: HiOutlineCalendar,
  select: HiOutlineChevronDown,
  checkbox: HiOutlineCheckCircle,
  radio: HiOutlineAdjustments,
};

interface FieldListProps {
  fields: FieldDefinition[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: FieldType) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export default function FieldList({
  fields,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  onMove,
}: FieldListProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);

  return (
    <div className="flex w-full flex-shrink-0 flex-col gap-2 border-gray-200 p-3 sm:w-64 sm:border-r dark:border-gray-700">
      <h3 className="mb-1 text-xs font-semibold text-gray-400 uppercase">
        Preguntas
      </h3>

      {fields.length === 0 && (
        <p className="text-sm text-gray-400">Todavía no hay preguntas.</p>
      )}

      <div className="flex flex-col gap-1">
        {fields.map((f, i) => (
          <div
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${
              selectedId === f.id
                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              {(() => {
                const Icon = FIELD_TYPE_ICONS[f.type];
                return <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />;
              })()}
              <span className="truncate">{f.label || "Sin título"}</span>
            </span>
            <div className="hidden flex-shrink-0 gap-1 group-hover:flex">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-white"
                disabled={i === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(f.id, -1);
                }}
              >
                <HiArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-white"
                disabled={i === fields.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(f.id, 1);
                }}
              >
                <HiArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(f.id);
                }}
              >
                <HiTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-2">
        <Button
          size="sm"
          color="light"
          className="w-full"
          onClick={() => setShowTypePicker((v) => !v)}
        >
          <HiPlus className="mr-1 h-4 w-4" /> Agregar pregunta
        </Button>
        {showTypePicker && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => {
              const Icon = FIELD_TYPE_ICONS[type as FieldType];
              return (
                <button
                  key={type}
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => {
                    onAdd(type as FieldType);
                    setShowTypePicker(false);
                  }}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
