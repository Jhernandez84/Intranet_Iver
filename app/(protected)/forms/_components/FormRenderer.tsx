"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
  redirectLabel?: string | null;
  /** Modo tarjeta: una pregunta a la vez, con indicador "X de Y" y validación por paso. */
  paged?: boolean;
  formName?: string;
  coverImageUrl?: string | null;
  coverTitle?: string | null;
  coverSubtitle?: string | null;
  themeColor?: string | null;
  /** Sin pantalla de bienvenida ni de confirmación — para el alta manual interna del staff. */
  simple?: boolean;
  /** Si es false, se salta la pantalla "revisa tus respuestas" y envía directo. */
  showReview?: boolean;
}

type Stage = "welcome" | "form" | "review" | "success";

export default function FormRenderer({
  fields,
  mode,
  onSubmit,
  submitDisabledReason,
  submitLabel = "Enviar",
  successTitle,
  successBody,
  redirectUrl,
  redirectLabel,
  paged = false,
  formName,
  coverImageUrl,
  coverTitle,
  coverSubtitle,
  themeColor,
  simple = false,
  showReview = true,
}: FormRendererProps) {
  const heading = coverTitle || formName;
  const hasWelcome = !simple && !!(coverImageUrl || heading || coverSubtitle);

  const [stage, setStage] = useState<Stage>(hasWelcome ? "welcome" : "form");
  const [pendingValues, setPendingValues] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState(false);

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

  const accentStyle = themeColor ? { backgroundColor: themeColor } : undefined;
  const redirectDisplayName = redirectLabel || (redirectUrl && getHostname(redirectUrl));

  const doSubmit = async (values: Record<string, unknown>) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit(values);
      setStage("success");
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo enviar el formulario.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReachEnd = handleSubmit(
    async (values) => {
      if (simple || !showReview) {
        await doSubmit(values);
        return;
      }
      setPendingValues(values);
      setStage("review");
    },
    () => {
      // Falló la validación al enviar (ej. último paso en modo paginado):
      // muestra el error de la pregunta actual en vez de fallar en silencio.
      setStepError(true);
    },
  );

  const restart = () => {
    reset();
    setPendingValues(null);
    setStep(0);
    setStepError(false);
    setSubmitError(null);
    setStage(hasWelcome ? "welcome" : "form");
  };

  if (fields.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Este formulario todavía no tiene preguntas.
      </p>
    );
  }

  if (stage === "welcome") {
    return (
      <CoverBlock
        variant="welcome"
        coverImageUrl={coverImageUrl}
        heading={heading || "Bienvenido"}
        subtitle={coverSubtitle}
        footer={
          <Button style={accentStyle} onClick={() => setStage("form")}>
            Comenzar
          </Button>
        }
      />
    );
  }

  if (stage === "review" && pendingValues) {
    return (
      <div className="flex flex-col gap-4">
        <CoverBlock variant="compact" coverImageUrl={coverImageUrl} heading={heading} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Revisa tus respuestas
        </h2>
        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
          {fields.map((f) => (
            <div key={f.id} className="flex justify-between gap-4 py-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">{f.label}</span>
              <span className="text-right font-medium text-gray-900 dark:text-white">
                {formatAnswer(f, pendingValues[f.id])}
              </span>
            </div>
          ))}
        </div>

        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        )}

        {submitDisabledReason ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            {submitDisabledReason}
          </p>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Button color="light" onClick={() => setStage("form")}>
              Editar respuestas
            </Button>
            <Button
              style={accentStyle}
              disabled={submitting}
              onClick={() => doSubmit(pendingValues)}
            >
              {submitting ? "Enviando..." : "Confirmar y enviar"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="flex flex-col gap-4">
        <CoverBlock variant="compact" coverImageUrl={coverImageUrl} heading={heading} />
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
              {redirectUrl && !simple && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <p className="text-sm">
                    ¿Quieres que te llevemos a{" "}
                    <span className="font-semibold">{redirectDisplayName}</span>?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      style={accentStyle}
                      onClick={() => {
                        window.location.href = redirectUrl;
                      }}
                    >
                      Sí, ir a {redirectDisplayName}
                    </Button>
                    <Button color="light" onClick={restart}>
                      No, quedarme aquí
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // stage === "form"
  if (paged && !simple) {
    const current = fields[Math.min(step, fields.length - 1)];
    const isLastStep = step === fields.length - 1;

    const goNext = async () => {
      const valid = await trigger(current.id);
      if (valid) {
        setStepError(false);
        setStep((s) => Math.min(s + 1, fields.length - 1));
      } else {
        setStepError(true);
      }
    };
    const goBack = () => {
      setStepError(false);
      setStep((s) => Math.max(0, s - 1));
    };

    return (
      <form onSubmit={handleReachEnd} className="flex h-full flex-col">
        <CoverBlock variant="compact" coverImageUrl={coverImageUrl} heading={heading} />

        <div key={current.id} className="flex flex-1 flex-col justify-center gap-2">
          {current.type !== "checkbox" && (
            <Label htmlFor={current.id}>
              {current.label}
              {current.required && <span className="text-red-500"> *</span>}
            </Label>
          )}
          {renderInput(current, register)}
          {stepError && errors[current.id] && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {String(errors[current.id]?.message ?? "Campo inválido")}
            </p>
          )}
        </div>

        <span className="mt-4 mb-2 text-xs text-gray-400">
          Pregunta {step + 1} de {fields.length}
        </span>
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="bg-primary-600 h-full transition-all"
            style={{
              width: `${((step + 1) / fields.length) * 100}%`,
              ...accentStyle,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            color="light"
            disabled={step === 0}
            onClick={goBack}
          >
            Atrás
          </Button>

          {isLastStep ? (
            <Button style={accentStyle} type="submit">
              {simple || !showReview ? submitLabel : "Revisar respuestas"}
            </Button>
          ) : (
            <Button style={accentStyle} type="button" onClick={goNext}>
              Siguiente
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleReachEnd} className="flex flex-col gap-5">
      <CoverBlock variant="compact" coverImageUrl={coverImageUrl} heading={heading} />
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
        <Button style={accentStyle} type="submit" disabled={submitting}>
          {submitting
            ? "Enviando..."
            : simple || !showReview
              ? submitLabel
              : "Revisar respuestas"}
        </Button>
      )}
    </form>
  );
}

interface CoverBlockProps {
  /** "welcome": imagen grande centrada (50% del alto), título (10%), texto (30%), botón (10%).
   *  "compact": versión chica para preguntas/confirmación (imagen arriba, título debajo). */
  variant: "welcome" | "compact";
  coverImageUrl?: string | null;
  heading?: string | null;
  subtitle?: string | null;
  footer?: React.ReactNode;
}

// Bloque imagen+texto compartido entre la bienvenida y las etapas de
// preguntas/confirmación. Comparten layoutId para que Framer Motion anime
// la transición de un tamaño/arreglo al otro en vez de solo intercambiarlos.
function CoverBlock({
  variant,
  coverImageUrl,
  heading,
  subtitle,
  footer,
}: CoverBlockProps) {
  if (!coverImageUrl && !heading) return footer ? <>{footer}</> : null;

  if (variant === "compact") {
    return (
      <motion.div
        layout
        className="mb-4 flex w-full flex-col items-center gap-2 text-center"
      >
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            layout
            layoutId="form-cover-image"
            src={coverImageUrl}
            alt=""
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
          />
        )}
        {heading && (
          <motion.p
            layout
            layoutId="form-cover-text"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {heading}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // variant === "welcome": imagen centrada ~50% del alto, título ~10%,
  // texto adicional ~30%, y el botón "Comenzar" ocupa el 10% restante —
  // todo dentro del mismo presupuesto de espacio, en vez de que el botón
  // quede afuera compitiendo por el espacio sobrante.
  return (
    <motion.div layout className="flex h-full w-full flex-1 flex-col items-center gap-2">
      {coverImageUrl && (
        <div className="flex w-full flex-[5] items-center justify-center overflow-hidden py-2">
          <motion.img
            layout
            layoutId="form-cover-image"
            src={coverImageUrl}
            alt=""
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="aspect-square h-full max-h-64 rounded-full object-cover"
          />
        </div>
      )}
      {heading && (
        <motion.p
          layout
          layoutId="form-cover-text"
          className="flex w-full flex-[1] items-center justify-center text-center text-xl font-bold text-gray-900 dark:text-white"
        >
          {heading}
        </motion.p>
      )}
      {subtitle && (
        <p className="flex w-full flex-[3] items-start justify-center overflow-y-auto text-center text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
      {footer && (
        <div className="flex w-full flex-[1] items-center justify-center">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

function formatAnswer(field: FieldDefinition, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (field.type === "checkbox") return value ? "Sí" : "No";
  return String(value);
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
