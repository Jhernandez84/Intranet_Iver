"use client";
import { Datepicker } from "flowbite-react";
import { useState } from "react";
import { Week } from "react-day-picker";

export default function CdrWeeklyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const WeekDays = [
    { day: "Lunes" },
    { day: "Martes" },
    { day: "Miércoles" },
    { day: "Jueves" },
    { day: "Viernes" },
    { day: "Sábado" },
    { day: "Domingo" },
  ];

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="grid grid-cols-[25%_1fr]">
      <ul className="flex-column space-y mb-4 space-y-6 text-sm font-medium text-gray-500 md:me-4 md:mb-0 dark:text-gray-400">
        <Datepicker
          name="fecha"
          inline
          weekStart={1}
          showTodayButton={false}
          showClearButton={false}
          value={selectedDate}
          onChange={handleDateChange}
        />

        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h5 className="text-xl leading-none font-bold text-gray-900 dark:text-white">
              Latest Customers
            </h5>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              View all
            </a>
          </div>
          <div className="flow-root">
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              <li className="py-3 sm:py-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-8 w-8 rounded-full"
                      src="/docs/images/people/profile-picture-1.jpg"
                      alt="Neil image"
                    />
                  </div>
                  <div className="ms-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      Neil Sims
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      email@windster.com
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    $320
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </ul>
      <div className="grid h-[100%] grid-cols-8 p-2">
        <p className="h-[100%] border text-center">N Semana</p>
        {WeekDays.map((Wday) => (
          <div key={Wday.day} className="h-[100%] border text-center">
            {Wday.day}
          </div>
        ))}
      </div>
    </div>
  );
}
