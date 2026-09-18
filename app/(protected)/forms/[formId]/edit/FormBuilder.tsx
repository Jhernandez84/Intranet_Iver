"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiCheck, HiX } from "react-icons/hi";
import {
  Button,
  Label,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Modal,
  ModalHeader,
  ModalBody,
  Toast,
  ToastToggle,
} from "flowbite-react";
import FieldList from "../../_components/FieldList";
import FieldConfigPanel from "../../_components/FieldConfigPanel";
import FieldOptionsPanel from "../../_components/FieldOptionsPanel";
import FormRenderer from "../../_components/FormRenderer";
import CoverImageUploader from "../../_components/CoverImageUploader";
import { updateForm } from "../../actions";
import type {
  DisplayMode,
  FieldDefinition,
  FieldType,
  FormDefinition,
  RedirectType,
} from "../../../../lib/forms/types";

interface FormBuilderProps {
  initialForm: FormDefinition;
}

type BuilderTab = "crear" | "ajustes" | "publicar";

export default function FormBuilder({ initialForm }: FormBuilderProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState<BuilderTab>("crear");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialForm.fields[0]?.id ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [redirectEnabled, setRedirectEnabled] = useState(
    !!initialForm.redirectUrl,
  );
  const [toast, setToast] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/forms/f/${form.slug}`
      : `/forms/f/${form.slug}`;

  const selectedField =
    form.fields.find((f) => f.id === selectedFieldId) ?? null;

  const addField = (type: FieldType) => {
    const newField: FieldDefinition = {
      id: `campo_${Date.now()}`,
      label: "Nueva pregunta",
      type,
      required: false,
    };
    setForm((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, patch: Partial<FieldDefinition>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  };

  const removeField = (id: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
      dedupeField: prev.dedupeField === id ? null : prev.dedupeField,
    }));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const moveField = (id: string, direction: -1 | 1) => {
    setForm((prev) => {
      const index = prev.fields.findIndex((f) => f.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.fields.length)
        return prev;
      const fields = [...prev.fields];
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...prev, fields };
    });
  };

  const toggleDedupeField = () => {
    if (!selectedField) return;
    setForm((prev) => ({
      ...prev,
      dedupeField: prev.dedupeField === selectedField.id ? null : selectedField.id,
    }));
  };

  const buildWhatsappUrl = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) return null;
    return `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  };

  const updateWhatsappRedirect = (patch: { phone?: string; message?: string }) => {
    const phone = patch.phone ?? form.redirectWhatsappPhone ?? "";
    const message = patch.message ?? form.redirectMessage ?? "";
    setForm({
      ...form,
      redirectWhatsappPhone: patch.phone ?? form.redirectWhatsappPhone,
      redirectMessage: patch.message ?? form.redirectMessage,
      redirectUrl: buildWhatsappUrl(phone, message),
    });
  };

  const handleSave = async (nextStatus = form.status) => {
    setSaving(true);
    try {
      await updateForm(form.id, {
        name: form.name,
        slug: form.slug,
        status: nextStatus,
        fields: form.fields,
        maxResponses: form.maxResponses,
        dedupeField: form.dedupeField,
        allowDuplicates: form.allowDuplicates,
        notifyEmail: form.notifyEmail,
        displayMode: form.displayMode,
        coverImageUrl: form.coverImageUrl,
        coverTitle: form.coverTitle,
        coverSubtitle: form.coverSubtitle,
        successTitle: form.successTitle,
        successBody: form.successBody,
        redirectUrl: form.redirectUrl,
        redirectLabel: form.redirectLabel,
        redirectType: form.redirectType,
        redirectWhatsappPhone: form.redirectWhatsappPhone,
        redirectMessage: form.redirectMessage,
        opensAt: form.opensAt,
        closesAt: form.closesAt,
        price: form.price,
        themeColor: form.themeColor,
      });
      setForm((prev) => ({ ...prev, status: nextStatus }));
      showToast(
        "success",
        nextStatus === "published" ? "Formulario publicado" : "Guardado",
      );
      router.refresh();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "No se pudo guardar",
      );
    } finally {
      setSaving(false);
    }
  };

  const copyPublicUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra superior: título + tabs + acciones, todo separado con bordes claros */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Link
              href="/forms"
              title="Volver al listado"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <HiArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="max-w-xs font-semibold"
              sizing="sm"
            />
          </div>
          <div className="flex gap-2">
            <Button color="light" size="sm" onClick={() => setShowPreview(true)}>
              Vista previa
            </Button>
            <Button
              color="light"
              size="sm"
              disabled={saving}
              onClick={() => handleSave()}
            >
              Guardar borrador
            </Button>
            <Button size="sm" disabled={saving} onClick={() => handleSave("published")}>
              Publicar
            </Button>
          </div>
        </div>

        <div className="flex gap-1 px-4 pt-2">
          {(
            [
              ["crear", "Crear"],
              ["ajustes", "Ajustes"],
              ["publicar", "Publicar"],
            ] as [BuilderTab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "crear" && (
        <div className="flex flex-col rounded-lg border border-gray-200 sm:flex-row dark:border-gray-700">
          <FieldList
            fields={form.fields}
            selectedId={selectedFieldId}
            onSelect={setSelectedFieldId}
            onAdd={addField}
            onRemove={removeField}
            onMove={moveField}
          />
          <FieldConfigPanel
            field={selectedField}
            onChange={(patch) =>
              selectedField && updateField(selectedField.id, patch)
            }
          />
          <FieldOptionsPanel
            field={selectedField}
            onChange={(patch) =>
              selectedField && updateField(selectedField.id, patch)
            }
            isDedupeField={
              !!selectedField && form.dedupeField === selectedField.id
            }
            onToggleDedupeField={toggleDedupeField}
            allowDuplicates={form.allowDuplicates}
          />
        </div>
      )}

      {activeTab === "ajustes" && (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">
              General
            </h3>
            <div>
              <Label htmlFor="form-slug">URL pública (slug)</Label>
              <TextInput
                id="form-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Cómo se muestra la página pública</Label>
              <div className="mt-1 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="display-mode"
                    checked={form.displayMode === "fullscreen"}
                    onChange={() =>
                      setForm({ ...form, displayMode: "fullscreen" })
                    }
                  />
                  Pantalla completa
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="display-mode"
                    checked={form.displayMode === "card"}
                    onChange={() => setForm({ ...form, displayMode: "card" })}
                  />
                  Tarjeta 16:9 centrada
                </label>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">
              Portada
            </h3>
            <div>
              <Label>Imagen de portada</Label>
              <CoverImageUploader
                value={form.coverImageUrl}
                onChange={(url) => setForm({ ...form, coverImageUrl: url })}
              />
            </div>
            <div>
              <Label htmlFor="cover-title">
                Título principal (vacío = usa el nombre del formulario)
              </Label>
              <TextInput
                id="cover-title"
                value={form.coverTitle ?? ""}
                onChange={(e) =>
                  setForm({ ...form, coverTitle: e.target.value || null })
                }
              />
            </div>
            <div>
              <Label htmlFor="cover-subtitle">Subtítulo</Label>
              <TextInput
                id="cover-subtitle"
                value={form.coverSubtitle ?? ""}
                onChange={(e) =>
                  setForm({ ...form, coverSubtitle: e.target.value || null })
                }
              />
            </div>
            <div>
              <Label htmlFor="theme-color">Color de acento</Label>
              <div className="flex items-center gap-2">
                <input
                  id="theme-color"
                  type="color"
                  value={form.themeColor ?? "#1c64f2"}
                  onChange={(e) =>
                    setForm({ ...form, themeColor: e.target.value })
                  }
                  className="h-9 w-14 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                {form.themeColor && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, themeColor: null })}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Usar color por defecto
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">
              Cupos y duplicados
            </h3>
            <div>
              <Label htmlFor="max-responses">
                Límite de cupos (vacío = sin límite)
              </Label>
              <TextInput
                id="max-responses"
                type="number"
                min={1}
                value={form.maxResponses ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxResponses: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="price">
                Valor de inscripción en $ (vacío = gratuito)
              </Label>
              <TextInput
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={form.price ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="allow-duplicates"
                checked={form.allowDuplicates}
                onChange={(e) =>
                  setForm({ ...form, allowDuplicates: e.target.checked })
                }
              />
              <Label htmlFor="allow-duplicates">
                Permitir varias respuestas de la misma persona
              </Label>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">
              Después de enviar
            </h3>
            <div>
              <Label htmlFor="success-title">
                Título del mensaje de agradecimiento
              </Label>
              <TextInput
                id="success-title"
                placeholder="¡Gracias!"
                value={form.successTitle ?? ""}
                onChange={(e) =>
                  setForm({ ...form, successTitle: e.target.value || null })
                }
              />
            </div>
            <div>
              <Label htmlFor="success-body">Cuerpo del mensaje</Label>
              <Textarea
                id="success-body"
                placeholder="Tu respuesta fue registrada."
                value={form.successBody ?? ""}
                onChange={(e) =>
                  setForm({ ...form, successBody: e.target.value || null })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="redirect-enabled"
                checked={redirectEnabled}
                onChange={(e) => {
                  setRedirectEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setForm({ ...form, redirectUrl: null });
                  } else if (!form.redirectType) {
                    setForm({ ...form, redirectType: "website" });
                  }
                }}
              />
              <Label htmlFor="redirect-enabled">
                Ofrecer un botón para ir a otra página después de enviar
              </Label>
            </div>
            {redirectEnabled && (
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="redirect-label">Nombre para mostrar</Label>
                  <TextInput
                    id="redirect-label"
                    placeholder="Únete a nuestro grupo de WhatsApp"
                    value={form.redirectLabel ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        redirectLabel: e.target.value || null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="redirect-type">Tipo de enlace</Label>
                  <Select
                    id="redirect-type"
                    value={form.redirectType ?? "website"}
                    onChange={(e) => {
                      const type = e.target.value as RedirectType;
                      if (type === "whatsapp") {
                        setForm({
                          ...form,
                          redirectType: type,
                          redirectUrl: buildWhatsappUrl(
                            form.redirectWhatsappPhone ?? "",
                            form.redirectMessage ?? "",
                          ),
                        });
                      } else {
                        setForm({ ...form, redirectType: type, redirectUrl: null });
                      }
                    }}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="website">Página web</option>
                    <option value="other">Otro</option>
                  </Select>
                </div>

                {form.redirectType === "whatsapp" ? (
                  <>
                    <div>
                      <Label htmlFor="redirect-whatsapp-phone">
                        Número de WhatsApp (con código de país, solo números)
                      </Label>
                      <TextInput
                        id="redirect-whatsapp-phone"
                        placeholder="56912345678"
                        value={form.redirectWhatsappPhone ?? ""}
                        onChange={(e) =>
                          updateWhatsappRedirect({ phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="redirect-message">
                        Mensaje predefinido
                      </Label>
                      <Textarea
                        id="redirect-message"
                        placeholder="Hola, quiero inscribirme en..."
                        value={form.redirectMessage ?? ""}
                        onChange={(e) =>
                          updateWhatsappRedirect({ message: e.target.value })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <Label htmlFor="redirect-url">URL de destino</Label>
                    <TextInput
                      id="redirect-url"
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={form.redirectUrl ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          redirectUrl: e.target.value || null,
                        })
                      }
                    />
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  La persona siempre ve el mensaje de agradecimiento; este botón
                  le pregunta si quiere continuar, no la redirige
                  automáticamente.
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">
              Programación
            </h3>
            <div>
              <Label htmlFor="opens-at">Se abre automáticamente el</Label>
              <TextInput
                id="opens-at"
                type="datetime-local"
                value={toDatetimeLocal(form.opensAt)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    opensAt: fromDatetimeLocal(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="closes-at">Se cierra automáticamente el</Label>
              <TextInput
                id="closes-at"
                type="datetime-local"
                value={toDatetimeLocal(form.closesAt)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    closesAt: fromDatetimeLocal(e.target.value),
                  })
                }
              />
            </div>
            <p className="text-xs text-gray-400">
              El formulario debe estar publicado para que estas fechas apliquen.
            </p>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">
              Notificaciones
            </h3>
            <div>
              <Label htmlFor="notify-email">Notificar nuevas respuestas a</Label>
              <TextInput
                id="notify-email"
                type="email"
                placeholder="staff@iglesia.cl"
                value={form.notifyEmail ?? ""}
                onChange={(e) =>
                  setForm({ ...form, notifyEmail: e.target.value || null })
                }
              />
            </div>
          </section>
        </div>
      )}

      {activeTab === "publicar" && (
        <div className="flex max-w-xl flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estado actual:{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {form.status === "published"
                ? "Publicado"
                : form.status === "closed"
                  ? "Cerrado"
                  : "Borrador"}
            </span>
          </p>

          {form.status === "published" ? (
            <div className="flex items-center gap-2">
              <TextInput readOnly value={publicUrl} className="flex-1" />
              <Button color="light" onClick={copyPublicUrl}>
                {linkCopied ? "¡Copiado!" : "Copiar"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Publica el formulario para obtener su link público.
            </p>
          )}

          <div className="flex gap-2">
            <Button disabled={saving} onClick={() => handleSave("published")}>
              {form.status === "published" ? "Actualizar publicado" : "Publicar formulario"}
            </Button>
            {form.status === "published" && (
              <Button
                color="light"
                disabled={saving}
                onClick={() => handleSave("closed")}
              >
                Cerrar formulario
              </Button>
            )}
          </div>
        </div>
      )}

      <Modal show={showPreview} onClose={() => setShowPreview(false)} size="lg">
        <ModalHeader>Vista previa</ModalHeader>
        <ModalBody>
          {form.displayMode === "card" ? (
            <div className="mx-auto flex h-[50vh] min-h-[380px] w-full max-w-md flex-col rounded-xl border border-gray-200 p-6 dark:border-gray-700">
              <FormRenderer
                fields={form.fields}
                mode="preview"
                paged
                formName={form.name}
                coverImageUrl={form.coverImageUrl}
                coverTitle={form.coverTitle}
                coverSubtitle={form.coverSubtitle}
                themeColor={form.themeColor}
              />
            </div>
          ) : (
            <FormRenderer
              fields={form.fields}
              mode="preview"
              formName={form.name}
              coverImageUrl={form.coverImageUrl}
              coverTitle={form.coverTitle}
              coverSubtitle={form.coverSubtitle}
              themeColor={form.themeColor}
            />
          )}
        </ModalBody>
      </Modal>

      {toast && (
        <div className="fixed right-4 bottom-4 z-50">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                toast.type === "success"
                  ? "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200"
                  : "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200"
              }`}
            >
              {toast.type === "success" ? (
                <HiCheck className="h-5 w-5" />
              ) : (
                <HiX className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <ToastToggle onDismiss={() => setToast(null)} />
          </Toast>
        </div>
      )}
    </div>
  );
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}
