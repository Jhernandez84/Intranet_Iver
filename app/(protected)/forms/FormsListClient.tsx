"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { setFormsStatus, deleteForms, duplicateForm } from "./actions";
import type { FormRow } from "../../lib/forms/types";

const STATUS_DOT: Record<FormRow["status"], string> = {
  draft: "bg-yellow-300",
  published: "bg-green-600",
  closed: "bg-red-700",
};

const STATUS_LABEL: Record<FormRow["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
};

type ListedForm = Pick<
  FormRow,
  | "id"
  | "name"
  | "slug"
  | "status"
  | "max_responses"
  | "created_at"
  | "cover_image_url"
  | "price"
>;

interface FormsListClientProps {
  forms: ListedForm[];
  responseCounts: Record<string, number>;
  lastResponseAt: Record<string, string>;
}

export default function FormsListClient({
  forms,
  responseCounts,
  lastResponseAt,
}: FormsListClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [working, setWorking] = useState(false);

  const allSelected = forms.length > 0 && selected.size === forms.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(forms.map((f) => f.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulk = async (action: () => Promise<void>) => {
    setWorking(true);
    try {
      await action();
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo completar la acción",
        text: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar ${selected.size} formulario(s)?`,
      text: "Esta acción no se puede deshacer. Las respuestas asociadas también se eliminarán.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    runBulk(() => deleteForms(Array.from(selected)));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de acciones, separada visualmente de la tabla */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {selected.size === 0 ? (
          <p className="text-sm text-gray-400">
            Selecciona formularios para publicarlos, cerrarlos o eliminarlos en
            lote.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selected.size} seleccionado(s)
            </p>
            <div className="flex gap-2">
              <button
                disabled={working}
                onClick={() =>
                  runBulk(() =>
                    setFormsStatus(Array.from(selected), "published"),
                  )
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Publicar
              </button>
              <button
                disabled={working}
                onClick={() =>
                  runBulk(() => setFormsStatus(Array.from(selected), "closed"))
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cerrar
              </button>
              <button
                disabled={working}
                onClick={handleDelete}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-gray-800 dark:hover:bg-red-900/20"
              >
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tabla, en su propio bloque separado */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <div className="h-[500px] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="sticky top-0 bg-gray-100 text-xs text-gray-700 uppercase dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 h-4 w-4 rounded border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
                  />
                </th>
                <th scope="col" className="px-2 py-3" />
                <th scope="col" className="px-4 py-3">
                  Formulario
                </th>
                <th scope="col" className="px-4 py-3">
                  Fecha creación
                </th>
                <th scope="col" className="px-4 py-3">
                  Última respuesta
                </th>
                <th scope="col" className="px-4 py-3">
                  Respuestas
                </th>
                <th scope="col" className="px-4 py-3">
                  Cupos
                </th>
                <th scope="col" className="px-4 py-3">
                  Valor
                </th>
                <th scope="col" className="px-4 py-3">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3">
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {forms.map((frm) => {
                const count = responseCounts[frm.id] ?? 0;
                const pct = frm.max_responses
                  ? Math.min(100, Math.round((count / frm.max_responses) * 100))
                  : 0;

                return (
                  <tr
                    key={frm.id}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(frm.id)}
                        onChange={() => toggleOne(frm.id)}
                        className="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 h-4 w-4 rounded border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </td>
                    <td className="px-2 py-3">
                      {frm.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={frm.cover_image_url}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-300 dark:bg-gray-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 16.5V4.5A2.25 2.25 0 015.25 2.25h13.5A2.25 2.25 0 0121 4.5v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75v-1.5z"
                            />
                          </svg>
                        </div>
                      )}
                    </td>
                    <th
                      scope="row"
                      className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white"
                    >
                      <Link
                        href={`/forms/${frm.id}/edit`}
                        className="hover:underline"
                      >
                        {frm.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      {new Date(frm.created_at).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                      {lastResponseAt[frm.id]
                        ? new Date(lastResponseAt[frm.id]).toLocaleDateString(
                            "es-CL",
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap text-gray-900 dark:text-white">
                      {frm.max_responses ? (
                        <div className="grid grid-cols-[25%_75%] items-center gap-2">
                          <p>{count}</p>
                          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-900">
                            <div
                              className="h-3 rounded-full bg-blue-600 dark:bg-blue-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p>{count}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      {frm.max_responses ?? "Sin límite"}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      {frm.price
                        ? `$${Number(frm.price).toLocaleString("es-CL")}`
                        : "Gratis"}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <div
                          className={`mr-2 inline-block h-4 w-4 rounded-full ${STATUS_DOT[frm.status]}`}
                        />
                        {STATUS_LABEL[frm.status]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/forms/${frm.id}/responses`}
                          title="Ver respuestas"
                          className="cursor-pointer text-gray-500 hover:text-blue-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </Link>
                        <Link
                          href={`/forms/${frm.id}/edit`}
                          title="Editar"
                          className="cursor-pointer text-gray-500 hover:text-yellow-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Link>
                        {frm.status === "published" && (
                          <Link
                            href={`/forms/f/${frm.slug}`}
                            target="_blank"
                            title="Ver página pública"
                            className="cursor-pointer text-gray-500 hover:text-green-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                          </Link>
                        )}
                        <form action={duplicateForm.bind(null, frm.id)}>
                          <button
                            type="submit"
                            title="Duplicar formulario"
                            className="cursor-pointer text-gray-500 hover:text-purple-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                              />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {forms.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    Todavía no hay formularios. Crea el primero con el botón de
                    arriba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
