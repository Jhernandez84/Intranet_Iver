"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Label,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Radio,
} from "flowbite-react";
import type { FieldDefinition } from "../../../lib/forms/types";
import { buildZodSchemaFromFields } from "../../../lib/forms/zodSchema";

export interface FormRendererProps {
  fields: FieldDefinition[];
  mode: "preview" | "public";
  onSubmit?: (answers: Record<string, unknown>) => Promise<void>;
  submitDisabledReason?: string;
  submitLabel?: string;
  successTitle?: string | null;
  successBody?: string | null;
  redirectUrl?: string | null;
  /** Modo tarjeta: una pregunta a la vez, con indicador "X de Y" y validación por paso. */
  paged?: boolean;
}

export default function FormRenderer({
  fields,
  mode,
  onSubmit,
  submitDisabledReason,
  submitLabel = "Enviar",
  successTitle,
  successBody,
  redirectUrl,
  paged = false,
}: FormRendererProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);

  const schema = useMemo(() => buildZodSchemaFromFields(fields), [fields]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    reset,
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (mode === "preview") {
      setSubmitted(true);
      return;
    }

    if (!onSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo enviar el formulario.",
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
        {mode === "preview" ? (
          "Esto es una vista previa — no se guardó nada."
        ) : (
          <>
            <p className="text-lg font-semibold">
              {successTitle || "¡Gracias!"}
            </p>
            {(successBody || "Tu respuesta fue registrada.") && (
              <p className="mt-1 text-sm">
                {successBody || "Tu respuesta fue registrada."}
              </p>
            )}
            {redirectUrl && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-sm">
                  ¿Quieres que te llevemos a{" "}
                  <span className="font-semibold">
                    {getHostname(redirectUrl)}
                  </span>
                  ?
                </p>
                <Button
                  onClick={() => {
                    window.location.href = redirectUrl;
                  }}
                >
                  Sí, ir a {getHostname(redirectUrl)}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Este formulario todavía no tiene preguntas.
      </p>
    );
  }

  if (paged) {
    const current = fields[Math.min(step, fields.length - 1)];
    const isLastStep = step === fields.length - 1;

    const goNext = async () => {
      const valid = await trigger(current.id);
      if (valid) setStep((s) => Math.min(s + 1, fields.length - 1));
    };
    const goBack = () => setStep((s) => Math.max(0, s - 1));

    return (
      <form onSubmit={handleFormSubmit} className="flex h-full flex-col">
        <span className="mb-2 text-xs text-gray-400">
          Pregunta {step + 1} de {fields.length}
        </span>
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="bg-primary-600 h-full transition-all"
            style={{ width: `${((step + 1) / fields.length) * 100}%` }}
          />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2">
          {current.type !== "checkbox" && (
            <Label htmlFor={current.id}>
              {current.label}
              {current.required && <span className="text-red-500"> *</span>}
            </Label>
          )}
          {renderInput(current, register)}
          {errors[current.id] && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {String(errors[current.id]?.message ?? "Campo inválido")}
            </p>
          )}
        </div>

        {submitError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button
            type="button"
            color="light"
            disabled={step === 0}
            onClick={goBack}
          >
            Atrás
          </Button>

          {isLastStep && submitDisabledReason ? (
            <p className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-2 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {submitDisabledReason}
            </p>
          ) : isLastStep ? (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : submitLabel}
            </Button>
          ) : (
            <Button type="button" onClick={goNext}>
              Siguiente
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-2">
          {field.type !== "checkbox" && (
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </Label>
          )}

          {renderInput(field, register)}

          {errors[field.id] && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {String(errors[field.id]?.message ?? "Campo inválido")}
            </p>
          )}
        </div>
      ))}

      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
      )}

      {submitDisabledReason ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          {submitDisabledReason}
        </p>
      ) : (
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : submitLabel}
        </Button>
      )}
    </form>
  );
}

function renderInput(
  field: FieldDefinition,
  register: ReturnType<typeof useForm>["register"],
) {
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          {...register(field.id)}
        />
      );
    case "select":
      return (
        <Select id={field.id} {...register(field.id)}>
          <option value="">Selecciona una opción</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-2">
          {field.options?.map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <Radio
                id={`${field.id}-${opt}`}
                value={opt}
                {...register(field.id)}
              />
              <Label htmlFor={`${field.id}-${opt}`}>{opt}</Label>
            </div>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox id={field.id} {...register(field.id)} />
          <Label htmlFor={field.id}>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </Label>
        </div>
      );
    default:
      return (
        <TextInput
          id={field.id}
          type={field.type}
          placeholder={field.placeholder}
          {...register(field.id)}
        />
      );
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
