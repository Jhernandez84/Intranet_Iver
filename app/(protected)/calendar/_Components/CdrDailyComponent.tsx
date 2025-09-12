"use client";
import { Datepicker } from "flowbite-react";
export default function CdrDailyComponent() {
  const timeList = [
    { time: "08:30" },
    { time: "09:00" },
    { time: "09:30" },
    { time: "10:00" },
  ];

  return (
    <div className="grid grid-cols-[25%_1fr]">
      <ul className="flex-column space-y mb-4 space-y-6 text-sm font-medium text-gray-500 md:me-4 md:mb-0 dark:text-gray-400">
        <Datepicker
          name="fecha"
          inline
          weekStart={1}
          showTodayButton={false}
          showClearButton={false}
          // value={selectedDate}
          // onChange={handleDateChange}
        />
      </ul>
      {timeList.map((list) => (
        <section key={list.time} className="grid-cols grid">
          {list.time}
        </section>
      ))}
    </div>
  );
}
