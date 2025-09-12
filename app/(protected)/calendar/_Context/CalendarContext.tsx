// app/(dashboard)/components/CalendarViewProvider.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// 1) Tipo simple para la vista del calendario
export type CalendarView = "Month" | "Week" | "Year" | "Daily";

// 2) Tipo del valor que expone el contexto
interface CalendarViewContextValue {
  view: CalendarView;
  setView: (v: CalendarView) => void;
  isLoading: boolean;
}

// 3) Context inicial (sin valor por defecto inválido)
const CalendarViewContext = createContext<CalendarViewContextValue | undefined>(
  undefined,
);

// 4) Hook para consumir el contexto
export function useCalendarView() {
  const ctx = useContext(CalendarViewContext);
  if (!ctx) {
    throw new Error(
      "useCalendarView must be used within <CalendarViewProvider>",
    );
  }
  return ctx;
}

// 5) Provider
export function CalendarViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<CalendarView>("Month");
  const [isLoading] = useState(false); // cámbialo si luego cargas preferencia desde Supabase

  return (
    <CalendarViewContext.Provider value={{ view, setView, isLoading }}>
      {children}
    </CalendarViewContext.Provider>
  );
}
