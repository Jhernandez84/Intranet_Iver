-- Permite al creador del formulario decidir si se muestra la pantalla de
-- "revisa tus respuestas" antes del envío final, o si se salta directo al
-- mensaje de confirmación. Por defecto true para no cambiar el
-- comportamiento de los formularios ya creados.
alter table forms
  add column if not exists show_review boolean not null default true;
