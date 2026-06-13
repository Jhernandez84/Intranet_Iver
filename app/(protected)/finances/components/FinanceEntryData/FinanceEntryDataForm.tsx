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
import { useState, useEffect, useRef } from "react";
import { useUser } from "../../../../context/UserProvider";
import { useCompanyBranchesAccess } from "../../../../context/CompanyBranchesProvider";
import { useFinanceMovementsType } from "../../_Context/FinancesMovementsProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useFinanceData } from "../../_Context/FinancesProvider";
// import { fetchMovementDetail } from "./CRUD_Finance_Forms"; // Asumo que lo usas en otro lado

interface FinanceEntryDataFormProps {
  initialValues: FinanceEntryForm;
  editView: boolean;
  openModal: boolean;
  movementId: string;
  setOpenModal: (value: boolean) => void;
}

interface FinanceEntryForm {
  fecha: string;
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: string;
  num_doc: string;
  observaciones: string;
  estado: string;
  sede_id?: string | null;
  // Añadimos campos opcionales para manejar la información del documento
  document_url?: string | null;
  document_path?: string | null;
  bank_account_id?: string | null; // Nuevo campo
}

interface Branch {
  id: string;
  nombre: string;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string; // Opcional, para ayudar al usuario a identificarla
}

interface FinanceMovementType {
  id: string;
  tipo_movimiento: string;
  tipo_mov_generico: string;
}

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function FinanceEntryDataForm({
  initialValues,
  editView,
  movementId,
  openModal,
  setOpenModal,
}: FinanceEntryDataFormProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const { user } = useUser();

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

  const [form, setForm] = useState<FinanceEntryForm>(initialValues);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const fallback = new Date();
    if (!initialValues?.fecha) return fallback;
    const [y, m, d] = initialValues.fecha.split("-").map(Number);
    if (!y || !m || !d) return fallback;
    return new Date(Date.UTC(y, m - 1, d));
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // NUEVO: Estados y referencias para el archivo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchBanks() {
      if (form.metodo_pago !== "Transferencia" || !user?.company_id) return;

      setLoadingBanks(true);
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("id, bank_name, account_number")
        .eq("company_id", user.company_id)
        .eq("is_active", true); // Asumiendo que tienes un flag de activo

      if (!error && data) {
        setBankAccounts(data as BankAccount[]);
      }
      setLoadingBanks(false);
    }

    fetchBanks();
  }, [form.metodo_pago, user?.company_id, supabase]);

  useEffect(() => {
    if (!openModal) return;
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
      document_url: initialValues?.document_url ?? null,
      document_path: initialValues?.document_path ?? null,
    };
    setForm(normalized);

    try {
      const [y, m, d] = normalized.fecha.split("-").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      setSelectedDate(dt);
    } catch {
      setSelectedDate(new Date());
    }

    // Limpiar archivo seleccionado si reabrimos el modal
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [initialValues, openModal, user?.sede_id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "tipo") {
      setForm((prev) => ({ ...prev, tipo: value, tipo_mov: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setForm((prev) => ({
      ...prev,
      fecha: toYmd(date),
    }));
  };

  // NUEVO: Handler para validar el archivo al seleccionarlo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert("El archivo excede el límite de 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    setSaveLoading(true);
    setSaveError(null);

    const montoNumber = Number.parseFloat(form.monto || "0");

    // PASO 1: Insertar el registro y obtener la respuesta (.select().single())
    const { data: insertedRecord, error: insertError } = await supabase
      .from("finanzas")
      .insert([
        {
          fecha: form.fecha,
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
          bank_account_id:
            form.metodo_pago === "Transferencia" ? form.bank_account_id : null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error al guardar movimiento:", insertError.message);
      setSaveError(insertError.message);
      setSaveLoading(false);
      return;
    }

    // PASO 2 y 3: Si hay archivo, subirlo y luego actualizar el registro recién creado
    if (selectedFile && insertedRecord) {
      try {
        const recordId = insertedRecord.id;
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        // Ruta multitenant: company_id / registro_id / archivo
        const filePath = `${user?.company_id}/${recordId}/${fileName}`;

        // Sube al bucket (Asegúrate que se llame 'comprobantes' o cámbialo a tu nombre real)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("comprobantes")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("comprobantes")
            .getPublicUrl(uploadData.path);

          // Actualiza el registro con la URL
          const { error: updateError } = await supabase
            .from("finanzas")
            .update({
              document_url: publicUrl,
              document_path: uploadData.path,
            })
            .eq("id", recordId);

          if (updateError) throw updateError;
        }
      } catch (fileError) {
        console.error(
          "El registro se guardó, pero hubo un error con el archivo:",
          fileError,
        );
        // Opcional: Podrías poner un setSaveError aquí, pero el registro financiero ya se insertó.
      }
    }

    // Reset tras éxito
    const todayStr = toYmd(new Date());
    setForm({
      fecha: todayStr,
      tipo: "Ingreso",
      tipo_mov: "",
      metodo_pago: "Efectivo",
      monto: "0",
      num_doc: "",
      observaciones: "",
      estado: "Ingresado",
      sede_id: user?.sede_id ?? null,
      document_url: null,
      document_path: null,
    });
    setSelectedDate(new Date());
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

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
              <p className="pl-5 text-center text-sm">ID: {movementId}</p>
            </span>
          ) : (
            <p className="pl-5 text-center">Ingreso de nuevo registro</p>
          )}
        </ModalHeader>

        <ModalBody className="grid grid-cols-2 gap-6">
          {/* LADO IZQUIERDO */}
          <div className="grid grid-cols-[60%_40%]">
            <div>
              <div className="justify-self-start">
                <label className="mt-2 mb-2 block pl-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                  Fecha del movimiento
                </label>
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
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      onChange={handleChange}
                      value={form.sede_id ?? ""}
                    >
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

          {/* LADO DERECHO */}
          <section className="mx-auto w-full max-w-md p-2">
            {/* ... TIPO, CLASIFICACION, NUM DOC, MONTO, MEDIO PAGO (se mantienen igual) ... */}
            <div className="group z-0 grid w-full">
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Movimiento
              </label>
              <select
                name="tipo"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                onChange={handleChange}
                value={form.tipo}
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
                <option value="Traspaso">Traspaso</option>
              </select>
            </div>

            <div className="group z-0 mt-2 grid w-full">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Clasificación
              </label>
              <select
                name="tipo_mov"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                onChange={handleChange}
                value={form.tipo_mov}
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

            <div className="group z-0 mt-2 grid w-full">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Número de documento
              </label>
              <input
                type="number"
                name="num_doc"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={form.tipo === "Ingreso"}
                onChange={handleChange}
                value={form.num_doc}
              />
            </div>

            <div className="group z-0 mt-2 grid w-full">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Monto
              </label>
              <input
                type="number"
                name="monto"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                required
                onChange={handleChange}
                value={form.monto}
              />
            </div>

            {/* Dropdown de Medio de pago actual */}
            <div className="group z-0 mt-2 grid w-full">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Medio de pago
              </label>
              <select
                name="metodo_pago"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                onChange={handleChange}
                value={form.metodo_pago}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* NUEVO: Dropdown condicional de Cuenta Bancaria */}
            {form.metodo_pago === "Transferencia" && (
              <div className="group animate-fade-in z-0 mt-2 grid w-full">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Cuenta Bancaria{" "}
                  {loadingBanks && <Spinner size="xs" className="ml-2" />}
                </label>
                <select
                  name="bank_account_id"
                  required={form.metodo_pago === "Transferencia"}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  onChange={handleChange}
                  value={form.bank_account_id ?? ""}
                >
                  <option value="">Selecciona un banco</option>
                  {bankAccounts.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bank_name}{" "}
                      {bank.account_number ? `- ${bank.account_number}` : ""}
                    </option>
                  ))}
                </select>
                {bankAccounts.length === 0 && !loadingBanks && (
                  <p className="mt-1 text-xs text-amber-600">
                    No hay cuentas registradas.
                  </p>
                )}
              </div>
            )}

            <div className="group z-0 mt-2 grid w-full">
              <label className="mb-2 block w-full text-sm font-medium text-gray-900 dark:text-white">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                rows={2}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="..."
                onChange={handleChange}
                value={form.observaciones}
              />
            </div>

            {/* NUEVO: Input para subir archivo */}
            <div className="group z-0 mt-2 grid w-full">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Comprobante adjunto (Max 5MB)
              </label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
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
                <Spinner className="mr-2 h-4 w-4" /> Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
          <Button
            className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
            onClick={() => setOpenModal(false)}
          >
            Cerrar
          </Button>
        </ModalFooter>

        {saveError && (
          <div className="px-6 pb-4 text-sm text-red-600">{saveError}</div>
        )}
      </Modal>
    </>
  );
}
