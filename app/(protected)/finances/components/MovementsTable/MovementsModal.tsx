import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Datepicker,
  Spinner,
} from "flowbite-react";

interface MovementsModal {
  openModal: boolean;
  movementId: string;
  setOpenModal: (value: boolean) => void;
}

export default function MovementsTableModal({
  movementId,
  openModal,
  setOpenModal,
}: MovementsModal) {
  return (
    <>
      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        popup
        className="z-50"
      >
        <ModalHeader className="flex items-center">
          <p>Detalle del movimiento</p>
        </ModalHeader>
        <ModalBody className="grid grid-cols-2 gap-6 text-white">
          <section className="mx-auto w-full max-w-md p-2">
            <div>{movementId}</div>
          </section>
        </ModalBody>
        <ModalFooter className="flex justify-end"></ModalFooter>
      </Modal>
    </>
  );
}
