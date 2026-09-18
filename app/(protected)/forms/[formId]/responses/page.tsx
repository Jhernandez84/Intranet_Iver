import Link from "next/link";
import { notFound } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import { createClient } from "../../../../lib/supabase/server";
import { formRowToDefinition, type FormRow } from "../../../../lib/forms/types";
import ResponsesClient from "./ResponsesClient";

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const supabase = await createClient();

  const { data: formRow } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single<FormRow>();

  if (!formRow) notFound();

  const { data: responses } = await supabase
    .from("form_responses")
    .select("id, answers, submitted_at, attended_at")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false });

  return (
    <div className="p-4">
      <Link
        href="/forms"
        className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <HiArrowLeft className="h-4 w-4" />
        Volver al listado
      </Link>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        {formRow.name} — Respuestas
      </h1>
      <ResponsesClient
        formId={formId}
        formName={formRow.name}
        fields={formRowToDefinition(formRow).fields}
        responses={responses ?? []}
      />
    </div>
  );
}
