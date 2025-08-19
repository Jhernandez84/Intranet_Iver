"use client";

import { useUser } from "../../context/UserProvider";
import { useCompany } from "../../context/CompanyProvider";
import { useUserAccess } from "../../context/UserAccessProvider";
import { useCompanyBranchesAccess } from "../../context/CompanyBranchesProvider";

export default function MyAccountPage() {
  const { user, isLoading } = useUser();
  const { companyData, isLoadingCompany } = useCompany();
  const access = useUserAccess();
  const Branches = useCompanyBranchesAccess();

  if (isLoading) return;

  const fullName = user?.full_name || ""; // Usa un string vacío si full_name es nulo
  const nameParts = fullName.split(" "); // Divide la cadena por espacios

  const firstName = nameParts[0]; // La primera palabra
  const lastName = nameParts[nameParts.length - 1]; // La última palabra

  return (
    <>
      <div className="h-[93vh] bg-gray-800 p-2">
        <div>
          <div className="mb-6 grid gap-3 md:grid-cols-[40%_20%_20%_15%]">
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Id de Usuario
              </label>
              <input
                type="text"
                id="first_name"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder={user?.id}
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Nombre
              </label>
              <input
                type="text"
                id="first_name"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder={firstName}
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Apellido
              </label>
              <input
                type="text"
                id="last_name"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder={lastName}
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Estado de la cuenta
              </label>
              <input
                type="text"
                id="last_name"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder={companyData?.subscription_status}
                disabled
              />
            </div>
          </div>
        </div>
        <div className="mb-6 grid gap-2 md:grid-cols-[33%_33%_31%]">
          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Company
            </label>
            <input
              type="text"
              id="company"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder={companyData?.name}
              disabled
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder={user?.email}
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Phone number
            </label>
            <input
              type="tel"
              id="phone"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="123-45-678"
              pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
              required
            />
          </div>
        </div>
        <div className="mb-6 grid gap-2 md:grid-cols-2">
          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Accesos habilitados
            </label>
            <ul className="w-48 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {access?.access?.map((items) => {
                return (
                  <li
                    key={items.key}
                    className="w-full rounded-t-lg border-b border-gray-200 px-4 py-2 dark:border-gray-600"
                  >
                    {items.name}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Sedes habilitadas
            </label>
            <ul className="w-48 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {Branches.map((items) => {
                return (
                  <li
                    key={items.id}
                    className="w-full rounded-t-lg border-b border-gray-200 px-4 py-2 dark:border-gray-600"
                  >
                    {items.nombre}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
