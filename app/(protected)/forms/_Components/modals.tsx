// ✅ Importa todos los subcomponentes que necesitas directamente desde la biblioteca
import { Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";

interface SuccessModalProps {
  show: boolean; // Controla si el modal es visible
  title: string;
  message: string;
  onClose: () => void; // Función para cerrar el modal
}

export default function SuccessModal({
  show,
  title,
  message,
  onClose,
}: SuccessModalProps) {
  return (
    <Modal show={show} onClose={onClose}>
      {/* ✅ Ahora usa <ModalHeader> como un componente independiente */}
      <ModalHeader>Título del Modal</ModalHeader>
      <ModalBody>
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Contenido del modal
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <button onClick={onClose}>Cerrar</button>
      </ModalFooter>
    </Modal>
  );
}
