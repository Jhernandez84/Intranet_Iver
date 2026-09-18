-- ============================================================
-- MÓDULO FORMS — esquema nuevo (correr a mano en el editor SQL de Supabase)
-- ============================================================

create table if not exists forms (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references companies(id),   -- nullable: ver nota de migración histórica
  sede_id          uuid references sedes(id),        -- null = abierto a todas las sedes
  name             text not null,
  slug             text not null,                    -- URL pública /forms/f/[slug]
  status           text not null default 'draft'
                   check (status in ('draft','published','closed')),
  fields           jsonb not null default '[]'::jsonb,   -- FieldDefinition[]
  max_responses    integer,                           -- null = sin límite ("cupos")
  dedupe_field     text,                               -- id de campo usado para evitar duplicados; solo aplica si allow_duplicates = false
  allow_duplicates boolean not null default false,      -- "permitir varias respuestas / duplicados" (checkbox en el builder)
  notify_email     text,                               -- si no es null, se notifica cada respuesta nueva a este correo (vía Resend)
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (company_id, slug)
);

create index if not exists forms_company_sede_idx on forms (company_id, sede_id);
create index if not exists forms_status_idx on forms (status);

create table if not exists form_responses (
  id             uuid primary key default gen_random_uuid(),
  form_id        uuid not null references forms(id) on delete cascade,
  answers        jsonb not null default '{}'::jsonb,   -- { [fieldId]: valor }
  dedupe_key     text,                                   -- rut/email normalizado cuando dedupe_field está seteado
  submitted_at   timestamptz not null default now(),
  ip_hash        text,                                    -- sha256 de la IP, solo trazabilidad anti-abuso
  attended_at    timestamptz,                              -- check-in ("marcar asistencia")
  checked_in_by  uuid references auth.users(id)
);

create index if not exists form_responses_form_idx on form_responses (form_id);

-- Guard de duplicados: solo aplica cuando el formulario realmente pide
-- rut/email (dedupe_key no nulo); un índice único parcial evita que dos
-- NULLs colisionen entre sí en formularios sin ese control.
create unique index if not exists form_responses_dedupe_uidx
  on form_responses (form_id, dedupe_key)
  where dedupe_key is not null;

-- Límite de cupos: se aplica a nivel de base de datos, no con un
-- "contar-y-luego-insertar" en el código de la app, para evitar la
-- condición de carrera cuando dos personas envían el último cupo al mismo tiempo.
create or replace function forms_enforce_max_responses()
returns trigger
language plpgsql
as $$
declare
  v_max integer;
  v_count integer;
begin
  select max_responses into v_max from forms where id = new.form_id for update;

  if v_max is not null then
    select count(*) into v_count from form_responses where form_id = new.form_id;
    if v_count >= v_max then
      raise exception 'FORM_FULL' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists form_responses_max_check on form_responses;
create trigger form_responses_max_check
  before insert on form_responses
  for each row execute function forms_enforce_max_responses();

-- ---- Row Level Security ----
alter table forms enable row level security;
alter table form_responses enable row level security;

-- IMPORTANTE: company_id/sede_id NO viven en auth.jwt()/user_metadata (ahí
-- solo vive `access`, ver middleware.ts). Viven en la tabla `users` que
-- UserProvider.tsx consulta (`select ... from users where id = auth.uid()`).
-- Las políticas de staff usan esa tabla, no el JWT.

drop policy if exists forms_staff_all on forms;
create policy forms_staff_all on forms
  for all
  using (
    auth.uid() is not null
    and exists (
      select 1 from users u
      where u.id = auth.uid() and u.company_id = forms.company_id
    )
  )
  with check (
    exists (
      select 1 from users u
      where u.id = auth.uid() and u.company_id = forms.company_id
    )
  );

-- Lectura pública de un formulario publicado (para que la página pública,
-- sin sesión, cargue la definición de campos).
drop policy if exists forms_public_read_published on forms;
create policy forms_public_read_published on forms
  for select
  using (status = 'published');

-- INSERT público en form_responses: cualquiera (anon key, sin login) puede
-- enviar a un formulario publicado — la única "escritura sin sesión" del esquema.
drop policy if exists form_responses_public_insert on form_responses;
create policy form_responses_public_insert on form_responses
  for insert
  to anon, authenticated
  with check (
    exists (select 1 from forms f where f.id = form_responses.form_id and f.status = 'published')
  );

-- Lectura de respuestas: staff de la misma empresa.
drop policy if exists form_responses_staff_read on form_responses;
create policy form_responses_staff_read on form_responses
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from forms f
      join users u on u.company_id = f.company_id
      where f.id = form_responses.form_id and u.id = auth.uid()
    )
  );

-- Check-in (attended_at/checked_in_by) — mismo alcance que la lectura.
drop policy if exists form_responses_staff_checkin on form_responses;
create policy form_responses_staff_checkin on form_responses
  for update
  using (
    auth.uid() is not null
    and exists (
      select 1 from forms f
      join users u on u.company_id = f.company_id
      where f.id = form_responses.form_id and u.id = auth.uid()
    )
  );
