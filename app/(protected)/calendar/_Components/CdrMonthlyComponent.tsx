import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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

export default function CdrMonthlyComponent() {
  return (
    <section className="grid grid-cols-4 gap-4 p-4">
      {months.map((_, i) => (
        <div key={i} className="rounded-lg bg-gray-700 p-2 text-center text-sm">
          <DayPicker
            month={new Date(2025, i, 1)} // cada mes fijo
            showWeekNumber // 👈 muestra el número de semana
            styles={{
              caption: { display: "none" }, // oculta nombre del mes
              nav: { display: "none" }, // oculta botones
            }}
          />
        </div>
      ))}
    </section>
  );
}
