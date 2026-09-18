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
  redirectLabel?: string | null;
  paged?: boolean;
  formName?: string;
  coverImageUrl?: string | null;
  coverTitle?: string | null;
  coverSubtitle?: string | null;
  themeColor?: string | null;
}

export default function PublicFormClient({
  slug,
  fields,
  submitDisabledReason,
  successTitle,
  successBody,
  redirectUrl,
  redirectLabel,
  paged,
  formName,
  coverImageUrl,
  coverTitle,
  coverSubtitle,
  themeColor,
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
      redirectLabel={redirectLabel}
      paged={paged}
      formName={formName}
      coverImageUrl={coverImageUrl}
      coverTitle={coverTitle}
      coverSubtitle={coverSubtitle}
      themeColor={themeColor}
    />
  );
}
