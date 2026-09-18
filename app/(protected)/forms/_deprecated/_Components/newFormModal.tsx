// ✅ Importa todos los subcomponentes que necesitas directamente desde la biblioteca
import { Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";

interface CreateModalProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

export default function CreateNewForm({
  openModal,
  setOpenModal,
}: CreateModalProps) {
  return (
    <Modal
      show={openModal}
      onClose={() => setOpenModal(false)}
      popup
      className="z-50"
    >
      {/* ✅ Ahora usa <ModalHeader> como un componente independiente */}
      <ModalHeader>Creación de nuevo formulario </ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-2 gap-2 space-y-6">
          <div className="relative">
            <div>
              <label
                htmlFor="small-input"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Nombre del formulario
              </label>
              <input
                type="text"
                id="small-input"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="small"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Seleccione tipo de formulario
            </label>
            <select
              id="small"
              className="mb-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            >
              <option selected>Seleccione</option>
              <option value="US">Formulario de Evento</option>
              <option value="CA">Formulario de Encuesta</option>
              <option value="FR">Formulario de Otros</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 space-y-6">
          <button
            type="button"
            className="me-2 mb-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Crear formulario
          </button>
        </div>
      </ModalBody>
      <ModalFooter>
        <button onClick={() => setOpenModal(false)}>Cerrar</button>
      </ModalFooter>
    </Modal>
  );
}
