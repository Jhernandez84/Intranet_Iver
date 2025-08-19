"use client";

import { initFlowbite } from "flowbite";
import { useEffect } from "react";

import AreaChart from "../../components/charts/AreaChart";
import BarChart from "../../components/charts/BarChart";

import LeadershipList from "./components/page";

export default function LeaershipPage() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div className="grid grid-cols-[30%_70%] p-2">
        <AreaChart />
        {/* <BarChart user={null} /> */}
      </div>
      <LeadershipList />
    </>
  );
}
