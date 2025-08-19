// app/components/AuthButton.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { initFlowbite } from "flowbite";
import Link from "next/link";
import LoginModal from "../loginModal/LoginModal";

export default function AuthButton() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    initFlowbite();
  }, []);

  useEffect(() => {
    // Escucha los cambios de estado de la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Obtiene la sesión actual al cargar el componente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Actualiza la página para re-renderizar el Server Component principal
  };

  console.log(user);

  return (
    <>
      {user ? (
        <>
          <button
            type="button"
            className="mx-3 flex cursor-pointer rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-300 md:mr-0 dark:focus:ring-gray-600"
            id="user-menu-button"
            aria-expanded="false"
            data-dropdown-toggle="dropdown"
          >
            <span className="sr-only">Open user menu</span>
            <Image
              src={user.user_metadata.avatar_url}
              width={32}
              height={32}
              alt="Avatar"
              className="rounded-full"
            />
          </button>
          {/* <!-- Dropdown menu --> */}
          <div
            className="z-50 my-4 hidden w-56 list-none divide-y divide-gray-100 rounded bg-white text-base shadow dark:divide-gray-600 dark:bg-gray-700"
            id="dropdown"
          >
            <div className="px-4 py-3">
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                {user.user_metadata.name}
              </span>
              <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                {user.user_metadata.email}
              </span>
            </div>
            <ul
              className="py-1 text-gray-500 dark:text-gray-400"
              aria-labelledby="dropdown"
            >
              <li>
                <Link
                  href={"/myaccount"}
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Account settings
                </a>
              </li>
            </ul>
            <ul
              className="py-1 text-gray-500 dark:text-gray-400"
              aria-labelledby="dropdown"
            >
              <li>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="mr-2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
                  </svg>
                  My likes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="mr-2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {" "}
                    <path d="m1.56 6.245 8 3.924a1 1 0 0 0 .88 0l8-3.924a1 1 0 0 0 0-1.8l-8-3.925a1 1 0 0 0-.88 0l-8 3.925a1 1 0 0 0 0 1.8Z" />{" "}
                    <path d="M18 8.376a1 1 0 0 0-1 1v.163l-7 3.434-7-3.434v-.163a1 1 0 0 0-2 0v.786a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.786a1 1 0 0 0-1-1Z" />{" "}
                    <path d="M17.993 13.191a1 1 0 0 0-1 1v.163l-7 3.435-7-3.435v-.163a1 1 0 1 0-2 0v.787a1 1 0 0 0 .56.9l8 3.925a1 1 0 0 0 .88 0l8-3.925a1 1 0 0 0 .56-.9v-.787a1 1 0 0 0-1-1Z" />{" "}
                  </svg>
                  Collections
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <span className="flex items-center">
                    <svg
                      className="text-primary-600 dark:text-primary-500 mr-2 h-4 w-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="m7.164 3.805-4.475.38L.327 6.546a1.114 1.114 0 0 0 .63 1.89l3.2.375 3.007-5.006ZM11.092 15.9l.472 3.14a1.114 1.114 0 0 0 1.89.63l2.36-2.362.38-4.475-5.102 3.067Zm8.617-14.283A1.613 1.613 0 0 0 18.383.291c-1.913-.33-5.811-.736-7.556 1.01-1.98 1.98-6.172 9.491-7.477 11.869a1.1 1.1 0 0 0 .193 1.316l.986.985.985.986a1.1 1.1 0 0 0 1.316.193c2.378-1.3 9.889-5.5 11.869-7.477 1.746-1.745 1.34-5.643 1.01-7.556Zm-3.873 6.268a2.63 2.63 0 1 1-3.72-3.72 2.63 2.63 0 0 1 3.72 3.72Z" />
                    </svg>
                    Pro version
                  </span>
                  <svg
                    className="h-2.5 w-2.5 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                </a>
              </li>
            </ul>
            <ul
              className="py-1 text-gray-500 dark:text-gray-400"
              aria-labelledby="dropdown"
            >
              <Link
                href={"/"}
                onClick={handleSignOut}
                className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Sign out
              </Link>
            </ul>
          </div>
        </>
      ) : (
        <>
          <button
            data-modal-target="authentication-modal"
            data-modal-toggle="authentication-modal"
            className="block cursor-pointer rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            Iniciar sesión
          </button>
          <LoginModal />
        </>
      )}
    </>
  );
}
