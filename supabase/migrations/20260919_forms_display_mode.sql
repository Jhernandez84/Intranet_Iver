-- Agrega el modo de visualización de la página pública de cada formulario:
-- pantalla completa vs. tarjeta 16:9 centrada (configuración general del formulario).
alter table forms
  add column if not exists display_mode text not null default 'fullscreen'
  check (display_mode in ('fullscreen', 'card'));
