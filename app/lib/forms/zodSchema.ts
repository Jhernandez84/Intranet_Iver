import { z, type ZodTypeAny } from "zod";
import type { FieldDefinition } from "./types";

export function buildZodSchemaFromFields(fields: FieldDefinition[]) {
  const shape: Record<string, ZodTypeAny> = {};

  for (const f of fields) {
    let schema: ZodTypeAny;
    switch (f.type) {
      case "email":
        schema = z.string().email("Email inválido");
        break;
      case "number":
        schema = z.coerce.number("Debe ser un número");
        break;
      case "checkbox":
        schema = z.boolean();
        break;
      case "select":
      case "radio":
        schema =
          f.options && f.options.length > 0
            ? z.enum(
                f.options as [string, ...string[]],
                "Selecciona una opción válida",
              )
            : z.string();
        break;
      case "date":
        schema = z
          .string()
          .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida");
        break;
      default: // text, textarea, tel
        schema = z.string();
    }

    if (!f.required) {
      schema = schema.optional().nullable();
    } else if (schema instanceof z.ZodString) {
      schema = schema.min(1, "Este campo es obligatorio");
    }

    shape[f.id] = schema;
  }

  return z.object(shape);
}
