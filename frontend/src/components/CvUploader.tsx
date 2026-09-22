"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ApiError, extractProfile } from "@/lib/api";
import type { ProfileExtractionResult } from "@/lib/types";
import { Alert, Icon, Skeleton } from "./ui";

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

const BLOBS = [
  { c: "#6f8577", s: "70%", x: "-15%", y: "-30%", d: "18s" },
  { c: "#41566a", s: "60%", x: "55%", y: "10%", d: "24s" },
  { c: "#8a9a8c", s: "45%", x: "20%", y: "55%", d: "16s" },
];

function Backdrop() {
  return (
    <>
      {BLOBS.map((b, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="blob"
          style={{ background: b.c, width: b.s, aspectRatio: "1", left: b.x, top: b.y, "--drift": b.d } as CSSProperties}
        />
      ))}
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-hidden="true" className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-8">
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[16, 20, 12, 24, 14, 18, 22, 10].map((w, i) => (
            <Skeleton key={i} className="h-6 rounded-full" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

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
      <div aria-busy="true">
        <div role="status" className="dark-hero grid min-h-80 place-items-center rounded-sm px-6 py-14 text-center sm:min-h-[26rem]">
          <Backdrop />
          <div className="w-full max-w-md">
            <p className="text-heading font-light text-dk-ink">
              Membaca <strong className="font-bold">CV kamu</strong>
            </p>
            <p className="mt-2 truncate text-meta text-dk-ink-2" title={fileName ?? undefined}>
              {fileName} · <span className="tabular">{elapsed} dtk</span>
            </p>
            <div className="mx-auto mt-6 h-0.5 w-48 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-1/3 animate-[progress_1.3s_ease-in-out_infinite] rounded-full bg-dk-ink" />
            </div>
            <p className="mt-6 text-meta text-dk-ink-2">
              Kami sedang menyusun pengalaman, keahlian, dan proyek dari dokumen ini. Biarkan halaman ini tetap terbuka.
            </p>
          </div>
        </div>
        <ProfileSkeleton />
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
        className={`dark-hero group grid min-h-80 cursor-pointer place-items-center rounded-sm px-6 py-14 text-center transition-[transform,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease)] focus-within:shadow-[0_0_0_3px_#fff,0_0_0_5px_var(--ink)] sm:min-h-[26rem] ${
          isDragging ? "scale-[1.015] shadow-[0_0_0_3px_#fff,0_0_0_5px_var(--ink)]" : "hover:scale-[1.005]"
        }`}
      >
        <Backdrop />
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
            className={`grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-white/10 text-dk-ink backdrop-blur-md transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] ${
              isDragging ? "-translate-y-2 scale-110" : "group-hover:-translate-y-1"
            }`}
          >
            <Icon name={isDragging ? "upload" : "file"} className="h-6 w-6" />
          </span>
          <span className="mt-6 block text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] font-light tracking-[-0.025em] text-dk-ink">
            {isDragging ? (
              <>
                Lepaskan untuk <strong className="font-bold">mengunggah</strong>.
              </>
            ) : (
              <>
                Taruh <strong className="font-bold">CV</strong> di sini.
              </>
            )}
          </span>
          <span className="mt-3 block text-body text-dk-ink-2">
            {isDragging ? "Kami langsung mulai membacanya." : "Atau klik untuk memilih file dari perangkat kamu."}
          </span>
          <span id="upload-support" className="mt-8 inline-flex gap-1.5 rounded-full border border-white/20 p-1">
            {["PDF", "DOCX", "TXT"].map((ext) => (
              <span key={ext} className="inline-flex min-h-6 items-center rounded-full bg-white/12 px-2.5 text-tag font-bold text-dk-ink">
                {ext}
              </span>
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
