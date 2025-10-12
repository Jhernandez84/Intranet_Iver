import { Dropdown, DropdownItem, DropdownDivider } from "flowbite-react";
import { useState, useMemo } from "react";
import { useFinanceData } from "../../_Context/FinancesProvider";
import FinanceEntryDataForm from "../FinanceEntryData/FinanceEntryDataForm";
import { formatCurrency } from "../../helper/FinanceDataOutputs";

function DetailsModal({
  movement,
  openModal,
  setOpenModal,
}: {
  movement: string | null;
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
}) {
  if (!openModal) return null;
  const title = "Observaciones";
  const details = movement ?? "";

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{details}</p>
        <button
          onClick={() => setOpenModal(false)}
          className="mt-6 w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition duration-150 hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

interface FinanceEntryForm {
  fecha: string; // "YYYY-MM-DD"
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: string; // string para inputs; parseas al guardar
  num_doc: string;
  observaciones: string;
  estado: string;
  sede_id?: string | null;
  // NOTA: el form no necesita sede_nombre
}

type FinanceMovement = {
  id: string;
  fecha: string; // viene como string desde el provider
  tipo: string;
  tipo_mov: string;
  metodo_pago: string;
  monto: number | string;
  num_doc: string | null;
  observaciones: string | null;
  estado: string;
  sede_id?: string | null;
  sede_nombre: string | null;
};

const toForm = (m: FinanceMovement): FinanceEntryForm => ({
  fecha: m.fecha ?? new Date().toISOString().slice(0, 10),
  tipo: m.tipo ?? "Ingreso",
  tipo_mov: m.tipo_mov ?? "",
  metodo_pago: m.metodo_pago ?? "Efectivo",
  monto: String(m.monto ?? "0"),
  num_doc: m.num_doc ?? "",
  observaciones: m.observaciones ?? "",
  estado: m.estado ?? "Ingresado",
  sede_id: m.sede_id ?? null,
});

export default function MovementsTable() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modDetails, setMovDetails] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editView, setEditView] = useState(false);

  // Movement seleccionado (para tener el id a mano)
  const [recordDetails, setRecordDetails] = useState<FinanceMovement | null>(
    null,
  );

  // Valores iniciales del FORM (shape del form, no del movement)
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const baseRecordForm: FinanceEntryForm = useMemo(
    () => ({
      fecha: todayStr,
      tipo: "Ingreso",
      tipo_mov: "",
      metodo_pago: "Efectivo",
      monto: "0",
      num_doc: "",
      observaciones: "",
      estado: "Ingresado",
      sede_id: null,
    }),
    [todayStr],
  );

  const [initialFormValues, setInitialFormValues] =
    useState<FinanceEntryForm>(baseRecordForm);

  const selectedKeys = [
    "fecha",
    "tipo",
    "tipo_mov",
    "monto",
    "metodo_pago",
    "num_doc",
    "sede_nombre",
  ] as const;

  const { financeMovements } = useFinanceData();

  const handleEditForm = (movement: FinanceMovement) => {
    setRecordDetails(movement); // para usar su id en el modal
    setInitialFormValues(toForm(movement)); // adaptamos al shape del form
    setEditView(true);
    setModalOpen(true);
  };

  const handleViewDetails = (obs: string | null) => {
    setMovDetails(obs ?? "");
    setShowDetailModal(true);
  };

  return (
    <div className="relative rounded shadow-md sm:rounded-lg">
      <FinanceEntryDataForm
        // el form ahora recibe el shape correcto
        initialValues={initialFormValues}
        editView={editView}
        movementId={recordDetails?.id ?? ""} // pasamos el id si existe
        openModal={modalOpen}
        setOpenModal={(v) => {
          setModalOpen(v);
          if (!v) {
            // limpiar al cerrar
            setRecordDetails(null);
            setEditView(false);
            setInitialFormValues(baseRecordForm);
          }
        }}
      />

      {showDetailModal && (
        <DetailsModal
          movement={modDetails}
          openModal={showDetailModal}
          setOpenModal={setShowDetailModal}
        />
      )}

      <div className="h-[calc(100vh-350px)] overflow-y-auto">
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
            {(financeMovements ?? []).map((movement: FinanceMovement) => (
              <tr
                key={movement.id}
                className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <td className="truncate px-6 py-4">{movement.fecha || ""}</td>
                <td className="truncate px-6 py-4">{movement.tipo}</td>
                <td className="truncate px-6 py-4">{movement.tipo_mov}</td>
                <td className="truncate px-6 py-4 font-semibold">
                  {formatCurrency(Number(movement.monto))}
                </td>
                <td className="truncate px-6 py-4">{movement.metodo_pago}</td>
                <td className="truncate px-6 py-4">{movement.num_doc}</td>
                <td className="truncate px-6 py-4">{movement.sede_nombre}</td>

                <td className="grid grid-cols-2 gap-3 px-4">
                  <button
                    className="cursor-pointer truncate py-4 text-lg"
                    onClick={() => handleViewDetails(movement.observaciones)}
                    title="Ver observaciones"
                    aria-label="Ver observaciones"
                  >
                    ℹ️
                  </button>
                  <button
                    className="cursor-pointer truncate py-4 text-lg"
                    onClick={() => handleEditForm(movement)}
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
  );
}
