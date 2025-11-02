"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";

interface CheckboxOption {
  label: string;
  value: string;
}

interface FinanceEntryForm {
  rut: string;
  name: string;
  last_name: string;
  phone: string;
  ivercapacita: string;
  fec_nac: string;
  ref_grupo: string;
}

export default function LiveFormsPage2() {
  const supabase = createClientComponentClient();

  const router = useRouter();

  const { formid } = useParams<{ formid: string }>();
  const search = useSearchParams();
  const program = search.get("program") ?? "";

  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [sendind, setIsSending] = useState(false);
  const [insertError, setSaveError] = useState<string | null>(null);

  const handleShowConfirm = () => {
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
      // router.push(`/forms/workspace/IverCapacita`);
    }, 2000);
  };

  const handleShowAlert = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const [form, setForm] = useState<FinanceEntryForm>({
    rut: "",
    name: "",
    last_name: "",
    phone: "",
    ivercapacita: formid,
    fec_nac: "",
    ref_grupo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value, checked } = event.target;

  //   setForm((prevForm) => {
  //     if (checked) {
  //       // ✅ Add the value to the ref_target array
  //       return {
  //         ...prevForm,
  //         ref_target: [...prevForm.ref_target, value],
  //       };
  //     } else {
  //       // ✅ Remove the value from the ref_target array
  //       return {
  //         ...prevForm,
  //         ref_target: prevForm.ref_target.filter((item) => item !== value),
  //       };
  //     }
  //   });
  // };

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
          ...form,
          // Convert array to string for Supabase TEXT column if needed
          // ref_target: form.ref_target.join(','),
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
        phone: "",
        fec_nac: "",
        ivercapacita: formid,
        ref_grupo: "",
      });
      return;
    } else {
      console.log("Registro guardado exitosamente");
      setForm({
        rut: "",
        name: "",
        last_name: "",
        phone: "",
        fec_nac: "",
        ivercapacita: formid,
        ref_grupo: "",
      });
    }

    setIsSending(false);
    handleShowConfirm();
  };

  // ... (JSX for the form remains largely the same)
  return (
    <div className="align-center inline w-[50%] justify-center overflow-auto p-6">
      <div className="pb-5 text-center text-2xl font-bold text-white">
        {/* <h1>{formid}</h1> */}
        <p>Levántate y Resplandece - Aviva, 2025 Noviembre 22</p>
      </div>
      <div className="pb-3 text-center text-sm text-white">
        <Image
          src="/ImagenAviva.jpeg"
          alt="Levántate y Resplandece - Aviva"
          width={270}
          height={100}
          quality={100}
          className="h-full w-full rounded-l-lg object-cover"
        />
        <p></p>
      </div>
      <div className="text-md pb-4 text-center text-white">
        <p>Ingrese sus datos para finalizar su inscripción</p>
      </div>
      {showAlert && (
        <div
          className="mb-4 rounded-lg bg-red-50 p-4 text-center text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          Usted ya está inscrito para participar en Aviva
        </div>
      )}

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
              type="number"
              id="rut"
              name="rut"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="12345678"
              value={form.rut}
              onChange={handleChange}
              required
              autoComplete="given-name"
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
              placeholder="Nombres"
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
              Apellidos
            </label>

            <input
              type="text"
              id="last_name"
              name="last_name"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Apellidos"
              value={form.last_name}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Número de contacto
            </label>

            <input
              type="phone"
              id="phone"
              name="phone"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="9123456789"
              value={form.phone}
              onChange={handleChange}
              required
              // Si quieres validar formato chileno, podrías usar un pattern:
              // pattern="^\d{9}$"
            />
          </div>
          <div>
            <label
              htmlFor="fec_nac"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Fecha de nacimiento
            </label>

            <input
              type="date"
              id="fec_nac"
              name="fec_nac"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder=""
              value={form.fec_nac}
              onChange={handleChange}
              required
              // Si quieres validar formato chileno, podrías usar un pattern:
              // pattern="^\d{9}$"
            />
          </div>

          <div>
            <label
              htmlFor="ref_grupo"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Eres parte de la casa Iver?
            </label>
            <select
              id="ref_grupo"
              name="ref_grupo"
              value={form.ref_grupo}
              onChange={handleChange}
              className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              required
            >
              <option value="">Seleccione</option>
              <option value="SI">Si</option>
              <option value="NO">No</option>
            </select>
          </div>
        </div>

        {/* ... (Buttons) ... */}
        {form.rut &&
          form.name &&
          form.last_name &&
          form.phone &&
          form.fec_nac &&
          form.ref_grupo && (
            <button
              type="button"
              onClick={handleSubmit}
              className="me-2 mb-2 w-full cursor-pointer rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              Enviar ✅
            </button>
          )}

        {/* <Link href={`/forms/workspace/IverCapacita`}>
          <button
            type="button"
            className="me-2 mb-2 w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600"
          >
            Regresar ⬅️
          </button>
        </Link> */}
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
            Felicidades!! has quedado inscrito para {form.ivercapacita} !!
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
