"use client";
import { Datepicker } from "flowbite-react";
import { useState } from "react";

export default function CdrYearlyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const [selectedDates, setSelectedDates] = useState(
    months.map(() => new Date()), // inicializa todos en hoy, uno por mes
  );

  const handleDateChange = (date: Date, index: number) => {
    setSelectedDates((prev) => {
      const newDates = [...prev];
      newDates[index] = date;
      return newDates;
    });
  };

  return (
    <section className="grid grid-cols-4 gap-4">
      {months.map((month, i) => (
        <div key={month} className="rounded-lg bg-gray-800 p-2">
          {/* <h2 className="mb-2 text-center font-bold text-white">{month}</h2> */}
          <Datepicker
            name={`fecha-${i}`}
            inline
            weekStart={1}
            showTodayButton={false}
            showClearButton={false}
            title=""
            // value={selectedDates[i]}
            onChange={(date) => handleDateChange(date, i)}
          />
        </div>
      ))}
    </section>
  );
}
