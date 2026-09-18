-- Portada (imagen + texto principal), mensaje de cierre personalizable,
-- redirección tras enviar, y apertura/cierre programado.
alter table forms
  add column if not exists cover_image_url text,
  add column if not exists cover_title text,
  add column if not exists cover_subtitle text,
  add column if not exists success_title text,
  add column if not exists success_body text,
  add column if not exists redirect_url text,
  add column if not exists opens_at timestamptz,
  add column if not exists closes_at timestamptz;

-- La lectura pública debe respetar también la ventana de apertura/cierre,
-- no solo el status manual (evita necesitar un cron para "cerrar solo").
drop policy if exists forms_public_read_published on forms;
create policy forms_public_read_published on forms
  for select
  using (
    status = 'published'
    and (opens_at is null or opens_at <= now())
    and (closes_at is null or closes_at > now())
  );

drop policy if exists form_responses_public_insert on form_responses;
create policy form_responses_public_insert on form_responses
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from forms f
      where f.id = form_responses.form_id
      and f.status = 'published'
      and (f.opens_at is null or f.opens_at <= now())
      and (f.closes_at is null or f.closes_at > now())
    )
  );

-- ---- Bucket de Storage para las imágenes de portada ----
insert into storage.buckets (id, name, public)
values ('form-covers', 'form-covers', true)
on conflict (id) do nothing;

drop policy if exists form_covers_public_read on storage.objects;
create policy form_covers_public_read on storage.objects
  for select
  using (bucket_id = 'form-covers');

drop policy if exists form_covers_staff_write on storage.objects;
create policy form_covers_staff_write on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'form-covers');

drop policy if exists form_covers_staff_update on storage.objects;
create policy form_covers_staff_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'form-covers');

drop policy if exists form_covers_staff_delete on storage.objects;
create policy form_covers_staff_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'form-covers');
