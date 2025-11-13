"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
// 1. Importar SweetAlert2
import Swal from "sweetalert2";

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

  // 2. Eliminar showModal ya que SweetAlert2 lo reemplazará
  // const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Mantener este para el error dentro del formulario si lo prefieres

  const [sendind, setIsSending] = useState(false);
  const [insertError, setSaveError] = useState<string | null>(null);

  // 3. Función reemplazada para mostrar SweetAlert2 de éxito
  const handleShowConfirm = () => {
    Swal.fire({
      icon: "success",
      title: "¡Felicidades!",
      text: `Ha quedado inscrit@ para ${form.ivercapacita}!!`,
      showConfirmButton: false,
      timer: 3000,
    });

    // Si quieres redirigir después de la alerta, usa la promesa de Swal
    // Swal.fire({...}).then(() => {
    //   router.push(`/forms/workspace/IverCapacita`);
    // });
  };

  // Función para mostrar SweetAlert2 de error
  const handleShowErrorAlert = (message: string) => {
    Swal.fire({
      icon: "error",
      title: "Error de Inscripción",
      text: message,
      confirmButtonText: "Entendido",
    });
    // Opcionalmente, puedes mantener la alerta interna si quieres:
    // setShowAlert(true);
    // setTimeout(() => {
    //   setShowAlert(false);
    // }, 5000);
  };

  // Eliminamos la función original handleShowAlert si solo se usaba para el error.
  // const handleShowAlert = () => {
  //   setShowAlert(true);
  //   setTimeout(() => {
  //     setShowAlert(false);
  //   }, 5000);
  // };

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
        },
      ]);

    if (insertError) {
      console.error(
        "Error al guardar movimiento financiero:",
        insertError.message,
      );
      setSaveError(insertError.message);

      // 4. Usar SweetAlert2 para el error
      handleShowErrorAlert(
        "Usted ya está inscrito o hubo un error: " + insertError.message,
      );

      setForm({
        rut: "",
        name: "",
        last_name: "",
        phone: "",
        fec_nac: "",
        ivercapacita: formid,
        ref_grupo: "",
      });
      setIsSending(false); // Mover aquí para que el botón se habilite si falla
      return;
    } else {
      console.log("Registro guardado exitosamente");
      // Limpiar formulario y mostrar SweetAlert de éxito
      setForm({
        rut: "",
        name: "",
        last_name: "",
        phone: "",
        fec_nac: "",
        ivercapacita: formid,
        ref_grupo: "",
      });
      handleShowConfirm();
    }

    setIsSending(false);
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
          height={0}
          quality={100}
          className="m-2 mx-auto block rounded-lg object-cover"
        />
        <p className="m-2 text-lg font-bold">
          Le recordamos que el valor de inscripción es de $5.000 e incluye el
          almuerzo
        </p>
        <hr />
        <p className="mt-2 font-bold">
          Si desea pagar con transferencia, puede hacerlo a la siguiente cuenta:
        </p>
        <p>Nombre: Jacqueline Espinoza </p>
        <p>Rut: 14342646-7</p>
        <p>Banco: BCI</p>
        <p>Cuenta: Cuenta vista</p>
        <p className="mb-2">Número de cuenta: 41500130</p>
        <hr />
        <p className="m-2 font-bold italic">
          * Pagos en efectivo directamente en Iver el día del evento
        </p>
        <hr />
      </div>
      <div className="pb-4 text-center text-lg font-bold text-white">
        <p>Ingrese sus datos para finalizar su inscripción</p>
      </div>
      {/* 5. Dejar este mensaje de error solo si quieres la alerta interna además de SweetAlert2 */}
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
              disabled={sendind} // Deshabilitar mientras se envía
              className={`me-2 mb-2 w-full cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium text-white ${sendind ? "bg-gray-500" : "bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"}`}
            >
              {sendind ? "Enviando..." : "Enviar ✅"}
            </button>
          )}
      </form>

      {/* 6. Eliminar el JSX del toast-success anterior */}
      {/* {showModal && (...) } */}
    </div>
  );
}
