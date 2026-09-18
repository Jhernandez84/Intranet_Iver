"use client";

import { Label, TextInput, Select } from "flowbite-react";
import { FIELD_TYPE_LABELS } from "./FieldList";
import OptionsTagInput from "./OptionsTagInput";
import type { FieldDefinition, FieldType } from "../../../lib/forms/types";

interface FieldConfigPanelProps {
  field: FieldDefinition | null;
  onChange: (patch: Partial<FieldDefinition>) => void;
}

export default function FieldConfigPanel({
  field,
  onChange,
}: FieldConfigPanelProps) {
  if (!field) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-400">
        Selecciona una pregunta a la izquierda, o agrega una nueva.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <Label htmlFor="field-label">Etiqueta</Label>
        <TextInput
          id="field-label"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="¿Qué le preguntas a la persona?"
        />
      </div>

      <div>
        <Label htmlFor="field-placeholder">
          Información adicional (texto de ayuda)
        </Label>
        <TextInput
          id="field-placeholder"
          value={field.placeholder ?? ""}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          placeholder="Ej: Ingresa tu RUT sin puntos ni guion"
        />
      </div>

      <div>
        <Label htmlFor="field-type">Tipo de campo</Label>
        <Select
          id="field-type"
          value={field.type}
          onChange={(e) => onChange({ type: e.target.value as FieldType })}
        >
          {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {(field.type === "select" || field.type === "radio") && (
        <div>
          <Label htmlFor="field-options">Opciones</Label>
          <OptionsTagInput
            id="field-options"
            options={field.options ?? []}
            onChange={(options) => onChange({ options })}
          />
        </div>
      )}
    </div>
  );
}
