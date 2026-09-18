"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import type {
  DisplayMode,
  FieldDefinition,
  FormStatus,
  RedirectType,
} from "../../lib/forms/types";

async function getCurrentUserCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesión activa.");

  const { data: userData, error } = await supabase
    .from("users")
    .select("company_id, sede_id")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return { supabase, userId: user.id, ...userData };
}

export async function createForm() {
  const { supabase, userId, company_id, sede_id } =
    await getCurrentUserCompany();

  const slug = `formulario-${Date.now()}`;

  const { data, error } = await supabase
    .from("forms")
    .insert({
      name: "Formulario sin título",
      slug,
      status: "draft",
      fields: [],
      company_id,
      sede_id,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw error;

  redirect(`/forms/${data.id}/edit`);
}

export interface UpdateFormInput {
  name: string;
  slug: string;
  status: FormStatus;
  fields: FieldDefinition[];
  maxResponses: number | null;
  dedupeField: string | null;
  allowDuplicates: boolean;
  notifyEmail: string | null;
  displayMode: DisplayMode;
  coverImageUrl: string | null;
  coverTitle: string | null;
  coverSubtitle: string | null;
  successTitle: string | null;
  successBody: string | null;
  redirectUrl: string | null;
  redirectLabel: string | null;
  redirectType: RedirectType | null;
  redirectWhatsappPhone: string | null;
  redirectMessage: string | null;
  opensAt: string | null;
  closesAt: string | null;
  price: number | null;
  themeColor: string | null;
}

export async function updateForm(formId: string, input: UpdateFormInput) {
  const { supabase } = await getCurrentUserCompany();

  const { error } = await supabase
    .from("forms")
    .update({
      name: input.name,
      slug: input.slug,
      status: input.status,
      fields: input.fields,
      max_responses: input.maxResponses,
      dedupe_field: input.dedupeField,
      allow_duplicates: input.allowDuplicates,
      notify_email: input.notifyEmail,
      display_mode: input.displayMode,
      cover_image_url: input.coverImageUrl,
      cover_title: input.coverTitle,
      cover_subtitle: input.coverSubtitle,
      success_title: input.successTitle,
      success_body: input.successBody,
      redirect_url: input.redirectUrl,
      redirect_label: input.redirectLabel,
      redirect_type: input.redirectType,
      redirect_whatsapp_phone: input.redirectWhatsappPhone,
      redirect_message: input.redirectMessage,
      opens_at: input.opensAt,
      closes_at: input.closesAt,
      price: input.price,
      theme_color: input.themeColor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", formId);

  if (error) throw error;
}

export async function duplicateForm(formId: string) {
  const { supabase, userId } = await getCurrentUserCompany();

  const { data: original, error: fetchError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single();

  if (fetchError) throw fetchError;

  const { data: copy, error: insertError } = await supabase
    .from("forms")
    .insert({
      company_id: original.company_id,
      sede_id: original.sede_id,
      name: `${original.name} (copia)`,
      slug: `${original.slug}-copia-${Date.now()}`,
      status: "draft",
      fields: original.fields,
      max_responses: original.max_responses,
      dedupe_field: original.dedupe_field,
      allow_duplicates: original.allow_duplicates,
      notify_email: original.notify_email,
      display_mode: original.display_mode,
      cover_image_url: original.cover_image_url,
      cover_title: original.cover_title,
      cover_subtitle: original.cover_subtitle,
      success_title: original.success_title,
      success_body: original.success_body,
      redirect_url: original.redirect_url,
      redirect_label: original.redirect_label,
      redirect_type: original.redirect_type,
      redirect_whatsapp_phone: original.redirect_whatsapp_phone,
      redirect_message: original.redirect_message,
      price: original.price,
      theme_color: original.theme_color,
      created_by: userId,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

  revalidatePath("/forms");
  redirect(`/forms/${copy.id}/edit`);
}

export async function setFormsStatus(formIds: string[], status: FormStatus) {
  const { supabase } = await getCurrentUserCompany();

  const { error } = await supabase
    .from("forms")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", formIds);

  if (error) throw error;
  revalidatePath("/forms");
}

export async function deleteForms(formIds: string[]) {
  const { supabase } = await getCurrentUserCompany();

  const { error } = await supabase.from("forms").delete().in("id", formIds);

  if (error) throw error;
  revalidatePath("/forms");
}

export async function checkInResponse(responseId: string) {
  const { supabase, userId } = await getCurrentUserCompany();

  const { error } = await supabase
    .from("form_responses")
    .update({ attended_at: new Date().toISOString(), checked_in_by: userId })
    .eq("id", responseId);

  if (error) throw error;
}

export async function addManualResponse(
  formId: string,
  answers: Record<string, unknown>,
) {
  const { supabase } = await getCurrentUserCompany();

  const { error } = await supabase.from("form_responses").insert({
    form_id: formId,
    answers,
    dedupe_key: null,
  });

  if (error) throw error;
  revalidatePath(`/forms/${formId}/responses`);
}
