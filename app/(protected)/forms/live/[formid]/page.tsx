"use client";

import { useState, useEffect, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Swal from "sweetalert2";

// 1. Interfaz estricta actualizada
interface MatrimonioForm {
  ella_rut: string;
  ella_name: string;
  ella_last_name: string;
  ella_phone: string;
  ella_birth_date: string; // 👈 Cambiado de ella_age a ella_birth_date

  el_rut: string;
  el_name: string;
  el_last_name: string;
  el_phone: string;
  el_birth_date: string; // 👈 Cambiado de el_age a el_birth_date

  event_name: string;
  [key: string]: string | string[];
}

interface FormStep {
  id: keyof MatrimonioForm;
  label: string;
  type: "text" | "date"; // 👈 Permitimos tipo "date" para el input nativo de calendario
  placeholder?: string;
  mandatory: boolean;
}

interface PageProps {
  params: Promise<{
    formid: string;
  }>;
}

export default function DynamicFormPage({ params }: PageProps) {
  const { formid } = use(params);
  const supabase = createClientComponentClient();

  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [formData, setFormData] = useState<MatrimonioForm>({
    ella_rut: "",
    ella_name: "",
    ella_last_name: "",
    ella_phone: "",
    ella_birth_date: "", // 👈 Estado inicial limpio
    el_rut: "",
    el_name: "",
    el_last_name: "",
    el_phone: "",
    el_birth_date: "", // 👈 Estado inicial limpio
    event_name: formid,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, event_name: formid }));
  }, [formid]);

  const formSteps: FormStep[] = [
    // --- DATOS DE ELLA ---
    {
      id: "ella_rut",
      label: "RUT de Ella",
      type: "text",
      placeholder: "12.345.678-9",
      mandatory: true,
    },
    {
      id: "ella_name",
      label: "Nombre de Ella",
      type: "text",
      placeholder: "Ej: María",
      mandatory: true,
    },
    {
      id: "ella_last_name",
      label: "Apellidos de Ella",
      type: "text",
      placeholder: "Ej: Pérez Soto",
      mandatory: true,
    },
    {
      id: "ella_phone",
      label: "Teléfono de Ella",
      type: "text",
      placeholder: "912345678",
      mandatory: true,
    },
    {
      id: "ella_birth_date",
      label: "Fecha de nacimiento de Ella",
      type: "date", // 👈 Despliega el calendario nativo
      mandatory: false,
    },
    // --- DATOS DE ÉL ---
    {
      id: "el_rut",
      label: "RUT de Él",
      type: "text",
      placeholder: "12.345.678-9",
      mandatory: true,
    },
    {
      id: "el_name",
      label: "Nombre de Él",
      type: "text",
      placeholder: "Ej: Juan",
      mandatory: true,
    },
    {
      id: "el_last_name",
      label: "Apellidos de Él",
      type: "text",
      placeholder: "Ej: Muñoz Gomez",
      mandatory: true,
    },
    {
      id: "el_phone",
      label: "Teléfono de Él",
      type: "text",
      placeholder: "987654321",
      mandatory: true,
    },
    {
      id: "el_birth_date",
      label: "Fecha de nacimiento de Él",
      type: "date", // 👈 Despliega el calendario nativo
      mandatory: false,
    },
  ];

  const handleChange = (id: keyof MatrimonioForm, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSending(true);

    const { error: insertError } = await supabase
      .from("matrimonios")
      .insert([formData]);

    setIsSending(false);

    if (insertError) {
      Swal.fire("Error al guardar", insertError.message, "error");
      return;
    }

    Swal.fire(
      "¡Genial!",
      "Han quedado inscritos exitosamente para " + formid,
      "success",
    ).then(() => {
      setFormData({
        ella_rut: "",
        ella_name: "",
        ella_last_name: "",
        ella_phone: "",
        ella_birth_date: "",
        el_rut: "",
        el_name: "",
        el_last_name: "",
        el_phone: "",
        el_birth_date: "",
        event_name: formid,
      });
      setCurrentStep(-1);
    });
  };

  const currentField = formSteps[currentStep];

  const isNextDisabled =
    currentStep >= 0 && currentField.mandatory && !formData[currentField.id];

  return (
    <div className="flex min-h-[90%] items-center justify-center p-4 font-sans text-slate-900">
      <div
        className="relative inset-0 flex min-h-[420px] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white bg-cover bg-center bg-no-repeat shadow-2xl md:aspect-[1.8/1]"
        style={{ backgroundImage: "url('/imagen.jpeg')" }}
      >
        {currentStep >= 0 && (
          <div className="absolute top-0 left-0 h-2 w-full bg-slate-100">
            <div
              className="h-full bg-pink-600 transition-all duration-700 ease-in-out"
              style={{
                width: `${((currentStep + 1) / formSteps.length) * 100}%`,
              }}
            />
          </div>
        )}

        <div className="flex flex-1 flex-col">
          {currentStep === -1 ? (
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden text-center">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />

              <div className="relative z-10 p-8">
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                  Seminario de Matrimonios 2026
                </h1>
                <p className="mt-4 text-lg text-slate-700">
                  Inicia tu registro para el formulario{" "}
                  <span className="font-mono font-bold text-blue-700">
                    {formid}
                  </span>
                </p>
                <button
                  onClick={() => setCurrentStep(0)}
                  className="mt-8 w-full max-w-xs rounded-2xl bg-pink-500 py-4 font-bold text-white shadow-xl shadow-pink-200 transition-all hover:bg-pink-600 active:scale-95"
                >
                  Comenzar Registro
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat blur-md"
                style={{ backgroundImage: "url('/Imagen.jpeg')" }}
              />

              <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px]" />

              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex flex-1 flex-col justify-center p-8 pb-0">
                  <span className="mb-2 text-xs font-black tracking-widest text-pink-600 uppercase">
                    Paso {currentStep + 1} de {formSteps.length}
                  </span>
                  <label className="mb-6 block text-3xl leading-tight font-bold text-slate-800">
                    {currentField.label}
                    {currentField.mandatory && (
                      <span className="ml-2 text-pink-500">*</span>
                    )}
                  </label>

                  <input
                    key={currentField.id}
                    autoFocus
                    type={currentField.type}
                    placeholder={currentField.placeholder}
                    value={(formData[currentField.id] as string) || ""}
                    onChange={(e) =>
                      handleChange(currentField.id, e.target.value)
                    }
                    className="w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 p-6 text-xl shadow-sm backdrop-blur-md transition-all outline-none focus:border-pink-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between gap-6 p-8">
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-sm font-bold tracking-widest text-slate-500 uppercase transition-colors hover:text-slate-800"
                  >
                    Atrás
                  </button>
                  <button
                    disabled={isSending || isNextDisabled}
                    onClick={() => {
                      if (currentStep < formSteps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        handleSubmit();
                      }
                    }}
                    className={`flex-1 rounded-2xl py-4 text-lg font-bold text-white shadow-xl transition-all active:scale-95 ${
                      isSending || isNextDisabled
                        ? "cursor-not-allowed bg-pink-200 text-slate-400 shadow-none"
                        : "bg-pink-500 shadow-pink-200 hover:bg-pink-600"
                    }`}
                  >
                    {isSending
                      ? "Guardando..."
                      : currentStep === formSteps.length - 1
                        ? "Finalizar"
                        : "Siguiente"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
