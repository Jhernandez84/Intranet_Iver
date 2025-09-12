"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface TheForm {
  AvailableForms: boolean;
  setOpenModal: (value: boolean) => void;
}

type EventDate = { Date: string };

type FormItem = {
  eventName: string;
  formId: string;
  description: string;
  attendance: string; // viene como string en tu arreglo original
  imageUrl: string;
  eventSessions: string;
  eventType: string;
  eventAttendance: string;
  eventTime: string;
  eventDates: EventDate[];
};

const AvailableForms: FormItem[] = [
  {
    eventName: "Primeros Auxilios",
    formId: "IverCapacitaPrimerosAuxilios",
    description:
      "Estar preparados para actuar ante una situación de emergencia / urgencia, recibiendo herramientas y siendo respaldados por Dios a través de este proyecto",
    attendance: "25",
    imageUrl: "/Gemini_Generated_Image_7jmyc17jmyc17jmy.png",
    eventSessions: "4 sesiones",
    eventType: "Clase Grupal",
    eventAttendance: "100% presencial",
    eventTime: "90 Minutos",
    eventDates: [
      { Date: "27-Sept" },
      { Date: "04-Oct" },
      { Date: "11-Oct" },
      { Date: "25-Oct" },
    ],
  },
  {
    eventName: "Finanzas y Emprendimientos",
    formId: "IverCapacitaFinanzasyEmprendimientos",
    description:
      "Prosperar no es solo recibir más y más, es saber administrar lo que Dios pone en nuestras manos.",
    attendance: "100",
    imageUrl: "/Gemini_Generated_Image_g4mioxg4mioxg4mi.png",
    eventSessions: "3 sesiones",
    eventType: "Seminario",
    eventAttendance: "100% presencial",
    eventTime: "5 horas",
    eventDates: [{ Date: "01-Nov" }, { Date: "08-Nov" }, { Date: "15-Nov" }],
  },
  {
    eventName: "Inglés",
    formId: "IverCapacitaIngles",
    description:
      "You can make it... Si quieres tomar el desafío de aprender un nuevo idioma, este curso es para ti. ",
    attendance: "70",
    imageUrl: "/Gemini_Generated_Image_dwxhh6dwxhh6dwxh.png",
    eventSessions: "3 Meses",
    eventType: "Intensivo",
    eventAttendance: "Híbrido (Online y Presencial)",
    eventTime: "1 hora cada día",
    eventDates: [
      { Date: "Miércoles y Viernes desde el 1ro de Oct (+ 2 Sábados al mes)" },
    ],
  },
  {
    eventName: "Reforzamiento",
    formId: "IverCapacitaReforzamiento",
    description:
      "Si alguna asignatura se está haciendo más dificil de lo que esperabas, inscribite en los talleres de reforzamiento, aún hay tiempo para mejorar",
    attendance: "100",
    imageUrl: "/Gemini_Generated_Image_ugfw5lugfw5lugfw.png",
    eventSessions: "2 Meses",
    eventType: "Clases Grupales",
    eventAttendance: "100% presencial",
    eventTime: "1 hora 30 minutos",
    eventDates: [{ Date: "Todos los viernes desde el 4 Oct" }],
  },
  {
    eventName: "Lenguaje de Señas",
    formId: "IverCapacitaLenguajedeSeñas",
    description:
      "Comunicate más allá de las palabras y aplica el verdadero concepto de inclusión llevando a Jesús a quienes pueden oir de una manera diferente",
    attendance: "30",
    imageUrl: "/Gemini_Generated_Image_9xmvpw9xmvpw9xmv.png",
    eventSessions: "2 Meses",
    eventType: "Clases Grupales",
    eventAttendance: "100% presencial",
    eventTime: "90 Minutos",
    eventDates: [{ Date: "Todos los miércoles desde el 24-Sept" }],
  },
];

async function getTempCount(formid: string) {
  const supabase = createClientComponentClient();

  const { count, error } = await supabase
    .from("temp_registros")
    .select("rut", { count: "exact", head: true })
    .eq("ivercapacita", formid);

  if (error) {
    console.error("Error al obtener el recuento de inscritos:", error);
    return 0;
  }
  return count ?? 0;
}

export default function WorksSpacePage() {
  const { formid } = useParams<{ formid: string }>();
  const id = String(formid ?? "");

  const [formCounts, setFormCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCounts() {
      const counts: Record<string, number> = {};

      await Promise.all(
        AvailableForms.map(async (form) => {
          const n = await getTempCount(form.formId);
          counts[form.formId] = n;
        }),
      );

      if (isMounted) {
        setFormCounts(counts);
        setLoading(false);
      }
    }

    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, []); // la lista estática no necesita ir en deps

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-white">Cargando formularios...</p>
      </div>
    );
  }

  const filteredForms = AvailableForms.filter((form) => {
    const inscritos = formCounts[form.formId] ?? 0;
    const capacidad = Number(form.attendance);
    return inscritos < capacidad;
  });

  return (
    <div className="align-center inline justify-center overflow-auto p-6">
      <div className="text-center text-lg text-white">
        <h1>Iver Capacita {id}</h1>
      </div>

      <div className="text-md pb-4 text-center text-white">
        <p>
          Pronto vamos a comenzar un ciclo de enseñanza en 5 áreas, ser parte es
          muy simple, solo completa tus datos y estás listo
        </p>
      </div>

      <div className="grid grid-cols-1 justify-between gap-4 md:grid-cols-2">
        {filteredForms.map((form) => (
          <Link
            key={form.formId}
            className="grid h-full min-h-[10rem] transform grid-cols-[40%_60%] rounded-lg border border-gray-200 bg-white shadow-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-105 md:h-[13rem] dark:border-gray-700 dark:bg-gray-800"
            href={`/forms/live/${form.formId}`}
          >
            {/* Imagen */}
            <Image
              src={form.imageUrl}
              alt={form.eventName}
              width={270}
              height={100}
              quality={100}
              className="h-full w-full rounded-l-lg object-cover"
            />

            {/* Contenido */}
            <div className="grid grid-rows-[10%_50%_25%_10%]">
              <div className="flex items-center justify-center">
                <p className="text-md mt-2 text-center font-bold tracking-tight text-gray-900 dark:text-white">
                  {form.eventName}
                </p>
              </div>

              {/* Descripción */}
              <div className="p-4 pt-6">
                <p className="line-clamp-3 overflow-hidden text-xs text-ellipsis text-gray-700 sm:line-clamp-3 md:line-clamp-none dark:text-gray-400">
                  {form.description}
                </p>
              </div>

              {/* Fechas/Tipo */}
              <div className="pl-4">
                <div className="pl-4 text-xs">
                  {form.eventType} · {form.eventSessions} · {form.eventTime}
                </div>
                <div className="pl-4 text-xs">
                  {form.eventDates.map((d) => d.Date).join(" · ")}
                </div>
              </div>

              <div className="pl-4">
                <p className="text-xs text-gray-700 dark:text-gray-400">
                  Cupos: {Number(form.attendance)}, inscritos:{" "}
                  {formCounts[form.formId] ?? 0}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
