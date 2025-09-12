"use client";

import CdrDailyComponent from "./_Components/CdrDailyComponent";
import CdrYearlyComponent from "./_Components/CdrYearlyComponent";
import CdrWeeklyComponent from "./_Components/CdrWeeklyComponent";
import CdrMonthlyComponent from "./_Components/CdrMonthlyComponent";

import { initFlowbite } from "flowbite";
import { useEffect } from "react";
import { useCalendarView } from "./_Context/CalendarContext";

export default function CalendarPage() {
  const { view, setView } = useCalendarView();

  return (
    <>
      <section className="flex h-full flex-col justify-start overflow-auto text-white">
        {view === "Daily" ? <CdrDailyComponent /> : []}
        {view === "Week" ? <CdrWeeklyComponent /> : []}
        {view === "Month" ? <CdrMonthlyComponent /> : []}
        {view === "Year" ? <CdrYearlyComponent /> : []}
      </section>
    </>
  );
}
