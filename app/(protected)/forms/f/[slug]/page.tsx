import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "../../../../lib/supabase/server";
import type { FormRow } from "../../../../lib/forms/types";
import PublicFormClient from "./PublicFormClient";

type FormWithCompany = FormRow & { companies: { name: string } | null };

async function getPublishedForm(slug: string) {
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*, companies(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single<FormWithCompany>();

  return form;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const form = await getPublishedForm(slug);

  if (!form) return { title: "Formulario" };

  const companyName = form.companies?.name;
  return {
    title: companyName ? `${form.name} · ${companyName}` : form.name,
  };
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const form = await getPublishedForm(slug);
  if (!form) notFound();

  const now = new Date();
  if (form.opens_at && new Date(form.opens_at) > now) {
    return (
      <UnavailableMessage
        title="Este formulario todavía no abre"
        detail={`Estará disponible a partir del ${new Date(form.opens_at).toLocaleString("es-CL")}.`}
      />
    );
  }
  if (form.closes_at && new Date(form.closes_at) <= now) {
    return (
      <UnavailableMessage
        title="Este formulario ya cerró"
        detail="Contacta a la organización si crees que esto es un error."
      />
    );
  }

  let submitDisabledReason: string | undefined;
  if (form.max_responses !== null) {
    const { count } = await supabase
      .from("form_responses")
      .select("id", { count: "exact", head: true })
      .eq("form_id", form.id);

    if ((count ?? 0) >= form.max_responses) {
      submitDisabledReason = "Este formulario alcanzó su cupo máximo.";
    }
  }

  const isCard = form.display_mode === "card";
  const heading = form.cover_title || form.name;

  return (
    <div
      className={
        isCard
          ? "flex min-h-screen items-center justify-center bg-gray-100 p-6 dark:bg-gray-900"
          : "min-h-screen bg-white dark:bg-gray-900"
      }
    >
      <div
        className={
          isCard
            ? "flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:h-[40vh] sm:min-h-[380px] sm:w-[60vw] sm:max-w-2xl dark:bg-gray-800"
            : "mx-auto max-w-xl"
        }
      >
        {form.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.cover_image_url}
            alt=""
            className={
              isCard
                ? "h-32 w-full flex-shrink-0 object-cover"
                : "h-56 w-full object-cover"
            }
          />
        )}

        <div
          className={
            isCard
              ? "flex flex-1 flex-col overflow-y-auto p-6 sm:p-8"
              : "p-6"
          }
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {heading}
          </h1>
          {form.cover_subtitle && (
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {form.cover_subtitle}
            </p>
          )}

          <div className={isCard ? "mt-6 flex flex-1 flex-col" : "mt-6"}>
            <PublicFormClient
              slug={slug}
              fields={form.fields}
              submitDisabledReason={submitDisabledReason}
              successTitle={form.success_title}
              successBody={form.success_body}
              redirectUrl={form.redirect_url}
              paged={isCard}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UnavailableMessage({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 dark:bg-gray-900">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{detail}</p>
      </div>
    </div>
  );
}
