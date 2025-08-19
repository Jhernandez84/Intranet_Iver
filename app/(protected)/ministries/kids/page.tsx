"use client";

import { initFlowbite } from "flowbite";
import { useEffect, useState } from "react";
import DatePickerComponent from "../../../components/DatePeekerComponent/DatePeekerComponent";

export default function KidsPage() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <p>Página IverKids</p>
      <p>Próximo turno</p>
      <p>Próxima actividad</p>
      <p>
        Debe contener: Registro de asistencias, Registro de las tías del
        ministerio, Calendario de Eventos,
      </p>
      <DatePickerComponent />
    </>
  );
}
