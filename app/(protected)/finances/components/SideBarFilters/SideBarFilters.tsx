"use client";

// app/components/Navbar.tsx
import React, { useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserAccess } from "../../../../context/UserAccessProvider";
import { ToggleSwitch } from "flowbite-react";
import { Datepicker } from "flowbite-react";

import { initFlowbite } from "flowbite";

const SideBarFilters = () => {
  const pathname = usePathname();

  const supabase = createClientComponentClient();
  const router = useRouter();

  const { access, isLoadingAccess } = useUserAccess();

  const [switch1, setSwitch1] = useState(false);

  useEffect(() => {
    initFlowbite();
  }, [isLoadingAccess]);

  if (isLoadingAccess) return null;

  return (
    <>
      <div
        id="drawer-navigation"
        className="fixed top-17 left-0 z-40 h-screen w-100 -translate-x-full overflow-y-auto bg-white p-4 transition-transform dark:bg-gray-800"
        aria-labelledby="drawer-body-scrolling-label"
      >
        <h5
          id="drawer-body-scrolling-label"
          className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          Filtros
        </h5>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          className="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            className="h-3 w-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="grid grid-rows-[90%_10%]">
          <div className="overflow-y-auto py-4">
            {/* <div className="pt-4"></div> */}

            <ToggleSwitch
              checked={switch1}
              label="Fechas"
              onChange={setSwitch1}
              className="w-[70px]"
            />
            <Datepicker inline disabled={!switch1} />
          </div>
          <div>
            <button
              color="blue"
              className="mt-20 inline-flex w-full cursor-pointer items-center rounded-lg bg-blue-700 px-4 py-3 text-center text-white dark:bg-blue-600"
              onClick={() => {
                alert("aplicando filtros");
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBarFilters;
