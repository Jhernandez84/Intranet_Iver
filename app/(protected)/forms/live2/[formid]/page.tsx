"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Swal from "sweetalert2";

// 1. Interfaz estricta con index signature seguro para evitar el uso de 'any'
interface FinanceEntryForm {
  rut: string;
  name: string;
  last_name: string;
  second_last_name: string;
  phone: string;
  fec_nac: string;
  apoderado: string;
  contactoapoderado: string;
  ref_asignatura: string;
  ref_grupo: string;
  ref_target: string[];
  [key: string]: string | string[];
}

interface FormStep {
  id: keyof FinanceEntryForm;
  label: string;
  type: "text" | "tel" | "date" | "select"; // 👈 Añadido tipo 'select'
  placeholder?: string;
  mandatory: boolean;
  options?: string[]; // 👈 Añadido para pasar las opciones del dropdown
}

export default function LiveFormsPage2() {
  const supabase = createClientComponentClient();
  const { formid } = useParams<{ formid: string }>();
  const search = useSearchParams();
  const program = search.get("program") ?? "";

  // Control de pasos del flujo de la Card (-1 es la vista de bienvenida)
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [form, setForm] = useState<FinanceEntryForm>({
    rut: "",
    name: "",
    last_name: "",
    second_last_name: "",
    phone: "",
    fec_nac: "",
    contactoapoderado: "",
    apoderado: "",
    ref_asignatura: "",
    ref_grupo: "",
    ref_target: [],
  });

  // Sincronizar identificador del formulario si cambia dinámicamente
  useEffect(() => {
    if (formid) {
      setForm((prev) => ({ ...prev, event_name: formid }));
    }
  }, [formid]);

  // Definición de los pasos secuenciales de la tarjeta
  const formSteps: FormStep[] = [
    {
      id: "rut",
      label: "Ingresa tu Rut",
      type: "text",
      placeholder: "12345678",
      mandatory: true,
    },
    {
      id: "name",
      label: "Ingresa tu nombre",
      type: "text",
      placeholder: "John",
      mandatory: true,
    },
    {
      id: "last_name",
      label: "Ingresa tu apellido paterno",
      type: "text",
      placeholder: "Ej: Pérez",
      mandatory: true,
    },
    {
      id: "second_last_name",
      label: "Ingresa tu apellido materno",
      type: "text",
      placeholder: "Ej: Soto",
      mandatory: true,
    },
    {
      id: "phone",
      label: "Ingresa tu teléfono de contacto",
      type: "tel",
      placeholder: "999999999",
      mandatory: true,
    },
    {
      id: "fec_nac",
      label: "Ingresa tu fecha de nacimiento",
      type: "date",
      mandatory: true,
    },
    // 👈 NUEVO PASO FINAL: Dropdown obligatorio
    {
      id: "ref_grupo",
      label: "En que Iver participas",
      type: "select",
      mandatory: true,
      options: [
        "Iver Central",
        "Iver Litoral",
        "Iver Curicó",
        "Iver Nancagua",
        "Iver San Clemente",
        "Iver Talca",
        "Iver Talcahuano",
      ],
    },
  ];

  const handleInputChange = (id: keyof FinanceEntryForm, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSending(true);

    const { error: insertError } = await supabase
      .from("temp_registros")
      .insert([form]);

    setIsSending(false);

    if (insertError) {
      console.error("Error al guardar registro:", insertError.message);
      Swal.fire({
        title: "Error al guardar",
        text: insertError.message,
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: "Muchas gracias por tu registro",
      text: "Estamos en contacto!",
      icon: "success",
    }).then(() => {
      // Limpieza completa tras guardar con éxito
      setForm({
        rut: "",
        name: "",
        last_name: "",
        second_last_name: "",
        phone: "",
        fec_nac: "",
        apoderado: "",
        contactoapoderado: "",
        ref_asignatura: "",
        ref_grupo: "",
        ref_target: [],
      });
      setCurrentStep(-1);
    });
  };

  const currentField = formSteps[currentStep];

  // Validación estricta en base al valor actual almacenado en el paso
  const isNextDisabled =
    currentStep >= 0 && currentField.mandatory && !form[currentField.id];

  return (
    <div className="flex min-h-screen items-center justify-center p-4 font-sans text-slate-900">
      {/* Contenedor Principal tipo Card */}
      <div className="relative flex min-h-[450px] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl transition-all">
        {/* Barra de Progreso Superior */}
        {currentStep >= 0 && (
          <div className="absolute top-0 left-0 h-2 w-full bg-gray-100">
            <div
              className="h-full bg-emerald-600 transition-all duration-500 ease-in-out"
              style={{
                width: `${((currentStep + 1) / formSteps.length) * 100}%`,
              }}
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-8">
          {currentStep === -1 ? (
            /* --- CARD DE BIENVENIDA --- */
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                {formid}
              </h1>
              <p className="mt-4 text-base text-gray-600">
                Te invitamos a completar tus datos y estar aún más conectados
                con nuestro Iver Jóvenes!
              </p>

              <div className="mt-8 flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-98"
                >
                  Comenzar registro
                </button>
              </div>
            </div>
          ) : (
            /* --- CARDS SECUENCIALES DE PREGUNTAS --- */
            <div className="flex flex-1 flex-col justify-between">
              {/* Bloque del Input o Dropdown */}
              <div className="flex flex-1 flex-col justify-center py-6">
                <span className="mb-2 text-xs font-bold tracking-widest text-emerald-600 uppercase">
                  Paso {currentStep + 1} de {formSteps.length}
                </span>

                <label
                  htmlFor={`${currentField.id}`}
                  className="mb-6 block text-2xl leading-tight font-bold text-gray-800"
                >
                  {currentField.label}
                  {currentField.mandatory && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>

                {currentField.type === "select" ? (
                  /* RENDERIZADO DEL DROPDOWN */
                  <select
                    key={currentField.id}
                    id={`${currentField.id}`}
                    name={`${currentField.id}`}
                    value={(form[currentField.id] as string) || ""}
                    onChange={(e) =>
                      handleInputChange(currentField.id, e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-white p-4 text-lg shadow-sm transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="" disabled>
                      -- Selecciona una opción --
                    </option>
                    {currentField.options?.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  /* RENDERIZADO DEL INPUT ESTÁNDAR */
                  <input
                    key={currentField.id}
                    id={`${currentField.id}`}
                    name={`${currentField.id}`}
                    autoFocus
                    type={currentField.type}
                    placeholder={currentField.placeholder}
                    value={(form[currentField.id] as string) || ""}
                    onChange={(e) =>
                      handleInputChange(currentField.id, e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-gray-200 p-4 text-lg shadow-sm transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    autoComplete="off"
                  />
                )}
              </div>

              {/* Bloque de Navegación de la Card */}
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-2 text-sm font-bold tracking-wider text-gray-500 uppercase transition-colors hover:text-gray-800"
                >
                  Atrás
                </button>

                <button
                  type="button"
                  disabled={isSending || isNextDisabled}
                  onClick={() => {
                    if (currentStep < formSteps.length - 1) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      handleSubmit();
                    }
                  }}
                  className={`flex-1 rounded-xl py-3.5 text-base font-bold text-white shadow-md transition-all active:scale-98 ${
                    isSending || isNextDisabled
                      ? "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none"
                      : "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700"
                  }`}
                >
                  {isSending
                    ? "Guardando..."
                    : currentStep === formSteps.length - 1
                      ? "Enviar ✅"
                      : "Siguiente"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
