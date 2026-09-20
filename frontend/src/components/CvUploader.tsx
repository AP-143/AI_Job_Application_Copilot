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
      if (!ACCEPTED.some((ext) => lower.endsWith(ext))) {
        setError("Format tidak didukung. Gunakan PDF, DOCX, atau TXT.");
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
            : "Gagal memproses CV. Coba lagi sebentar lagi."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onExtracted]
  );

  return (
    <div>
      <label
        htmlFor="cv-upload"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-3 border px-8 py-16 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-soft"
            : "border-line hover:border-ink-soft"
        }`}
      >
        <input
          ref={inputRef}
          id="cv-upload"
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <span className="font-display text-xl text-ink">
          {isLoading ? "Membaca CV kamu…" : "Taruh CV di sini"}
        </span>
        <span className="text-sm text-ink-soft">
          {isLoading
            ? fileName
            : "atau klik untuk pilih file — PDF, DOCX, atau TXT"}
        </span>
      </label>

      {error && (
        <p className="mt-4 border-l-2 border-accent pl-3 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
