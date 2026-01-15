"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Swal from "sweetalert2";
import Link from "next/link";

interface CheckboxOption {
  label: string;
  value: string;
}

interface FinanceEntryForm {
  name: string;
  last_name: string;
  phone: string;
  ivercapacita: string;
  contactoapoderado: string;
  ref_grupo: string;
  ref_asignatura: string;
}

export default function LiveFormsPage3() {
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
    Swal.fire({
      title: `${form.name}, muchas gracias por inscribirse`,
      text: "Estaremos esperándote",
      icon: "success",
    });
  };

  const handleShowAlert = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const [form, setForm] = useState<FinanceEntryForm>({
    name: "",
    last_name: "",
    phone: "",
    ivercapacita: formid,
    contactoapoderado: "",
    ref_grupo: "",
    ref_asignatura: "",
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
        name: "",
        last_name: "",
        phone: "",
        ivercapacita: formid,
        contactoapoderado: "",
        ref_grupo: "",
        ref_asignatura: "",
      });
      return;
    } else {
      console.log("Registro guardado exitosamente");
      setForm({
        name: "",
        last_name: "",
        phone: "",
        ivercapacita: formid,
        contactoapoderado: "",
        ref_grupo: "",
        ref_asignatura: "",
      });
    }

    setIsSending(false);
    handleShowConfirm();
  };

  // ... (JSX for the form remains largely the same)
  return (
    <div className="align-center inline w-[50%] justify-center overflow-auto p-6">
      <div className="pb-5 text-center text-2xl font-bold text-white italic">
        {/* <h1>{formid}</h1> */}
        <p>Seminario de Danza Raíces profeticas - 21 de Febrero en IverChile</p>
      </div>
      <div className="text-md gap-3 pb-3 text-center text-white">
        <p className="pb-2">
          Te Invitamos a ser parte de Nuestro primer seminario, el cual estará
          enfocado en el origen de la danza y dónde nace tu adoración.
        </p>
        <p>
          Ven a descubrir lo que el Espíritu Santo quiere revelar a tu Vida y
          así adquirir conocimientos que ayudarán en tu crecimiento espiritual y
          personal para el desarrollo de tu ministerio.
        </p>
        <p className="pt-2 text-sm font-bold italic">
          * Te recordamos que este seminario tiene un valor de inscripción de
          $10.000 e incluye el almuerzo.
        </p>
      </div>
      <div className="text-md border-t p-4 text-center text-white">
        <p>Ingrese sus datos aquí para participar</p>
      </div>
      {showAlert && (
        <div
          className="mb-4 rounded-lg bg-red-50 p-4 text-center text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          Usted ya está inscrito !!
        </div>
      )}

      <form className="sm:align-center pr-10 pl-10">
        <div className="mb-6 grid gap-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Nombre completo
            </label>

            <input
              type="text"
              id="name"
              name="name"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder={form.name}
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
          </div>

          <div>
            <label
              htmlFor="Apellidos"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Apellidos
            </label>

            <input
              type="text"
              id="last_name"
              name="last_name"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder={form.last_name}
              value={form.last_name}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>
          <div>
            <label
              htmlFor="number"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Edad
            </label>

            <input
              type="text"
              id="phone"
              name="phone"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder=""
              value={form.phone}
              onChange={handleChange}
              required
              // Si quieres validar formato chileno, podrías usar un pattern:
              // pattern="^\d{9}$"
            />
          </div>
          <div>
            <label
              htmlFor="contactoapoderado"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Telefono contacto
            </label>

            <input
              type="phone"
              id="contactoapoderado"
              name="contactoapoderado"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder=""
              value={form.contactoapoderado}
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
              ¿Participa en IverChile?
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
          {form.ref_grupo === "NO" ? (
            <div>
              <label
                htmlFor="ref_grupo"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                ¿De que iglesia nos visitarás?
              </label>
              <input
                type="ref_asignatura"
                id="ref_asignatura"
                name="ref_asignatura"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder={form.ref_asignatura}
                value={form.ref_asignatura}
                onChange={handleChange}
                required
                // autoComplete="given-name"
              />
            </div>
          ) : (
            []
          )}
        </div>

        {/* ... (Buttons) ... */}
        {form.name &&
          form.last_name &&
          form.phone &&
          form.ref_grupo &&
          form.contactoapoderado &&
          form.ref_asignatura && (
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
