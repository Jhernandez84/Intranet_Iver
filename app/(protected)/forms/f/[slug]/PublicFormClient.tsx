"use client";

import FormRenderer from "../../_components/FormRenderer";
import { submitPublicResponse } from "./actions";
import type { FieldDefinition } from "../../../../lib/forms/types";

interface PublicFormClientProps {
  slug: string;
  fields: FieldDefinition[];
  submitDisabledReason?: string;
  successTitle?: string | null;
  successBody?: string | null;
  redirectUrl?: string | null;
  paged?: boolean;
}

export default function PublicFormClient({
  slug,
  fields,
  submitDisabledReason,
  successTitle,
  successBody,
  redirectUrl,
  paged,
}: PublicFormClientProps) {
  const handleSubmit = async (answers: Record<string, unknown>) => {
    const result = await submitPublicResponse(slug, answers);
    if (!result.ok) {
      throw new Error(result.error ?? "No se pudo enviar el formulario.");
    }
  };

  return (
    <FormRenderer
      fields={fields}
      mode="public"
      onSubmit={handleSubmit}
      submitDisabledReason={submitDisabledReason}
      successTitle={successTitle}
      successBody={successBody}
      redirectUrl={redirectUrl}
      paged={paged}
    />
  );
}
