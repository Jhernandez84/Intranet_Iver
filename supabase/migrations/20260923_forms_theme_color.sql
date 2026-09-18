-- Color de acento configurable por formulario (botones, barra de progreso
-- en modo tarjeta) para que el admin pueda darle identidad visual.
alter table forms
  add column if not exists theme_color text;
