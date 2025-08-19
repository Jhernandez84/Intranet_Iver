// app/dashboard/page.tsx
"use client";

import { useUser } from "../../context/UserProvider";

export default function DashboardPage() {
  const user = useUser();

  console.log(user);

  return (
    <div>
      <h1>{user?.user.id}</h1>
      <h1>{user?.user.email}</h1>
      <h1>{user?.user.full_name}</h1>
      <h1>Finanzas</h1>
    </div>
  );
}
