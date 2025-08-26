"use client";

import { useUser } from "../../context/UserProvider";

export default function FormsPageDashboard() {
  const user = useUser();

  console.log(user);

  return (
    <div>
      <h1>Mantenedor de Formularios</h1>
    </div>
  );
}
