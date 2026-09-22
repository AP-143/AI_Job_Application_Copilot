"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, extractProfile } from "@/lib/api";
import type { ProfileExtractionResult } from "@/lib/types";

const ACCEPTED = [".pdf", ".docx", ".txt"];

interface CvUploaderProps {
  onExtracted: (result: ProfileExtractionResult) => void;
}

export default function CvUploader({ onExtracted }: CvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const lower = file.name.toLowerCase();
      if (!ACCEPTED.some((extension) => lower.endsWith(extension))) {
        setError("Format belum didukung. Gunakan PDF, DOCX, atau TXT.");
        return;
      }

      setError(null);
      setFileName(file.name);
      setIsLoading(true);

      try {
        const result = await extractProfile(file);
        onExtracted(result);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "CV belum dapat diproses. Coba lagi sebentar lagi."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onExtracted]
  );

  return (
    <div aria-busy={isLoading}>
      <label
        htmlFor="cv-upload"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`group relative flex min-h-72 cursor-pointer flex-col justify-between overflow-hidden border p-6 transition-colors focus-within:ring-2 focus-within:ring-[var(--cobalt)] focus-within:ring-offset-4 sm:min-h-80 sm:p-8 ${
          isDragging
            ? "border-[var(--copper)] bg-accent-soft"
            : "border-line bg-surface hover:border-ink"
        }`}
      >
        <input
          ref={inputRef}
          id="cv-upload"
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          aria-describedby="upload-support"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />

        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-10 place-items-center border border-ink bg-paper text-ink transition-transform group-hover:-translate-y-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path d="M6 2.75h7.2L18 7.55v13.7H6z" />
              <path d="M13 2.75v5h5" />
              <path d="M9 13h6M9 16h6" />
            </svg>
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {isLoading ? "Reading document" : "CV / Master copy"}
          </span>
        </div>

        <div className="max-w-lg">
          <span className="block font-display text-3xl leading-none tracking-[-0.03em] text-ink sm:text-4xl">
            {isLoading ? "Membaca dossier kamu..." : "Taruh CV di sini."}
          </span>
          <span className="mt-3 block text-sm leading-6 text-ink-soft">
            {isLoading
              ? fileName
              : "Tarik dokumen ke area ini, atau klik untuk memilih dari perangkat kamu."}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-ink-soft">
          <span id="upload-support">PDF, DOCX, atau TXT</span>
          <span className="font-medium text-ink">Pilih dokumen</span>
        </div>
      </label>

      <p className="mt-3 text-xs leading-5 text-ink-soft">
        Dokumen dipakai untuk menyusun profilmu. Tinjau hasilnya sebelum mencari lowongan.
      </p>

      {error && (
        <p role="alert" className="mt-4 border-l-2 border-accent bg-accent-soft px-3 py-2 text-sm text-ink">
          {error}
        </p>
      )}
    </div>
  );
}
