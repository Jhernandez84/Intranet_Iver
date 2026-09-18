import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendNewResponseNotification(params: {
  notifyEmail: string;
  formName: string;
  answers: Record<string, unknown>;
}) {
  if (!resend) {
    console.warn(
      "RESEND_API_KEY no está configurado; se omite la notificación de nueva respuesta.",
    );
    return;
  }

  try {
    await resend.emails.send({
      // TODO: reemplazar por un remitente de un dominio propio verificado en
      // Resend. Con el dominio de pruebas (resend.dev) solo se puede enviar
      // al correo con el que se creó la cuenta de Resend.
      from: "Church Manager <onboarding@resend.dev>",
      to: params.notifyEmail,
      subject: `Nueva respuesta en "${params.formName}"`,
      text: Object.entries(params.answers)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
    });
  } catch (err) {
    // No relanzar: la respuesta ya se guardó, un fallo de email no debe
    // romper el envío del formulario.
    console.error("No se pudo enviar la notificación de nueva respuesta:", err);
  }
}
