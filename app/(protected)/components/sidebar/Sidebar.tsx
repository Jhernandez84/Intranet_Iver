"use client";

// app/components/Navbar.tsx
// import React, { useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserAccess } from "../../../context/UserAccessProvider";

import { initFlowbite } from "flowbite";

// Importa los componentes de Flowbite React que uses aquí

// Define los tipos para las props

const Sidebar = () => {
  const pathname = usePathname();

  const supabase = createClientComponentClient();
  const router = useRouter();

  const { access, isLoadingAccess } = useUserAccess();

  useEffect(() => {
    console.log("Accessos del cliente ", access, isLoadingAccess);
  }, [isLoadingAccess, access]);

  useEffect(() => {
    initFlowbite();
  }, [isLoadingAccess]);

  if (isLoadingAccess) return null;

  return (
    <>
      <div
        id="drawer-navigation"
        className="fixed top-0 left-0 z-40 h-screen w-64 -translate-x-full overflow-y-auto bg-white p-4 transition-transform dark:bg-gray-800"
        aria-labelledby="drawer-body-scrolling-label"
      >
        <h5
          id="drawer-body-scrolling-label"
          className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          Menu
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
        <div className="overflow-y-auto py-4">
          <ul className="space-y-2 font-medium">
            <div className="pt-4">
              {access?.map((items) => {
                return (
                  <li className="p-2" key={items.key}>
                    <Link
                      key={items.key}
                      href={items.path}
                      className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      data-drawer-hide="drawer-navigation"
                      aria-controls="drawer-navigation"
                    >
                      <svg
                        className="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 22 21"
                      >
                        <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                        <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                      </svg>
                      <span className="ms-3 flex-1 whitespace-nowrap">
                        {items.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </div>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
