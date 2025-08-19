export default function CardComponent() {
  return (
    <>
      <div>
        <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-sm md:p-6 dark:bg-gray-900">
          <div className="mb-4 flex justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <div className="flex items-center">
              <div className="me-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <svg
                  className="h-6 w-6 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 19"
                >
                  <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z" />
                  <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z" />
                </svg>
              </div>
              <div>
                <h5 className="pb-1 text-2xl leading-none font-bold text-gray-900 dark:text-white">
                  3.4k
                </h5>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Leads generated per week
                </p>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                <svg
                  className="me-1.5 h-2.5 w-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13V1m0 0L1 5m4-4 4 4"
                  />
                </svg>
                42.5%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <dl className="flex items-center">
              <dt className="me-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                Money spent:
              </dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                $3,232
              </dd>
            </dl>
            <dl className="flex items-center justify-end">
              <dt className="me-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                Conversion rate:
              </dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                1.2%
              </dd>
            </dl>
          </div>

          <div id="column-chart"></div>
          <div className="grid grid-cols-1 items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pt-5">
              {/* <!-- Button --> */}
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="lastDaysdropdown"
                data-dropdown-placement="bottom"
                className="inline-flex items-center text-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                type="button"
              >
                Last 7 days
                <svg
                  className="m-2.5 ms-1.5 w-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              {/* <!-- Dropdown menu --> */}
              <div
                id="lastDaysdropdown"
                className="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Yesterday
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Today
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 7 days
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 30 days
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Last 90 days
                    </a>
                  </li>
                </ul>
              </div>
              <a
                href="#"
                className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 uppercase hover:bg-gray-100 hover:text-blue-700 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-blue-500 dark:focus:ring-gray-700"
              >
                Leads Report
                <svg
                  className="ms-1.5 h-2.5 w-2.5 rtl:rotate-180"
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
