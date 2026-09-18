-- Detalle del botón de redirección tras enviar: nombre a mostrar, tipo de
-- enlace (para poder armar el link de WhatsApp con mensaje predefinido y
-- para elegir un ícono acorde), y los campos editables de WhatsApp por
-- separado (no se pueden reconstruir de forma confiable desde la URL final).
alter table forms
  add column if not exists redirect_label text,
  add column if not exists redirect_type text
    check (redirect_type in ('whatsapp', 'instagram', 'website', 'other')),
  add column if not exists redirect_whatsapp_phone text,
  add column if not exists redirect_message text;
