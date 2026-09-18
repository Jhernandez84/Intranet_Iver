import { notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { formRowToDefinition, type FormRow } from "../../../../lib/forms/types";
import FormBuilder from "./FormBuilder";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single<FormRow>();

  if (!row) notFound();

  return (
    <div className="mx-auto w-[95%] p-4">
      <FormBuilder initialForm={formRowToDefinition(row)} />
    </div>
  );
}
