export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "tel"
  | "date"
  | "select"
  | "checkbox"
  | "radio";

export interface FieldDefinition {
  id: string; // slug estable, ej. "rut" — clave en answers y en dedupe
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // select/radio
  placeholder?: string;
}

export type FormStatus = "draft" | "published" | "closed";
export type DisplayMode = "fullscreen" | "card";
export type RedirectType = "whatsapp" | "instagram" | "website" | "other";

export interface FormDefinition {
  id: string;
  companyId: string | null;
  sedeId: string | null;
  name: string;
  slug: string;
  status: FormStatus;
  fields: FieldDefinition[];
  maxResponses: number | null; // configuración del formulario, no un tipo de campo
  dedupeField: string | null; // id de un FieldDefinition, o null
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

export interface FormResponseRow {
  id: string;
  formId: string;
  answers: Record<string, unknown>;
  submittedAt: string;
  attendedAt: string | null;
  checkedInBy: string | null;
}

// Forma cruda de una fila `forms` tal como viene de Supabase (snake_case)
export interface FormRow {
  id: string;
  company_id: string | null;
  sede_id: string | null;
  name: string;
  slug: string;
  status: FormStatus;
  fields: FieldDefinition[];
  max_responses: number | null;
  dedupe_field: string | null;
  allow_duplicates: boolean;
  notify_email: string | null;
  display_mode: DisplayMode;
  cover_image_url: string | null;
  cover_title: string | null;
  cover_subtitle: string | null;
  success_title: string | null;
  success_body: string | null;
  redirect_url: string | null;
  redirect_label: string | null;
  redirect_type: RedirectType | null;
  redirect_whatsapp_phone: string | null;
  redirect_message: string | null;
  opens_at: string | null;
  closes_at: string | null;
  price: number | null;
  theme_color: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormResponseInsertRow {
  id: string;
  form_id: string;
  answers: Record<string, unknown>;
  dedupe_key: string | null;
  submitted_at: string;
  attended_at: string | null;
  checked_in_by: string | null;
}

export function formRowToDefinition(row: FormRow): FormDefinition {
  return {
    id: row.id,
    companyId: row.company_id,
    sedeId: row.sede_id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    fields: row.fields ?? [],
    maxResponses: row.max_responses,
    dedupeField: row.dedupe_field,
    allowDuplicates: row.allow_duplicates,
    notifyEmail: row.notify_email,
    displayMode: row.display_mode,
    coverImageUrl: row.cover_image_url,
    coverTitle: row.cover_title,
    coverSubtitle: row.cover_subtitle,
    successTitle: row.success_title,
    successBody: row.success_body,
    redirectUrl: row.redirect_url,
    redirectLabel: row.redirect_label,
    redirectType: row.redirect_type,
    redirectWhatsappPhone: row.redirect_whatsapp_phone,
    redirectMessage: row.redirect_message,
    opensAt: row.opens_at,
    closesAt: row.closes_at,
    price: row.price,
    themeColor: row.theme_color,
  };
}
