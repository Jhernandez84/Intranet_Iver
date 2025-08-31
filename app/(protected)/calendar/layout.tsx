// app/(dashboard)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Datepicker } from "flowbite-react";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const pathname = usePathname();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <>
      <div className="h-[calc(100vh-70px)] p-2 md:flex">
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
        </ul>
        <div className="text-medium w-full rounded-lg bg-gray-50 p-6 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {children}
        </div>
      </div>
    </>
  );
}
