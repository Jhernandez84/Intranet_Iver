"use client";

import { useState, useEffect, use } from "react"; // Importamos 'use'
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Swal from "sweetalert2";

// 1. Interfaces estrictas
interface FinanceEntryForm {
  rut: string;
  name: string;
  last_name: string;
  second_last_name: string;
  phone: string;
  apoderado: string;
  contactoapoderado: string;
  age: string;
  event_name: string;
  ref_asignatura: string;
  ref_grupo: string;
  ref_target: string[];
  [key: string]: string | string[];
}

interface FormStep {
  id: keyof FinanceEntryForm;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  mandatory: boolean;
  options?: string[];
}

// 2. Definición de Props compatible con Next.js 15 (Promise)
interface PageProps {
  params: Promise<{
    formid: string;
  }>;
}

export default function DynamicFormPage({ params }: PageProps) {
  // Desatamos la promesa de params usando el hook 'use'
  const { formid } = use(params);

  const supabase = createClientComponentClient();
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [formData, setFormData] = useState<FinanceEntryForm>({
    rut: "",
    name: "",
    last_name: "",
    second_last_name: "",
    phone: "",
    apoderado: "",
    contactoapoderado: "",
    age: "",
    event_name: formid,
    ref_asignatura: "",
    ref_grupo: "",
    ref_target: [],
  });

  // Sincronizar ivercapacita si el formid cambia
  useEffect(() => {
    setFormData((prev) => ({ ...prev, event_name: formid }));
  }, [formid]);

  const formSteps: FormStep[] = [
    {
      id: "rut",
      label: "RUT",
      type: "text",
      placeholder: "12.345.678-9",
      mandatory: true,
    },
    {
      id: "name",
      label: "Nombre",
      type: "text",
      placeholder: "Ej: Juan",
      mandatory: true,
    },
    {
      id: "last_name",
      label: "Apellidos",
      type: "text",
      placeholder: "Ej: Pérez Soto",
      mandatory: true,
    },
    {
      id: "phone",
      label: "Teléfono",
      type: "text",
      placeholder: "912345678",
      mandatory: true,
    },
    {
      id: "age",
      label: "Edad",
      type: "text",
      placeholder: "30",
      mandatory: false,
    },
  ];

  const handleChange = (id: keyof FinanceEntryForm, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSending(true);
    const { error: insertError } = await supabase
      .from("temp_registros")
      .insert([{ ...formData, event_name: formid }]);

    setIsSending(false);

    if (insertError) {
      Swal.fire("Error", insertError.message, "error");
      return;
    }

    Swal.fire("¡Éxito!", "Registro guardado", "success").then(() => {
      setFormData({
        rut: "",
        name: "",
        last_name: "",
        second_last_name: "",
        phone: "",
        apoderado: "",
        contactoapoderado: "",
        age: "",
        event_name: formid,
        ref_asignatura: "",
        ref_grupo: "",
        ref_target: [],
      });
      setCurrentStep(-1);
    });
  };

  const currentField = formSteps[currentStep];
  const isNextDisabled =
    currentStep >= 0 &&
    formSteps[currentStep].mandatory &&
    !formData[formSteps[currentStep].id];

  return (
    <div className="flex min-h-[90%] items-center justify-center p-4 font-sans text-slate-900">
      <div className="relative flex min-h-[420px] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl md:aspect-[1.8/1]">
        {currentStep >= 0 && (
          <div className="absolute top-0 left-0 h-2 w-full bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
              style={{
                width: `${((currentStep + 1) / formSteps.length) * 100}%`,
              }}
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-8 md:p-12">
          {currentStep === -1 ? (
            <div
              className="relative flex flex-1 flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-center"
              style={{ backgroundImage: "url('public/ImagenAviva.jpeg')" }} // Ruta de tu imagen
            >
              {/* Overlay opcional para que el texto sea legible */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

              {/* Contenido (necesita relative para estar sobre el overlay) */}
              <div className="relative z-10 p-4">
                <h1 className="text-4xl font-black tracking-tight text-slate-800">
                  Bienvenido
                </h1>
                <p className="mt-4 text-lg text-slate-500">
                  Inicia tu registro para el formulario{" "}
                  <span className="font-mono font-bold text-blue-600">
                    {formid}
                  </span>
                </p>
                <button
                  onClick={() => setCurrentStep(0)}
                  className="mt-8 w-full max-w-xs rounded-2xl bg-pink-500 py-4 font-bold text-white shadow-lg shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95"
                >
                  Comenzar Registro
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-col justify-center">
                <span className="mb-2 text-xs font-black tracking-widest text-blue-500 uppercase">
                  Paso {currentStep + 1} de {formSteps.length}
                </span>
                <label className="mb-6 block text-3xl leading-tight font-bold text-slate-800">
                  {currentField.label}
                  {currentField.mandatory && (
                    <span className="ml-2 text-blue-500">*</span>
                  )}
                </label>

                <input
                  key={currentField.id}
                  autoFocus
                  type={currentField.type}
                  placeholder={currentField.placeholder}
                  value={formData[currentField.id] as string}
                  onChange={(e) =>
                    handleChange(currentField.id, e.target.value)
                  }
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 text-xl shadow-sm transition-all outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="mt-10 flex items-center justify-between gap-6">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-sm font-bold tracking-widest text-slate-400 uppercase hover:text-slate-600"
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
                      ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
                      : "bg-pink-500 shadow-blue-100 hover:bg-pink-700"
                  }`}
                >
                  {isSending
                    ? "Guardando..."
                    : currentStep === formSteps.length - 1
                      ? "Finalizar"
                      : "Siguiente"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
