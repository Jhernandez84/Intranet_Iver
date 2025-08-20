import { Dropdown, DropdownItem, DropdownDivider } from "flowbite-react";

export default function MovementsTable() {
  return (
    <div className="relative rounded shadow-md sm:rounded-lg">
      <div className="max-h-[250px] overflow-y-auto">
        <table className="w-full table-fixed text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                <Dropdown
                  className="uppercase"
                  label="Producto"
                  inline
                  dismissOnClick={true}
                >
                  <DropdownItem>Ordenar A-Z</DropdownItem>
                  <DropdownItem>Ordenar Z-A</DropdownItem>
                  <DropdownDivider />

                  <DropdownItem>Dashboard</DropdownItem>
                  <DropdownItem>Settings</DropdownItem>
                  <DropdownItem>Earnings</DropdownItem>
                  <DropdownItem>Sign out</DropdownItem>
                </Dropdown>{" "}
              </th>
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                Color
              </th>
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                Category
              </th>
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                Price
              </th>
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                Price
              </th>
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                Price
              </th>
              <th className="sticky top-0 z-10 w-1/4 bg-gray-50 px-6 py-3 dark:bg-gray-900">
                Edit
                {/* <span className="sr-only">Edit</span> */}
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(20)].map((_, i) => (
              <tr
                key={i}
                className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
                >
                  Producto #{i + 1}
                </th>
                <td className="px-6 py-4">Color</td>
                <td className="px-6 py-4">Categoría</td>
                <td className="px-6 py-4">$999</td>
                <td className="px-6 py-4">$999</td>
                <td className="px-6 py-4">$999</td>
                <td className="px-6 py-4">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                  >
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
