"use client";

import { initFlowbite } from "flowbite";
import { useEffect } from "react";

export default function CalendarPage() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <h1>calendar</h1>
    </>
  );
}
