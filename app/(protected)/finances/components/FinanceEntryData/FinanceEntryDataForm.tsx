"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Datepicker,
  Spinner,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserProvider";
import { useCompanyBranchesAccess } from "../../../../context/CompanyBranchesProvider";
import { useFinanceMovementsType } from "../../_Context/FinancesMovementsProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useFinanceData } from "../../_Context/FinancesProvider";
import { fetchMovementDetail } from "./CRUD_Finance_Forms";

interface FinanceEntryDataFormProps {
  initialValues: FinanceEntryForm; // valores iniciales que vienen desde la tabla
  editView: boolean;
  openModal: boolean;
  movementId: string;
  setOpenModal: (value: boolean) => void;
}

interface FinanceEntryForm {
  // Unificamos fecha como string "YYYY-MM-DD" para ser 100% compatible con el provider y los inputs
  fecha: string;
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: string; // string para input number; casteamos al guardar
  num_doc: string;
  observaciones: string;
  estado: string;
  sede_id?: string | null;
}

/** Tipos para evitar `any` */
interface Branch {
  id: string;
  nombre: string;
}
interface FinanceMovementType {
  id: string;
  tipo_movimiento: string; // "Ingreso" | "Egreso" | "Traspaso"
  tipo_mov_generico: string; // Ej: "Servicios", "Arriendo", etc.
}

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function FinanceEntryDataForm({
  initialValues,
  editView,
  movementId,
  openModal,
  setOpenModal,
}: FinanceEntryDataFormProps) {
  const { user } = useUser();

  // Tipamos el retorno de los providers localmente
  const BranchesRaw = useCompanyBranchesAccess();
  const Branches: Branch[] = Array.isArray(BranchesRaw)
    ? (BranchesRaw as Branch[])
    : [];

  const { financeMovementTypes: financeMovementTypesRaw } =
    useFinanceMovementsType();
  const financeMovementTypes: FinanceMovementType[] = Array.isArray(
    financeMovementTypesRaw,
  )
    ? (financeMovementTypesRaw as FinanceMovementType[])
    : [];

  const { refreshFinanceMovements } = useFinanceData();
  const supabase = createClientComponentClient();

  // Estado del formulario (todo como string y valores planos)
  const [form, setForm] = useState<FinanceEntryForm>(initialValues);

  // Date para el Datepicker (usa Date), pero sincronizado con form.fecha (string)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // si viene vacío, caerá al día de hoy
    const fallback = new Date();
    if (!initialValues?.fecha) return fallback;
    // si la fecha viene como "YYYY-MM-DD", la interpretamos en UTC para no desfasar por tz
    const [y, m, d] = initialValues.fecha.split("-").map(Number);
    if (!y || !m || !d) return fallback;
    return new Date(Date.UTC(y, m - 1, d));
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sincroniza el form y el datepicker cuando abres el modal con otro registro
  useEffect(() => {
    if (!openModal) return;
    // normaliza initialValues y sincroniza estados
    const todayStr = toYmd(new Date());
    const normalized: FinanceEntryForm = {
      fecha: initialValues?.fecha || todayStr,
      tipo: initialValues?.tipo ?? "Ingreso",
      tipo_mov: initialValues?.tipo_mov ?? "",
      metodo_pago: initialValues?.metodo_pago ?? "Efectivo",
      monto: initialValues?.monto ?? "0",
      num_doc: initialValues?.num_doc ?? "",
      observaciones: initialValues?.observaciones ?? "",
      estado: initialValues?.estado ?? "Ingresado",
      sede_id: initialValues?.sede_id ?? user?.sede_id ?? null,
    };
    setForm(normalized);

    // Ajusta el datepicker según el string del form
    try {
      const [y, m, d] = normalized.fecha.split("-").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      setSelectedDate(dt);
    } catch {
      setSelectedDate(new Date());
    }
  }, [initialValues, openModal, user?.sede_id]);

  // Handler genérico de inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Si cambia "tipo", resetea "tipo_mov" para forzar re-selección coherente
    if (name === "tipo") {
      setForm((prev) => ({ ...prev, tipo: value, tipo_mov: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Datepicker => actualiza selectedDate (Date) y form.fecha (string "YYYY-MM-DD")
  const handleDateChange = (date: Date) => {
    // El Datepicker de flowbite entrega un Date local; lo normalizamos a y-m-d string
    setSelectedDate(date);
    setForm((prev) => ({
      ...prev,
      fecha: toYmd(date),
    }));
  };

  const handleSubmit = async () => {
    setSaveLoading(true);
    setSaveError(null);

    // Parse seguro del monto
    const montoNumber = Number.parseFloat(form.monto || "0");

    // Inserta (si deseas editar, cambia por .update() con .eq('id', movementId))
    const { error: insertError } = await supabase.from("finanzas").insert([
      {
        fecha: form.fecha, // string "YYYY-MM-DD" — Postgres lo castea a date
        tipo: form.tipo,
        tipo_mov: form.tipo_mov,
        metodo_pago: form.metodo_pago,
        monto: Number.isFinite(montoNumber) ? montoNumber : 0,
        observaciones: form.observaciones,
        num_doc: form.num_doc,
        estado: form.estado,
        sede_id: form.sede_id ?? user?.sede_id ?? null,
        responsable_id: user?.id,
        company_id: user?.company_id,
      },
    ]);

    if (insertError) {
      console.error(
        "Error al guardar movimiento financiero:",
        insertError.message,
      );
      setSaveError(insertError.message);
      setSaveLoading(false);
      return;
    }

    // Reset “nuevo” (manteniendo coherencia tipos)
    const todayStr = toYmd(new Date());
    const reset: FinanceEntryForm = {
      fecha: todayStr,
      tipo: "Ingreso",
      tipo_mov: "",
      metodo_pago: "Efectivo",
      monto: "0",
      num_doc: "",
      observaciones: "",
      estado: "Ingresado",
      sede_id: user?.sede_id ?? null,
    };
    setForm(reset);
    setSelectedDate(new Date());

    setSaveLoading(false);
    await refreshFinanceMovements();
    setOpenModal(false);
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
          {editView ? (
            <span>
              <p className="pl-5 text-left">Edición de registro</p>
              <p className="pl-5 text-center text-sm">
                ID del registro: {movementId}
              </p>
            </span>
          ) : (
            <p className="pl-5 text-center">Ingreso de nuevo registro</p>
          )}
        </ModalHeader>

        <ModalBody className="grid grid-cols-2 gap-6">
          {/* Left side */}
          <div className="grid grid-cols-[60%_40%]">
            <div>
              <div className="justify-self-start">
                <label className="mt-2 mb-2 block pl-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                  Fecha del movimiento
                </label>

                {/* Datepicker controlado por selectedDate (Date) */}
                <Datepicker
                  name="fecha"
                  inline
                  weekStart={1}
                  showTodayButton={false}
                  showClearButton={false}
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>

              {/* Selección de sede (si el usuario no tiene sede fija) */}
              <div className="group z-0 grid w-full pt-5 text-white">
                {user?.sede_id ? null : (
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
                      value={form.sede_id ?? ""} // controlado
                    >
                      {/* Opción vacía si no hay selección */}
                      <option value="" disabled>
                        Selecciona una sede
                      </option>
                      {Branches.map((accessData: Branch) => (
                        <option key={accessData.id} value={accessData.id}>
                          {accessData.nombre}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <section className="mx-auto w-full max-w-md p-2">
            {/* Tipo */}
            <div className="group z-0 grid w-full">
              <label
                htmlFor="tipo"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Movimiento
              </label>
              <select
                id="tipo"
                name="tipo"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                onChange={handleChange}
                value={form.tipo} // controlado
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
                <option value="Traspaso">Traspaso</option>
              </select>
            </div>

            {/* Clasificación */}
            <div className="group z-0 mt-2 grid w-full">
              <label
                htmlFor="tipo_mov"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Clasificación
              </label>
              <select
                id="tipo_mov"
                name="tipo_mov"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                onChange={handleChange}
                value={form.tipo_mov} // controlado
              >
                <option value="" disabled>
                  Selecciona una clasificación
                </option>
                {financeMovementTypes
                  .filter(
                    (t: FinanceMovementType) => t.tipo_movimiento === form.tipo,
                  )
                  .map((t: FinanceMovementType) => (
                    <option key={t.id} value={t.tipo_mov_generico}>
                      {t.tipo_mov_generico}
                    </option>
                  ))}
              </select>
            </div>

            {/* Número de documento */}
            <div className="group z-0 mt-2 grid w-full">
              <label
                htmlFor="num_doc"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Número de documento
              </label>
              <input
                type="number"
                id="num_doc"
                name="num_doc"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                required
                disabled={form.tipo === "Ingreso"}
                onChange={handleChange}
                value={form.num_doc}
              />
            </div>

            {/* Monto */}
            <div className="group z-0 mt-2 grid w-full">
              <label
                htmlFor="monto"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Monto
              </label>
              <input
                type="number"
                id="monto"
                name="monto"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                required
                onChange={handleChange}
                value={form.monto}
              />
            </div>

            {/* Medio de pago */}
            <div className="group z-0 mt-2 grid w-full">
              <label
                htmlFor="metodo_pago"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Medio de pago
              </label>
              <select
                id="metodo_pago"
                name="metodo_pago"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                onChange={handleChange}
                value={form.metodo_pago} // controlado
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="group z-0 mt-2 grid w-full">
              <label
                htmlFor="observaciones"
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
              />
            </div>
          </section>
        </ModalBody>

        <ModalFooter className="flex justify-end">
          <Button
            disabled={saveLoading}
            className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
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
            className="cursor-pointer hover:bg-gray-900"
            color="alternative"
            onClick={() => setOpenModal(false)}
          >
            Cerrar
          </Button>
        </ModalFooter>

        {/* Error de guardado (opcional) */}
        {saveError ? (
          <div className="px-6 pb-4 text-sm text-red-600 dark:text-red-400">
            {saveError}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
