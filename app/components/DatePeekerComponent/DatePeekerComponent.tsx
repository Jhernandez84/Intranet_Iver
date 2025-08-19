// app/components/DatePickerComponent.jsx
"use client";

import { Datepicker } from "flowbite-react";
import { useState } from "react";

export default function DatePickerComponent() {
  const [date, setDate] = useState(new Date()); // o null si quieres vacío

  return (
    <div className="max-w-xs">
      <Datepicker
        inline
        value={date} // Componente controlado
        onChange={(d) => {
          // d: Date | null en 0.10+/0.12.x
          console.log(d);
          setDate(d);
        }}
        language="es-CL"
        weekStart={1}
        labelTodayButton="Hoy"
        labelClearButton="Limpiar"
      />
    </div>
  );
}
