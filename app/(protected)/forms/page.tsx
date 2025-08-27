"use client";

import { useUser } from "../../context/UserProvider";

export default function FormsPageDashboard() {
  const user = useUser();

  console.log(user);

  return (
    <div className="text-medium w-full rounded-lg bg-gray-50 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      <h1>Este es el dashboard de formulario</h1>
      <h1>Se muestran los formulario activos</h1>
      <h1>Se muestran datos de uso y otros</h1>
    </div>
  );
}
