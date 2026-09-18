"use server";

import { createClient } from "../../../../lib/supabase/server";
import { normalizeDedupeKey } from "../../../../lib/forms/dedupe";
import { sendNewResponseNotification } from "../../../../lib/forms/notify";
import type { FormRow } from "../../../../lib/forms/types";

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

export async function submitPublicResponse(
  slug: string,
  answers: Record<string, unknown>,
): Promise<SubmitResult> {
  const supabase = await createClient();

  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .single<FormRow>();

  if (formError || !form || form.status !== "published") {
    return { ok: false, error: "Este formulario ya no está disponible." };
  }

  if (form.opens_at && new Date(form.opens_at) > new Date()) {
    return { ok: false, error: "Este formulario todavía no abre." };
  }
  if (form.closes_at && new Date(form.closes_at) <= new Date()) {
    return { ok: false, error: "Este formulario ya cerró." };
  }

  const dedupeKey =
    form.dedupe_field && !form.allow_duplicates
      ? normalizeDedupeKey(answers[form.dedupe_field])
      : null;

  const { error: insertError } = await supabase.from("form_responses").insert({
    form_id: form.id,
    answers,
    dedupe_key: dedupeKey,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, error: "Ya te encuentras registrado en este formulario." };
    }
    if (insertError.code === "P0001") {
      return { ok: false, error: "Este formulario alcanzó su cupo máximo." };
    }
    return { ok: false, error: "No se pudo guardar tu respuesta. Intenta de nuevo." };
  }

  if (form.notify_email) {
    await sendNewResponseNotification({
      notifyEmail: form.notify_email,
      formName: form.name,
      answers,
    });
  }

  return { ok: true };
}
