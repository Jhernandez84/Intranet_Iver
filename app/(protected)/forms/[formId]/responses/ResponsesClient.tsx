"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, ModalHeader, ModalBody, Checkbox, Label } from "flowbite-react";
import { HiCog, HiPlus, HiDownload } from "react-icons/hi";
import Swal from "sweetalert2";
import ResponsesTable, {
  type ColumnConfig,
} from "../../_components/ResponsesTable";
import FormRenderer from "../../_components/FormRenderer";
import { addManualResponse } from "../../actions";
import type { FieldDefinition } from "../../../../lib/forms/types";

interface RawResponse {
  id: string;
  answers: Record<string, unknown>;
  submitted_at: string;
  attended_at: string | null;
}

type FlatRow = {
  id: string;
  submitted_at: string;
  attended_at: string | null;
} & Record<string, unknown>;

interface ResponsesClientProps {
  formId: string;
  formName: string;
  fields: FieldDefinition[];
  responses: RawResponse[];
}

export default function ResponsesClient({
  formId,
  formName,
  fields,
  responses,
}: ResponsesClientProps) {
  const router = useRouter();
  const storageKey = `forms-responses-columns-${formId}`;

  const [visibleFieldIds, setVisibleFieldIds] = useState<Set<string>>(
    new Set(fields.map((f) => f.id)),
  );
  const [showConfig, setShowConfig] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setVisibleFieldIds(new Set(JSON.parse(saved)));
    } catch {
      // localStorage puede fallar (modo privado, etc.) — se ignora, queda todo visible.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const toggleColumn = (fieldId: string) => {
    setVisibleFieldIds((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // ignorar si no hay localStorage disponible
      }
      return next;
    });
  };

  const rows: FlatRow[] = useMemo(
    () =>
      responses.map((r) => ({
        id: r.id,
        submitted_at: new Date(r.submitted_at).toLocaleString("es-CL"),
        attended_at: r.attended_at,
        ...r.answers,
      })),
    [responses],
  );

  const columns: ColumnConfig<FlatRow>[] = useMemo(
    () => [
      { key: "submitted_at", label: "Enviado", sortable: true },
      ...fields
        .filter((f) => visibleFieldIds.has(f.id))
        .map((f) => ({
          key: f.id as keyof FlatRow,
          label: f.label,
          filterable: f.type === "select" || f.type === "radio",
        })),
    ],
    [fields, visibleFieldIds],
  );

  const handleManualSubmit = async (answers: Record<string, unknown>) => {
    await addManualResponse(formId, answers);
    setShowAddModal(false);
    router.refresh();
  };

  const handleExport = async () => {
    const XLSX = await import("xlsx");
    const exportRows = rows.map((row) => {
      const flat: Record<string, unknown> = { Enviado: row.submitted_at };
      fields.forEach((f) => {
        flat[f.label] = row[f.id] ?? "";
      });
      return flat;
    });
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Respuestas");
    XLSX.writeFile(wb, `${formName}-respuestas.xlsx`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Respuestas:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {responses.length}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button color="light" size="sm" onClick={handleExport}>
            <HiDownload className="mr-1.5 h-4 w-4" /> Exportar a Excel
          </Button>
          <div className="relative">
            <Button
              color="light"
              size="sm"
              onClick={() => setShowConfig((v) => !v)}
            >
              <HiCog className="mr-1.5 h-4 w-4" /> Columnas
            </Button>
            {showConfig && (
              <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                <p className="mb-2 text-xs font-semibold text-gray-400 uppercase">
                  Columnas visibles
                </p>
                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                  {fields.map((f) => (
                    <div key={f.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`col-${f.id}`}
                        checked={visibleFieldIds.has(f.id)}
                        onChange={() => toggleColumn(f.id)}
                      />
                      <Label htmlFor={`col-${f.id}`} className="text-sm font-normal">
                        {f.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <HiPlus className="mr-1.5 h-4 w-4" /> Agregar respuesta
          </Button>
        </div>
      </div>

      <ResponsesTable
        data={rows}
        columns={columns}
        emptyMessage="Todavía no hay respuestas para este formulario."
      />

      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} size="lg">
        <ModalHeader>Agregar respuesta manual</ModalHeader>
        <ModalBody>
          <FormRenderer
            fields={fields}
            mode="public"
            simple
            submitLabel="Guardar"
            onSubmit={async (answers) => {
              try {
                await handleManualSubmit(answers);
              } catch (err) {
                Swal.fire({
                  icon: "error",
                  title: "No se pudo guardar",
                  text: err instanceof Error ? err.message : undefined,
                });
                throw err;
              }
            }}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}
