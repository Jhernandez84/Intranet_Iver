"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const AvailableForms = [
  {
    eventName: "Primeros Auxilios",
    formId: "IverCapacitaPrimerosAuxilios",
    description:
      "Estar preparados para actuar ante una situación de emergencia / urgencia, recibiendo herramientas y siendo respaldados por Dios a través de este proyecto",
    attendance: "25",
    imageUrl:
      "https://www.elegantthemes.com/blog/wp-content/uploads/2022/03/Canonical-URL-featured-2.jpg",
  },
  {
    eventName: "Finanzas y Emprendimientos",
    formId: "IverCapacitaFinanzasyEmprendimientos",
    description: "descripción",
    attendance: "100",
    imageUrl:
      "https://www.elegantthemes.com/blog/wp-content/uploads/2022/03/Canonical-URL-featured-2.jpg",
  },
  {
    eventName: "Inglés",
    formId: "IverCapacitaIngles",
    description: "descripción",
    attendance: "50",
    imageUrl:
      "https://www.elegantthemes.com/blog/wp-content/uploads/2022/03/Canonical-URL-featured-2.jpg",
  },
  {
    eventName: "Reforzamiento",
    formId: "IverCapacitaReforzamiento",
    description: "descripción",
    attendance: "100",
    imageUrl:
      "https://www.elegantthemes.com/blog/wp-content/uploads/2022/03/Canonical-URL-featured-2.jpg",
  },
  {
    eventName: "Lenguaje de Señas",
    formId: "IverCapacitaLenguajedeSeñas",
    description: "descripción",
    attendance: "40",
    imageUrl:
      "https://www.elegantthemes.com/blog/wp-content/uploads/2022/03/Canonical-URL-featured-2.jpg",
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
                <img
                  className="h-full w-full rounded-l-lg object-cover"
                  src={form.imageUrl}
                  alt={form.eventName}
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
