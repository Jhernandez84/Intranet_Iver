"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Label,
  TextInput,
  Datepicker,
  Spinner,
} from "flowbite-react";
import { useState } from "react";
import { useUser } from "../../../../context/UserProvider";
import { useCompanyBranchesAccess } from "../../../../context/CompanyBranchesProvider";
import { useFinanceMovementsType } from "../../_Context/FinancesMovementsProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface FinanceEntryDataFormProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

interface FinanceEntryForm {
  fecha: Date; // o Date si trabajas con objetos Date
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: string; // o number si lo conviertes al guardar
  num_doc: string;
  observaciones: string;
  estado: string;
  sede_id?: string | null; // según cómo lo manejes
}

export default function FinanceEntryDataForm({
  openModal,
  setOpenModal,
}: FinanceEntryDataFormProps) {
  const { user, isLoading } = useUser();
  const Branches = useCompanyBranchesAccess();
  const { financeMovementTypes, isLoadingFinanceData } =
    useFinanceMovementsType();

  const supabase = createClientComponentClient();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [form, setForm] = useState<FinanceEntryForm>({
    fecha: selectedDate, // asegúrate que `fecha` sea string o Date según tu interfaz
    tipo: "Ingreso",
    tipo_mov: "Ingreso",
    metodo_pago: "Efectivo",
    monto: "0",
    num_doc: "",
    observaciones: "",
    estado: "Ingresado",
    sede_id: user?.sede_id ?? null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "tipo") {
      setForm({ ...form, tipo: e.target.value, tipo_mov: "" }); // Reset tipo_mov when tipo changes
    }
    console.log("Datos del formulario", form);
  };

  const handleDateChange = (date) => {
    // ✅ Actualiza el estado cuando el usuario selecciona una nueva fecha
    setSelectedDate(date);
  };

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log("guardando");
    setSaveLoading(true);
    setSaveError(null);

    const { error: insertError } = await supabase.from("finanzas").insert([
      {
        fecha: form.fecha,
        tipo: form.tipo,
        tipo_mov: form.tipo_mov,
        metodo_pago: form.metodo_pago,
        monto: parseFloat(form.monto),
        observaciones: form.observaciones,
        num_doc: form.num_doc,
        estado: form.estado,
        sede_id: form.sede_id,
        responsable_id: user.id,
        company_id: user.company_id,
      },
    ]);

    if (insertError) {
      console.error(
        "Error al guardar movimiento financiero:",
        insertError.message,
      );
      setSaveError(insertError.message);
    } else {
      console.log("Movimiento financiero guardado exitosamente");
      setForm({
        fecha: selectedDate, // asegúrate que `fecha` sea string o Date según tu interfaz
        tipo: "Ingreso",
        tipo_mov: "Ingreso",
        metodo_pago: "Efectivo",
        monto: "0",
        num_doc: "",
        observaciones: "",
        estado: "Ingresado",
        sede_id: user?.sede_id ?? null,
      });
    }

    setSaveLoading(false);
  };

  return (
    <>
      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        popup
        className="z-50"
      >
        <ModalHeader className="flex items-center">
          <p className="pl-5 text-center">Ingreso de nuevo registro</p>
        </ModalHeader>
        <ModalBody className="grid grid-cols-2 gap-6">
          {/* Left side, datepicker */}
          <div className="bg-grey-900 grid-cols[60%_40%] grid">
            <div>
              <div className="justify-self-start">
                <label
                  htmlFor="countries"
                  className="mt-2 mb-2 block pl-4 text-center text-sm font-medium text-gray-900 dark:text-white"
                >
                  Fecha del movimiento
                </label>
                <Datepicker
                  name="fecha"
                  inline
                  weekStart={1}
                  showTodayButton={false}
                  showClearButton={false}
                  value={form.fecha}
                  onChange={handleDateChange}
                />
              </div>
              <div className="group z-0 grid w-full pt-5 text-white">
                {user.sede_id ? (
                  []
                ) : (
                  <>
                    <label
                      htmlFor="sede_id"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Movimiento para Sede:
                    </label>
                    <select
                      name="sede_id"
                      id="sede_id"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      onChange={handleChange}
                    >
                      {Branches.map((accessData) => {
                        return (
                          <option
                            selected
                            key={accessData.id}
                            value={accessData.id}
                          >
                            {accessData.nombre}
                          </option>
                        );
                      })}
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Right side, input forms */}

          <section className="mx-auto w-full max-w-md p-2">
            <div className="group z-0 grid w-full text-white">
              <label
                htmlFor="countries"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Movimiento
              </label>
              <select
                id="tipo"
                name="tipo"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                onChange={handleChange}
              >
                <option selected value="Ingreso">
                  Ingreso
                </option>
                <option value="Egreso">Egreso</option>
                <option value="Traspaso">Traspaso</option>
              </select>
            </div>
            <div className="group z-0 mt-2 grid w-full text-white">
              <div className="group z-0 grid w-full text-white">
                <label
                  htmlFor="countries"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Clasificación
                </label>
                <select
                  id="tipo_mov"
                  name="tipo_mov"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  onChange={handleChange}
                >
                  {financeMovementTypes
                    ?.filter((types) => types.tipo_movimiento === form.tipo)
                    .map((types) => (
                      <option key={types.id} value={types.id}>
                        {types.tipo_mov_generico}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="group z-0 mt-2 grid w-full text-white">
              <div className="group z-0 grid w-full text-white">
                <label
                  htmlFor="countries"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Número de documento
                </label>
                <input
                  type="number"
                  id="num_doc"
                  name="num_doc"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder=""
                  required
                  disabled={form.tipo == "Ingreso"}
                  onChange={handleChange}
                  value={form.num_doc}
                />
              </div>
            </div>

            <div className="group z-0 mt-2 grid w-full text-white">
              <div className="group z-0 grid w-full text-white">
                <label
                  htmlFor="visitors"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Monto
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder=""
                  required
                  onChange={handleChange}
                  value={form.monto}
                />
              </div>
            </div>
            <div className="group z-0 mt-2 grid w-full text-white">
              <div className="group z-0 grid w-full text-white">
                <label
                  htmlFor="countries"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Medio de pago
                </label>
                <select
                  id="metodo_pago"
                  name="metodo_pago"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  onChange={handleChange}
                >
                  <option selected value="Efectivo">
                    Efectivo
                  </option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="group z-0 mt-2 grid w-full text-white">
              <label
                htmlFor="message"
                className="mb-2 block w-full text-sm font-medium text-gray-900 dark:text-white"
              >
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="..."
                onChange={handleChange}
                value={form.observaciones}
              ></textarea>
            </div>
          </section>
        </ModalBody>
        <ModalFooter className="flex justify-end">
          <Button
            disabled={saveLoading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
            onClick={handleSubmit}
          >
            {saveLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>

          <Button
            className="cursor-pointer"
            color="alternative"
            onClick={() => setOpenModal(false)}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
