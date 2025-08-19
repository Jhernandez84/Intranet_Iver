// app/(dashboard)/layout.tsx

export default async function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="h-[91.7vh] p-2 md:flex">
        <div className="text-medium w-full rounded-lg bg-gray-50 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
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
          {children}
        </div>
      </div>
    </>
  );
}
