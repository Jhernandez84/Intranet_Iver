"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface FinanceEntryForm {
  rut: string;
  name: string;
  last_name: string;
  second_last_name: string;
  phone: string;
  ivercapacita: string;
}

export default function LiveFormsPage() {
  const { formid } = useParams<{ formid: string }>(); // <-- aquí tomas el [formid]
  const search = useSearchParams(); // por si usas ?program=...
  const program = search.get("program") ?? "";

  const [form, setForm] = useState<FinanceEntryForm>({
    rut: "",
    name: "",
    last_name: "",
    second_last_name: "",
    phone: "",
    ivercapacita: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log("Form ID:", formid, "Program:", program);
  }, [formid, program]);

  return (
    <div className="align-center inline justify-center overflow-auto p-6">
      <div className="text-center text-lg text-white">
        <h1>{formid}</h1>
      </div>

      <div className="text-md pb-2 text-center text-white">
        <p>
          Pronto vamos a comenzar un ciclo de enseñanza en 5 áreas, ser parte es
          muy simple, solo completa tus datos y estás listo
        </p>
      </div>

      <form>
        <div className="mb-6 grid gap-6">
          <div>
            <label
              htmlFor="rut"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Rut
            </label>
            <input
              type="text"
              id="rut"
              name="rut"
              maxLength={8}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="12345678"
              value={form.rut}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Nombres
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="John"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Apellido Paterno
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Apellido Paterno"
              value={form.last_name}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>

          <div>
            <label
              htmlFor="second_last_name"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Apellido Materno
            </label>
            <input
              type="text"
              id="second_last_name"
              name="second_last_name"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Apellido Materno"
              value={form.second_last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="999999999"
              value={form.phone}
              onChange={handleChange}
              required
              // Si quieres validar formato chileno, podrías usar un pattern:
              // pattern="^\d{9}$"
            />
          </div>

          <div>
            <label
              htmlFor="ivercapacita"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              ¿En qué IverCapacita quieres participar?
            </label>
            <select
              id="ivercapacita"
              name="ivercapacita"
              value={form.ivercapacita}
              onChange={handleChange}
              className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              required
            >
              <option value="">Seleccione</option>
              <option value="Finanzas Personales">Finanzas Personales</option>
              <option value="Reforzamiento (Escolares)">
                Reforzamiento (Escolares)
              </option>
              <option value="Lenguaje de Señas">Lenguaje de Señas</option>
              <option value="Inglés">Inglés</option>
              <option value="Primeros Auxilios">Primeros Auxilios</option>
            </select>
          </div>
        </div>
      </form>

      <button
        type="button"
        onClick={() => {
          alert("Enviando formulario");
          // aquí podrías enviar `form` a tu backend/Supabase
        }}
        className="me-2 mb-2 w-full cursor-pointer rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        Enviar ✅
      </button>

      <p>
        Datos: {form.rut} - {form.name} - {form.last_name} -{" "}
        {form.second_last_name} - {form.phone} - {form.ivercapacita}
      </p>
    </div>
  );
}
