// app/dashboard/page.tsx
"use client";

import AreaChart from "../components/charts/AreaChart";
import { useUser } from "../context/UserProvider";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="p-2">
      <AreaChart />
    </div>
  );
}
