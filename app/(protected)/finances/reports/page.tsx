"use client";

import { useUser } from "../../../context/UserProvider";

export default function DashboardFinance() {
  const user = useUser();

  console.log(user);

  return (
    <div>
      <h1>Dashboard de finanzas</h1>
      <h1>Reportes</h1>
    </div>
  );
}
