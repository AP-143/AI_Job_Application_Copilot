"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, extractProfile } from "@/lib/api";
import type { ProfileExtractionResult } from "@/lib/types";
import { Alert, Icon, Spinner, Tag } from "./ui";

const ACCEPTED = [".pdf", ".docx", ".txt"];

interface CvUploaderProps {
  onExtracted: (result: ProfileExtractionResult) => void;
}

function uploadErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 413) return "File terlalu besar untuk diproses. Kompres PDF-nya atau simpan ulang sebagai DOCX.";
    if (err.status === 415 || err.status === 422)
      return `CV tidak bisa dibaca (${err.message}). Pastikan file bukan hasil scan gambar, lalu coba lagi.`;
    if (err.status >= 500) return "Server sedang bermasalah saat membaca CV. Tunggu sebentar, lalu unggah lagi.";
    return err.message;
  }
  if (err instanceof TypeError)
    return "Tidak bisa terhubung ke server pembaca CV. Periksa koneksi, lalu unggah lagi.";
  return "CV belum bisa diproses. Coba unggah lagi.";
}

/* Upload zone that sits inside the dark page hero. Colours come from the section tone. */
export default function CvUploader({ onExtracted }: CvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const dragDepth = useRef(0);

  useEffect(() => {
    if (!isLoading) return;
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  const handleFile = useCallback(
    async (file: File) => {
      const lower = file.name.toLowerCase();
      if (!ACCEPTED.some((extension) => lower.endsWith(extension))) {
        setError(`"${file.name}" bukan PDF, DOCX, atau TXT. Simpan ulang CV dalam salah satu format itu.`);
        return;
      }

      setError(null);
      setFileName(file.name);
      setElapsed(0);
      setIsLoading(true);

      try {
        const result = await extractProfile(file);
        onExtracted(result);
      } catch (err) {
        setError(uploadErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [onExtracted]
  );

  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        className="grid min-h-72 place-items-center rounded-sm border border-line px-6 py-14 text-center sm:min-h-80"
      >
        <div className="w-full max-w-md">
          <Spinner className="mx-auto h-6 w-6 text-ink" />
          <p className="mt-6 font-serif text-heading font-normal text-ink">
            Membaca <strong className="font-normal text-ink-2">CV kamu</strong>…
          </p>
          <p className="mt-2 truncate text-meta text-ink-2" title={fileName ?? undefined}>
            {fileName} · <span className="tabular">{elapsed} dtk</span>
          </p>
          <p className="mt-6 text-meta text-ink-2">Biarkan halaman ini tetap terbuka sampai profil selesai disusun.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="cv-upload"
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`group grid min-h-72 cursor-pointer place-items-center rounded-sm border px-6 py-14 text-center transition-[transform,border-color,background-color] duration-[var(--dur-slow)] ease-[var(--ease)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink sm:min-h-80 ${
          isDragging ? "scale-[1.01] border-ink bg-sunken" : "border-line-strong hover:border-ink"
        }`}
      >
        <input
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

        <span className="flex flex-col items-center">
          <span
            aria-hidden="true"
            className={`grid h-14 w-14 place-items-center rounded-full border border-line-strong text-ink transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] ${
              isDragging ? "-translate-y-1.5" : "group-hover:-translate-y-1"
            }`}
          >
            <Icon name={isDragging ? "upload" : "file"} className="h-6 w-6" />
          </span>
          <span className="mt-6 block font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.05] font-normal tracking-[-0.02em] text-ink">
            {isDragging ? (
              <>
                Lepaskan untuk <strong className="font-normal text-ink-2">mengunggah</strong>.
              </>
            ) : (
              <>
                Tarik CV ke sini, atau{" "}
                <strong className="font-normal text-ink-2 underline decoration-line-strong underline-offset-[6px]">pilih file</strong>.
              </>
            )}
          </span>
          <span id="upload-support" className="mt-6 flex gap-1.5">
            {["PDF", "DOCX", "TXT"].map((ext) => (
              <Tag key={ext} tone="outline">
                {ext}
              </Tag>
            ))}
          </span>
        </span>
      </label>

      {error && (
        <div className="mt-4">
          <Alert title="CV belum terbaca">{error}</Alert>
        </div>
      )}
    </div>
  );
}
