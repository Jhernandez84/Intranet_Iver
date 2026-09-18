import { createClient } from "../../lib/supabase/server";
import { createForm } from "./actions";
import FormsListClient from "./FormsListClient";
import type { FormRow } from "../../lib/forms/types";

export default async function FormsListPage() {
  const supabase = await createClient();

  const { data: forms } = await supabase
    .from("forms")
    .select(
      "id, name, slug, status, max_responses, created_at, cover_image_url, price",
    )
    .order("created_at", { ascending: false })
    .returns<
      Pick<
        FormRow,
        | "id"
        | "name"
        | "slug"
        | "status"
        | "max_responses"
        | "created_at"
        | "cover_image_url"
        | "price"
      >[]
    >();

  const { data: allResponses } = await supabase
    .from("form_responses")
    .select("form_id, submitted_at");

  const responseCounts: Record<string, number> = {};
  const lastResponseAt: Record<string, string> = {};
  allResponses?.forEach((r) => {
    responseCounts[r.form_id] = (responseCounts[r.form_id] ?? 0) + 1;
    if (!lastResponseAt[r.form_id] || r.submitted_at > lastResponseAt[r.form_id]) {
      lastResponseAt[r.form_id] = r.submitted_at;
    }
  });

  const totalForms = forms?.length ?? 0;
  const totalResponses = allResponses?.length ?? 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Bloque de stats, separado del resto */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-6">
          <h5 className="text-sm">
            <span className="text-gray-500">Formularios: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalForms}
            </span>
          </h5>
          <h5 className="text-sm">
            <span className="text-gray-500">Respuestas totales: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalResponses}
            </span>
          </h5>
        </div>
        <form action={createForm}>
          <button
            type="submit"
            className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:ring-4 focus:outline-none"
          >
            <svg
              className="mr-2 h-3.5 w-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Nuevo formulario
          </button>
        </form>
      </div>

      <FormsListClient
        forms={forms ?? []}
        responseCounts={responseCounts}
        lastResponseAt={lastResponseAt}
      />
    </div>
  );
}
