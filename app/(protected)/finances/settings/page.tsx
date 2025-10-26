"use client";

import { useState } from "react";
import { useUser } from "../../../context/UserProvider";
import CardComponent from "../components/CardComponent/CardComponent";
// import { useFinanceData } from "../_Context/FinancesProvider";
import { useFinanceMovementsType } from "../_Context/FinancesMovementsProvider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

interface MovementType {
  id: string;
  company_id: string;
  descripcion: string;
  activo: boolean;
  tipo_mov_contable: string;
  tipo_mov_generico: string;
  tipo_movimiento: string;
  tipo_mov_clase: string;
}

const selectedKeys = [
  "Tipo Contable",
  "Código Cuenta",
  "Movimiento Genérico",
  "Tipo de Movimiento",
  "tipo_mov_clase",
  "Descripcion",
  "Estado",
] as const;

export default function SettingsFinance() {
  const [edit, setEdit] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const AddMovementButton = (
    <button
      className="h-[30px] w-[120px] cursor-pointer rounded bg-blue-600 text-xs text-white hover:bg-blue-700"
      // onClick={() => setOpen(true)}
      onClick={() => alert("hola")}
    >
      + Nuevo Registro
    </button>
  );

  const SaveRecordButton = (
    <button
      className="h-[30px] min-w-[120px] cursor-pointer rounded bg-green-600 text-xs text-white hover:bg-green-700"
      // onClick={() => setOpen(true)}
      onClick={() => handleSubmit()}
    >
      {!edit ? "🗳️ Crear Registro" : "Actualizar Registro"}
    </button>
  );

  const ClearDataButton = (
    <button
      className="h-[30px] w-[120px] cursor-pointer rounded bg-blue-600 text-xs text-white hover:bg-blue-700"
      // onClick={() => setOpen(true)}
      onClick={() => {
        (setForm(initialMovement), setEdit(false));
      }}
    >
      Limpiar datos
    </button>
  );

  const initialMovement: MovementType = {
    id: null,
    company_id: "",
    descripcion: "",
    activo: true,
    tipo_mov_contable: "Activo",
    tipo_mov_generico: "",
    tipo_movimiento: "Ingreso",
    tipo_mov_clase: "",
  };

  const [form, setForm] = useState<MovementType>(initialMovement);

  const user = useUser();
  const {
    financeMovementTypes,
    isLoadingFinanceData,
    refreshFinanceMovements,
  } = useFinanceMovementsType();

  const [query, setQuery] = useState("");

  const filtered = financeMovementTypes.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(query.toLowerCase()),
    ),
  );

  const todosLosTipos = financeMovementTypes.map(
    (tipo) => tipo.tipo_movimiento,
  );

  // Usa Array.from para convertir el Set a un Array
  const tiposUnicos = Array.from(new Set(todosLosTipos));

  // 2. Handler de Cambio Tipado
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    // Desestructuramos las propiedades 'name' y 'value' del target (el input que cambió)
    const { name, value } = event.target;

    // Actualizamos el estado
    setForm((prevForm) => ({
      ...prevForm, // Mantenemos el resto del formulario igual
      [name]: value, // Sobreescribimos solo la propiedad que coincide con el 'name' del input
    }));
  };

  const handleViewDetails = (record: MovementType) => {
    // Cuando haces clic en un registro, actualizas el estado 'form' con esos datos.
    console.log(record);
    setForm(record);
    setEdit(false);

    // Opcional: Podrías añadir lógica aquí para abrir un modal o cambiar una vista
    // setModalOpen(true);
  };

  const handleEditDetails = (record: MovementType) => {
    // Cuando haces clic en un registro, actualizas el estado 'form' con esos datos.
    setForm(record);
    setEdit(true);
    // Opcional: Podrías añadir lógica aquí para abrir un modal o cambiar una vista
    // setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaveLoading(true);
    setSaveError(null);

    // Inserta (si deseas editar, cambia por .update() con .eq('id', movementId))
    const { error: insertError } = await supabase
      .from("tipos_movimiento")
      .insert([
        {
          // id: null,
          company_id: user?.user.company_id,
          descripcion: form.descripcion,
          activo: form.activo,
          tipo_mov_contable: form.tipo_mov_contable,
          tipo_mov_generico: form.tipo_mov_generico,
          tipo_movimiento: form.tipo_movimiento,
          tipo_mov_clase: form.tipo_mov_clase,
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

    const reset: MovementType = {
      id: null,
      company_id: "",
      descripcion: "",
      activo: true,
      tipo_mov_contable: "Activo",
      tipo_mov_generico: "",
      tipo_movimiento: "Ingreso",
      tipo_mov_clase: "",
    };

    setSaveLoading(false);
    setForm(initialMovement);
    setEdit(false);
    await refreshFinanceMovements();
  };

  return (
    <>
      <div className="grid h-full grid-rows-[260px_1fr] gap-3">
        <div className="grid h-full w-full grid-cols-[35%_1fr] gap-2">
          <div>
            <div className="grid w-full grid-rows-3 rounded-lg bg-white shadow-sm md:p-6 dark:bg-gray-900">
              <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                <dl>
                  <dd className="text-sm leading-none font-bold text-gray-900 dark:text-white">
                    Registros
                  </dd>
                  <dd className="text-3xl leading-none font-bold text-gray-900 dark:text-white">
                    {financeMovementTypes.length}
                  </dd>
                </dl>
                <div>
                  <div className="cursor-pointer rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
                    {AddMovementButton}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 py-3">
                <dl>
                  <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
                    Registros
                  </dt>
                  <dd className="text-center text-xl leading-none font-bold text-blue-500 dark:text-blue-400">
                    {financeMovementTypes.length}
                  </dd>
                </dl>
                <dl>
                  <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
                    Activos
                  </dt>
                  <dd className="text-center text-xl leading-none font-bold text-green-600 dark:text-green-500">
                    {
                      financeMovementTypes.filter(
                        (movimiento) =>
                          movimiento.tipo_mov_contable === "Activo",
                      ).length
                    }
                  </dd>
                </dl>
                <dl>
                  <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
                    Pasivos
                  </dt>
                  <dd className="text-center text-xl leading-none font-bold text-red-600 dark:text-red-500">
                    {
                      financeMovementTypes.filter(
                        (movimiento) =>
                          movimiento.tipo_mov_contable === "Pasivo",
                      ).length
                    }
                  </dd>
                </dl>
                <dl>
                  <dt className="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
                    Traspasos
                  </dt>
                  <dd className="text-center text-xl leading-none font-bold text-yellow-600 dark:text-yellow-500">
                    {
                      financeMovementTypes.filter(
                        (movimiento) =>
                          movimiento.tipo_mov_contable === "Traspaso",
                      ).length
                    }
                  </dd>
                </dl>
              </div>
              <div className="grid grid-cols-1 items-center justify-center border-t border-gray-200 dark:border-gray-700">
                <div className="relative flex-1">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar en la tabla..."
                    className="w-full rounded-md border border-zinc-600/40 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-zinc-500/40 focus:outline-none"
                  />
                  <span className="pointer-events-none absolute top-2.5 right-3 text-zinc-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Acá estoy agregando el formulario para ingreso de movimiento */}
          <div>
            <div className="h-full w-full grid-rows-[30%_30%_30%_1fr] rounded-lg bg-white shadow-sm md:pt-3 md:pr-6 md:pl-6 dark:bg-gray-900">
              <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
                <div className="group z-0 mt-2 grid w-full grid-cols-[20%_1fr]">
                  <label
                    htmlFor="tipo_movimiento"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Tipo mov.
                  </label>
                  <select
                    id="tipo_movimiento"
                    name="tipo_movimiento"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    onChange={handleChange}
                    value={form.tipo_movimiento} // controlado
                  >
                    {tiposUnicos.map((tipo) => {
                      return (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="group z-0 mt-2 grid w-full grid-cols-[20%_1fr]">
                  <label
                    htmlFor="tipo_mov_generico"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Grupo de Cuenta
                  </label>
                  <input
                    type="text"
                    id="tipo_mov_generico"
                    name="tipo_mov_generico"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    required
                    onChange={handleChange}
                    value={form.tipo_mov_generico}
                  />
                </div>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                <div className="group z-0 mt-2 grid w-full grid-cols-[20%_1fr]">
                  <label
                    htmlFor="descripcion"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Descripción
                  </label>
                  <input
                    type="text"
                    id="descripcion"
                    name="descripcion"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    required
                    onChange={handleChange}
                    value={form.descripcion}
                  />
                </div>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                <div className="group z-0 mt-2 grid w-full grid-cols-[20%_1fr]">
                  <label
                    htmlFor="activo"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Estado
                  </label>
                  <select
                    id="activo"
                    name="activo"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    onChange={handleChange}
                    value={String(form.activo)} // ¡CONVERSIÓN CLAVE!
                  >
                    <option value="true">Activo</option>;
                    <option value="false">Inactivo</option>;
                  </select>
                </div>
              </div>
              <div className="flex justify-between gap-3 border-gray-200 p-2 dark:border-gray-700">
                <div>{ClearDataButton}</div>
                {form.activo && form.descripcion && form.tipo_mov_generico && (
                  <div>{SaveRecordButton}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Segunda fila (40%) */}

        <div className="h-[calc(85vh-200px)] overflow-y-auto">
          <table className="w-full table-fixed text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-900 dark:text-gray-400">
              <tr>
                {selectedKeys.map((header) => (
                  <th
                    key={header}
                    className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900"
                  >
                    {header}
                  </th>
                ))}
                <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody>
              {(filtered ?? []).map((movementType: MovementType) => (
                <tr
                  key={movementType.id}
                  className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="truncate px-6 py-4">
                    {movementType.tipo_mov_contable}
                  </td>
                  <td className="truncate px-6 py-4">Código Cuenta</td>
                  <td className="truncate px-6 py-4">
                    {movementType.tipo_movimiento}
                  </td>
                  <td className="truncate px-6 py-4">
                    {movementType.tipo_mov_generico}
                  </td>
                  <td className="truncate px-6 py-4">{movementType.activo}</td>
                  <td className="truncate px-6 py-4">
                    {movementType.activo === true ? (
                      <p>Active</p>
                    ) : (
                      <p>False</p>
                    )}
                  </td>

                  <td className="grid grid-cols-2 gap-3 px-4">
                    <button
                      className="cursor-pointer truncate py-4 text-lg"
                      onClick={() => handleViewDetails(movementType)}
                      title="Ver observaciones"
                      aria-label="Ver observaciones"
                    >
                      📑
                    </button>
                    <button
                      className="cursor-pointer truncate py-4 text-lg"
                      onClick={() => handleEditDetails(movementType)}
                      title="Editar movimiento"
                      aria-label="Editar movimiento"
                    >
                      📝
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
