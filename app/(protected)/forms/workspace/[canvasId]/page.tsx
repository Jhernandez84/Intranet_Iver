"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const AvailableForms = [
  {
    eventName: "Primeros Auxilios",
    formId: "IverCapacitaPrimerosAuxilios",
    description:
      "Estar preparados para actuar ante una situación de emergencia / urgencia, recibiendo herramientas y siendo respaldados por Dios a través de este proyecto",
    attendance: "25",
    imageUrl: "/Gemini_Generated_Image_7jmyc17jmyc17jmy.png",
  },
  {
    eventName: "Finanzas y Emprendimientos",
    formId: "IverCapacitaFinanzasyEmprendimientos",
    description: "descripción",
    attendance: "100",
    imageUrl: "/Gemini_Generated_Image_g4mioxg4mioxg4mi.png",
  },
  {
    eventName: "Inglés",
    formId: "IverCapacitaIngles",
    description: "descripción",
    attendance: "50",
    imageUrl: "/Gemini_Generated_Image_dwxhh6dwxhh6dwxh.png",
  },
  {
    eventName: "Reforzamiento",
    formId: "IverCapacitaReforzamiento",
    description: "descripción",
    attendance: "100",
    imageUrl: "/Gemini_Generated_Image_ugfw5lugfw5lugfw.png",
  },
  {
    eventName: "Lenguaje de Señas",
    formId: "IverCapacitaLenguajedeSeñas",
    description: "descripción",
    attendance: "40",
    imageUrl: "/Gemini_Generated_Image_9xmvpw9xmvpw9xmv.png",
  },
];

export default function WorksSpacePage() {
  // const search = useSearchParams();

  const { formid } = useParams<{ formid: string }>();
  const id = String(formid ?? "");

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
        {AvailableForms.map((form) => {
          return (
            <>
              <Link
                key={form.formId}
                className="grid h-full min-h-[10rem] transform grid-cols-[40%_60%] rounded-lg border border-gray-200 bg-white shadow-md shadow-sm transition-transform duration-300 ease-in-out hover:scale-104 md:h-[13rem] dark:border-gray-700 dark:bg-gray-800"
                href={`/forms/live/${form.formId}`}
              >
                {/* className="grid h-full grid-cols-[40%_60%] rounded-lg border border-gray-200 bg-white shadow-sm md:h-[13rem] dark:border-gray-700 dark:bg-gray-800"> */}
                {/* Imagen */}
                <Image
                  src={form.imageUrl}
                  alt={form.eventName}
                  width={270} // Puedes ajustar el ancho
                  height={50} // Y la altura
                  quality={100} // Opcional, para ajustar la calidad de la imagen
                  className="h-full w-full rounded-l-lg object-cover"
                />

                {/* Contenido */}
                <div className="grid grid-rows-[15%_70%_15%]">
                  <div className="flex items-center justify-center">
                    <p className="text-md mt-2 text-center font-bold tracking-tight text-gray-900 dark:text-white">
                      {form.eventName}
                    </p>
                  </div>

                  {/* Descripción con ellipsis */}
                  <div className="p-4 pt-6">
                    <p className="line-clamp-3 overflow-hidden text-sm text-ellipsis text-gray-700 sm:line-clamp-3 md:line-clamp-none dark:text-gray-400">
                      {form.description}
                    </p>
                  </div>

                  <div className="pl-4">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      Cupos: {form.attendance}, inscritos: {form.attendance}
                    </p>
                  </div>
                </div>
              </Link>
            </>
          );
        })}
      </div>
    </div>
  );
}
