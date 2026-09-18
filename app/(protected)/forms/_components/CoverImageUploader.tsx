"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { createClient } from "../../../lib/supabase/client";

interface CoverImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function CoverImageUploader({
  value,
  onChange,
}: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("form-covers")
        .upload(path, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("form-covers").getPublicUrl(path);

      onChange(publicUrl);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo subir la imagen",
        text: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Portada"
          className="h-32 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
        />
      )}
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          className="text-sm text-gray-500 dark:text-gray-400"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-red-600 hover:underline"
          >
            Quitar
          </button>
        )}
      </div>
      {uploading && (
        <p className="text-xs text-gray-400">Subiendo imagen...</p>
      )}
    </div>
  );
}
