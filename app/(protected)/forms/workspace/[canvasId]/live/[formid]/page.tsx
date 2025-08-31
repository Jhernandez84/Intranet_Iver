"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

interface FinanceEntryForm {
  rut: string;
  name: string;
  last_name: string;
  second_last_name: string;
  phone: string;
  ivercapacita: string;
}

export default function LiveFormsPage() {
  const supabase = createClientComponentClient();

  const { formid } = useParams<{ formid: string }>(); // <-- aquí tomas el [formid]
  const search = useSearchParams(); // por si usas ?program=...
  const program = search.get("program") ?? "";

  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [sendind, setIsSending] = useState(false);
  const [insertError, setSaveError] = useState<string | null>(null);

  const handleShowConfirm = () => {
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
    }, 5000); // 5000ms = 5 segundos
  };

  const handleShowAlert = () => {
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000); // 5000ms = 5 segundos
  };

  const [form, setForm] = useState<FinanceEntryForm>({
    rut: "",
    name: "",
    last_name: "",
    second_last_name: "",
    phone: "",
    ivercapacita: formid,
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

  const handleSubmit = async () => {
    console.log("guardando");
    setIsSending(true);
    setSaveError(null);

    const { error: insertError } = await supabase
      .from("temp_registros")
      .insert([
        {
          rut: form.rut,
          name: form.name,
          last_name: form.last_name,
          second_last_name: form.second_last_name,
          phone: form.phone,
          ivercapacita: formid,
        },
      ]);

    if (insertError) {
      console.error(
        "Error al guardar movimiento financiero:",
        insertError.message,
      );
      setSaveError(insertError.message);
      handleShowAlert();
      setForm({
        rut: "",
        name: "",
        last_name: "",
        second_last_name: "",
        phone: "",
        ivercapacita: formid,
      });

      return;
    } else {
      console.log("Registro guardado exitosamente");
      setForm({
        rut: "",
        name: "",
        last_name: "",
        second_last_name: "",
        phone: "",
        ivercapacita: formid,
      });
    }

    setIsSending(false);
    handleShowConfirm();
  };

  return (
    <div className="align-center inline w-[50%] justify-center overflow-auto p-6">
      <div className="pb-2 text-center text-lg text-white">
        <h1>{formid}</h1>
      </div>

      {showAlert && (
        <div
          className="mb-4 rounded-lg bg-red-50 p-4 text-center text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          Usted ya está inscrito para participar en un IverCapacita
        </div>
      )}

      <div className="text-md pb-2 text-center text-white">
        <p>
          Si tienes el deseo de aprender, solo ingresa tus datos y pon atención
          a las fechas que se informarán
        </p>
      </div>

      <form className="sm:align-center pr-10 pl-10">
        <div className="mb-6 grid gap-4">
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

          {/* <div>
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
          </div> */}
        </div>

        {form.rut &&
          form.name &&
          form.last_name &&
          form.second_last_name &&
          form.phone && (
            <button
              type="button"
              onClick={handleSubmit}
              className="me-2 mb-2 w-full cursor-pointer rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              Enviar ✅
            </button>
          )}

        {/* <p>
        Datos: {form.rut} - {form.name} - {form.last_name} -{" "}
        {form.second_last_name} - {form.phone} - {form.ivercapacita}
      </p> */}

        <Link href={`/forms/workspace/IverCapacita`}>
          <button
            type="button"
            className="me-2 mb-2 w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600"
          >
            Regresar ⬅️
          </button>
        </Link>
      </form>

      {showModal && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 z-50 mb-4 flex w-full max-w-xs items-center rounded-lg bg-white p-4 text-gray-700 shadow-lg dark:bg-gray-800 dark:text-gray-200"
          role="status"
          aria-live="polite"
        >
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200">
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Felicidades</span>
          </div>

          <div className="ms-3 text-sm font-medium">
            ¡Ya has quedado inscrito para {form.ivercapacita} !!
          </div>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="-mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <svg
              className="h-3 w-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
