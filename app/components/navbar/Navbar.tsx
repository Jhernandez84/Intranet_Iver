"use client";

// app/components/Navbar.tsx
import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppsMenu from "../../(protected)/components/apps/Apps";
import NotificationList from "../../(protected)/components/notifications/notifications";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import AuthButton from "../authcomponents/AuthButton";

const Navbar = () => {
  const [spuser, setspUser] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Escucha los cambios de estado de la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setspUser(session?.user ?? null);
    });

    // Obtiene la sesión actual al cargar el componente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setspUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <div className="sticky top-0 z-50 w-[100vw]">
      {/* <header className="antialiased"> */}

      <nav className="border-gray-200 bg-white px-4 py-2.5 lg:px-6 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center justify-center">
            {!spuser ? (
              []
            ) : (
              <>
                {/* <Sidebar user={spuser} /> */}
                <button
                  id="toggleSidebar"
                  aria-expanded="true"
                  data-drawer-target="drawer-navigation"
                  data-drawer-show="drawer-navigation"
                  aria-controls="drawer-navigation"
                  className="mr-3 hidden cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:inline dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                  >
                    {" "}
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M1 1h14M1 6h14M1 11h7"
                    />{" "}
                  </svg>
                </button>
              </>
            )}
            <button
              aria-expanded="true"
              aria-controls="sidebar"
              className="mr-2 cursor-pointer rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:bg-gray-700 dark:focus:ring-gray-700"
            >
              <svg
                className="h-[18px] w-[18px]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <div>
              <a href="https://flowbite.com" className="mr-4 flex">
                <img
                  src="https://flowbite.s3.amazonaws.com/logo.svg"
                  className="mr-3 h-8"
                  alt="FlowBite Logo"
                />
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                  Flowbite
                </span>
              </a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {!spuser ? (
              <div
                className="hidden flex-grow items-center justify-center md:flex"
                id="navbar-sticky"
              >
                <div className="flex flex-row gap-6 font-medium">
                  <Link
                    href="/"
                    className="rounded-sm px-3 py-2 text-blue-700 dark:text-blue-500"
                  >
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-sm px-3 py-2 text-blue-700 dark:text-blue-500"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/"
                    className="rounded-sm px-3 py-2 text-blue-700 dark:text-blue-500"
                  >
                    Contacto
                  </Link>
                  <Link
                    href="/"
                    className="rounded-sm px-3 py-2 text-blue-700 dark:text-blue-500"
                  >
                    Perfil
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <form
                  action="#"
                  method="GET"
                  className="hidden lg:block lg:pl-2"
                >
                  {/* <label for="topbar-search" className="sr-only">Search</label> */}
                  <div className="relative mt-1 lg:w-96">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        {" "}
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />{" "}
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="email"
                      id="topbar-search"
                      className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-9 text-gray-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Search"
                    />
                  </div>
                </form>
              </>
            )}
          </div>
          <div className="flex items-center lg:order-2">
            {spuser ? (
              <>
                <button
                  type="button"
                  className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mr-2 hidden items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:ring-4 focus:outline-none sm:inline-flex"
                >
                  <svg
                    aria-hidden="true"
                    className="mr-1 -ml-1 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>{" "}
                  New Widget
                </button>
                <button
                  id="toggleSidebarMobileSearch"
                  type="button"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Search</span>
                  {/* <!-- Search icon --> */}
                  <svg
                    className="h-4 w-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </button>
                {/* <!-- Notifications --> */}
                <NotificationList />
                {/* <!-- Apps --> */}
                <AppsMenu />
              </>
            ) : (
              []
            )}
            <AuthButton />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
