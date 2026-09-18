"use client";

import { Checkbox, Label } from "flowbite-react";
import type { FieldDefinition } from "../../../lib/forms/types";

interface FieldOptionsPanelProps {
  field: FieldDefinition | null;
  onChange: (patch: Partial<FieldDefinition>) => void;
  isDedupeField: boolean;
  onToggleDedupeField: () => void;
  allowDuplicates: boolean;
}

export default function FieldOptionsPanel({
  field,
  onChange,
  isDedupeField,
  onToggleDedupeField,
  allowDuplicates,
}: FieldOptionsPanelProps) {
  if (!field) {
    return <div className="w-full flex-shrink-0 sm:w-72" />;
  }

  return (
    <div className="flex w-full flex-shrink-0 flex-col gap-4 border-gray-200 p-4 sm:w-72 sm:border-l dark:border-gray-700">
      <h3 className="text-xs font-semibold text-gray-400 uppercase">
        Opciones de la pregunta
      </h3>

      <div className="flex items-center gap-2">
        <Checkbox
          id="field-required"
          checked={field.required}
          onChange={(e) => onChange({ required: e.target.checked })}
        />
        <Label htmlFor="field-required">Obligatorio</Label>
      </div>

      {!allowDuplicates && (
        <div className="flex items-start gap-2">
          <Checkbox
            id="field-dedupe"
            checked={isDedupeField}
            onChange={onToggleDedupeField}
            className="mt-0.5"
          />
          <Label htmlFor="field-dedupe" className="font-normal">
            Usar esta pregunta para detectar respuestas duplicadas (ej. RUT o
            email)
          </Label>
        </div>
      )}

      <div className="rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-400 dark:border-gray-600">
        Más opciones próximamente (ej. autocompletar desde otra tabla, visibilidad
        condicional).
      </div>
    </div>
  );
}
