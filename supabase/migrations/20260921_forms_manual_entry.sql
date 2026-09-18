-- Permite que el staff registre respuestas manualmente (registro rápido)
-- desde la pantalla de respuestas, sin importar el estado del formulario
-- (draft/closed también, ej. para cargar inscripciones tomadas en persona).
drop policy if exists form_responses_staff_insert on form_responses;
create policy form_responses_staff_insert on form_responses
  for insert
  to authenticated
  with check (
    exists (
      select 1 from forms f
      join users u on u.company_id = f.company_id
      where f.id = form_responses.form_id and u.id = auth.uid()
    )
  );

-- El límite de cupos solo debe aplicar a envíos públicos (sin sesión); el
-- staff puede registrar manualmente incluso si el cupo ya se llenó.
create or replace function forms_enforce_max_responses()
returns trigger
language plpgsql
as $$
declare
  v_max integer;
  v_count integer;
begin
  if auth.uid() is not null then
    return new;
  end if;

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
