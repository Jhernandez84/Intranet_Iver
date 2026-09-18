-- Valor de inscripción del formulario (opcional, ej. costo de un evento).
alter table forms
  add column if not exists price numeric(10, 2);
