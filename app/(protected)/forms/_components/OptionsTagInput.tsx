"use client";

import { useState, type KeyboardEvent } from "react";
import { HiX } from "react-icons/hi";

interface OptionsTagInputProps {
  id?: string;
  options: string[];
  onChange: (options: string[]) => void;
}

export default function OptionsTagInput({
  id,
  options,
  onChange,
}: OptionsTagInputProps) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const value = draft.trim();
    setDraft("");
    if (!value || options.includes(value)) return;
    onChange([...options, value]);
  };

  const removeOption = (value: string) => {
    onChange(options.filter((o) => o !== value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && options.length > 0) {
      onChange(options.slice(0, -1));
    }
  };

  return (
    <div className="focus-within:border-primary-500 flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700">
      {options.map((opt) => (
        <span
          key={opt}
          className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 flex items-center gap-1 rounded-full px-3 py-1 text-sm"
        >
          {opt}
          <button
            type="button"
            onClick={() => removeOption(opt)}
            className="text-primary-500 hover:text-primary-900 dark:hover:text-white"
          >
            <HiX className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={
          options.length === 0
            ? "Escribe una opción y presiona Enter"
            : "Agregar opción..."
        }
        className="min-w-[140px] flex-1 border-none bg-transparent p-1 text-sm text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none dark:text-white"
      />
    </div>
  );
}
