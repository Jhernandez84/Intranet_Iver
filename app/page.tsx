"use client";

import { DarkThemeToggle } from "flowbite-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoginModal from "./components/loginModal/LoginModal";
import { useEffect } from "react";
import { initFlowbite } from "flowbite";

export default function Home() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl leading-tight font-extrabold text-gray-900">
            Transforma tus datos en decisiones
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Una solución poderosa para organizar, analizar y visualizar tus
            datos de manera eficiente y segura.
          </p>

          <a
            href="#"
            className="mt-10 inline-block transform rounded-full bg-blue-600 px-8 py-3 text-lg text-white transition duration-300 hover:scale-105 hover:bg-blue-700"
          >
            Pruébalo gratis
          </a>
        </div>
      </section>

      <section id="features" className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900">
              La gestión de datos simplificada
            </h2>
            <p className="mt-4 text-gray-600">
              Descubre cómo nuestra plataforma puede ayudarte a optimizar tus
              procesos.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            <div className="w-full transform rounded-xl bg-white p-6 shadow-lg transition duration-300 hover:scale-105 sm:w-1/2 lg:w-1/3">
              <div className="flex flex-col items-center text-center">
                <img
                  src="https://oaidalleapiprodscus.blob.core.windows.net/private/org-vW8vI0R6f4g8J8vT3Z6sS6n2/user-L3vY1qH3l5m1N5e6k6e6n5f2/img-D5wM9B2G2d8tC0i6j0E5wN5j.png"
                  alt="Icono de datos centralizados"
                  className="ai-icon mb-6 h-32 w-32 rounded-lg"
                />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Datos centralizados
                </h3>
                <p className="text-gray-600">
                  Unifica todas tus fuentes de datos en un solo lugar. Accede a
                  tu información de forma rápida y eficiente.
                </p>
              </div>
            </div>

            <div className="w-full transform rounded-xl bg-white p-6 shadow-lg transition duration-300 hover:scale-105 sm:w-1/2 lg:w-1/3">
              <div className="flex flex-col items-center text-center">
                <img
                  src="https://oaidalleapiprodscus.blob.core.windows.net/private/org-vW8vI0R6f4g8J8vT3Z6sS6n2/user-L3vY1qH3l5m1N5e6k6e6n5f2/img-O9hR3rT5g2v6f1J0d5B6z7S7.png"
                  alt="Icono de análisis de datos"
                  className="ai-icon mb-6 h-32 w-32 rounded-lg"
                />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Análisis intuitivo
                </h3>
                <p className="text-gray-600">
                  Utiliza herramientas de análisis potentes para descubrir
                  tendencias y obtener insights valiosos sin esfuerzo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            ¿Listo para empezar?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Únete a miles de usuarios que ya están transformando su forma de
            trabajar con datos.
          </p>
          <a
            href="#"
            className="mt-8 inline-block transform rounded-full bg-blue-600 px-8 py-3 text-lg text-white transition duration-300 hover:scale-105 hover:bg-blue-700"
          >
            Contáctanos
          </a>
        </div>
      </section>

      <footer className="bg-gray-800 py-8 text-white">
        <div className="container mx-auto px-6 text-center text-gray-400">
          &copy; 2025 DataFlow. Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}
