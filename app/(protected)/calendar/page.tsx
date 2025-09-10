"use client";
import CalendarMonthView from "./_Components/CalendarGridComponent";

import { initFlowbite } from "flowbite";
import { useEffect } from "react";

export default function CalendarPage() {
  useEffect(() => {
    initFlowbite();
  }, []);
  return (
    <>
      <CalendarMonthView />
    </>
  );
}
