"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Swal from "sweetalert2";
import {
  PlusCircle,
  Trash2,
  Save,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";

import { useUser } from "../../../context/UserProvider";

// Tipos de campo expandidos
type FieldType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "email"
  | "tel"
  | "textarea"
  | "checkbox";

interface FormStep {
  id: string;
  label: string;
  type: FieldType;
  mandatory: boolean;
  options?: string[];
  placeholder?: string;
}

// Interfaz para el componente Input
interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function AdvancedFormBuilder() {
  const { user } = useUser();
  const supabase = createClientComponentClient();

  const [generalConfig, setGeneralConfig] = useState({
    formId: "",
    nombreInterno: "",
    tituloBienvenida: "¡Bienvenido!",
    subtituloBienvenida: "Completa el formulario para continuar",
    textoBotonInicio: "Comenzar Registro",
    urlImagenFondo: "/ImagenAviva.jpeg",
  });

  const [feedbackConfig, setFeedbackConfig] = useState({
    msgExitoTitulo: "¡Registro Exitoso!",
    msgExitoCuerpo: "Hemos recibido tus datos correctamente.",
    msgErrorTitulo: "Hubo un problema",
    msgErrorCuerpo: "No pudimos procesar tu solicitud. Intenta nuevamente.",
    textoBotonFinal: "Finalizar",
  });

  const [steps, setSteps] = useState<FormStep[]>([]);

  const addStep = () => {
    const newId = `campo_${Date.now()}`;
    setSteps([
      ...steps,
      { id: newId, label: "", type: "text", mandatory: true },
    ]);
  };

  // TIPADO DINÁMICO SEGURO:
  // K es la llave, FormStep[K] es el tipo de valor que le corresponde
  const updateStep = <K extends keyof FormStep>(
    index: number,
    field: K,
    value: FormStep[K],
  ) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const handleSave = async () => {
    if (!generalConfig.formId || steps.length === 0) {
      return Swal.fire(
        "Atención",
        "El ID del formulario y al menos una pregunta son obligatorios",
        "warning",
      );
    }

    if (!user) return; // Guardián de tipo para user

    const { error } = await supabase.from("forms_config").insert({
      id: generalConfig.formId.toLowerCase().trim(),
      company_id: user.company_id,
      sede_id: user.sede_id || null,
      nombre_interno: generalConfig.nombreInterno,
      config_visual: {
        ...generalConfig,
        feedback: feedbackConfig,
      },
      pasos: steps,
      estado: "activo",
    });

    if (error) Swal.fire("Error", error.message, "error");
    else Swal.fire("¡Éxito!", "Formulario dinámico guardado", "success");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">
              Arquitecto de Formularios
            </h1>
            <p className="text-lg text-slate-500">
              Configura bienvenida, campos y respuestas finales.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:bg-pink-700 active:scale-95"
          >
            <Save size={20} /> Guardar Configuración
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN VISUAL Y FEEDBACK */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-pink-600">
                <ImageIcon size={20} />
                <h2 className="text-sm font-bold tracking-widest uppercase">
                  Pantalla Inicial
                </h2>
              </div>
              <div className="space-y-4">
                <Input
                  label="ID del Formulario (URL)"
                  value={generalConfig.formId}
                  onChange={(v) =>
                    setGeneralConfig({ ...generalConfig, formId: v })
                  }
                  placeholder="ej: inscripcion-2026"
                />
                <Input
                  label="Título Bienvenida"
                  value={generalConfig.tituloBienvenida}
                  onChange={(v) =>
                    setGeneralConfig({ ...generalConfig, tituloBienvenida: v })
                  }
                />
                <Input
                  label="Texto Botón Inicio"
                  value={generalConfig.textoBotonInicio}
                  onChange={(v) =>
                    setGeneralConfig({ ...generalConfig, textoBotonInicio: v })
                  }
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-blue-600">
                <MessageSquare size={20} />
                <h2 className="text-sm font-bold tracking-widest uppercase">
                  Mensajes de Envío
                </h2>
              </div>
              <div className="space-y-4">
                <Input
                  label="Título Éxito"
                  value={feedbackConfig.msgExitoTitulo}
                  onChange={(v) =>
                    setFeedbackConfig({ ...feedbackConfig, msgExitoTitulo: v })
                  }
                />
                <textarea
                  className="w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Mensaje de agradecimiento..."
                  value={feedbackConfig.msgExitoCuerpo}
                  onChange={(e) =>
                    setFeedbackConfig({
                      ...feedbackConfig,
                      msgExitoCuerpo: e.target.value,
                    })
                  }
                />
                <Input
                  label="Texto Botón Final"
                  value={feedbackConfig.textoBotonFinal}
                  onChange={(v) =>
                    setFeedbackConfig({ ...feedbackConfig, textoBotonFinal: v })
                  }
                />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CONSTRUCTOR DE PASOS */}
          <div className="space-y-4 lg:col-span-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                Preguntas del Formulario
              </h2>
              <button
                onClick={addStep}
                className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-pink-600 transition-all hover:bg-pink-50"
              >
                <PlusCircle size={20} /> Agregar Campo
              </button>
            </div>

            {steps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-[2rem] border-2 border-transparent bg-white p-6 shadow-sm transition-all hover:border-pink-100"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                    CAMPO #{index + 1}
                  </span>
                  <button
                    onClick={() =>
                      setSteps(steps.filter((_, i) => i !== index))
                    }
                    className="text-slate-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="ml-1 text-xs font-bold text-slate-400 uppercase">
                      Pregunta al usuario
                    </label>
                    <input
                      value={step.label}
                      onChange={(e) =>
                        updateStep(index, "label", e.target.value)
                      }
                      className="mt-1 w-full rounded-2xl border-none bg-slate-50 p-4 text-lg font-medium outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Ej: ¿Cuál es su correo electrónico?"
                    />
                  </div>

                  <div>
                    <label className="ml-1 text-xs font-bold text-slate-400 uppercase">
                      Tipo de Dato
                    </label>
                    <select
                      value={step.type}
                      onChange={(e) =>
                        updateStep(index, "type", e.target.value as FieldType)
                      }
                      className="mt-1 w-full rounded-xl border-none bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="text">Texto Corto</option>
                      <option value="textarea">Texto Largo (Párrafo)</option>
                      <option value="number">Número</option>
                      <option value="email">Email</option>
                      <option value="tel">Teléfono</option>
                      <option value="date">Fecha</option>
                      <option value="select">Selector (Opciones)</option>
                    </select>
                  </div>

                  {step.type === "select" && (
                    <div className="md:col-span-2">
                      <label className="ml-1 text-xs font-bold text-slate-400 uppercase">
                        Opciones (separadas por coma)
                      </label>
                      <input
                        value={step.options?.join(", ") || ""}
                        onChange={(e) =>
                          updateStep(
                            index,
                            "options",
                            e.target.value.split(",").map((s) => s.trim()),
                          )
                        }
                        className="mt-1 w-full rounded-xl border-none bg-pink-50 p-3 outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Opción 1, Opción 2, Opción 3"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-componente Helper con Tipado Correcto
function Input({ label, value, onChange, placeholder = "" }: InputProps) {
  return (
    <div>
      <label className="ml-1 text-xs font-bold text-slate-400 uppercase">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border bg-slate-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-pink-500"
      />
    </div>
  );
}
