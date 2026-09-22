"use client";

import Link from "next/link";
import { useState } from "react";
import AppHeader from "./AppHeader";
import CvUploader from "./CvUploader";
import ProfileReview from "./ProfileReview";
import { createClient } from "@/lib/supabase/client";
import type {
  CandidateProfileRow,
  ProfileExtractionResult,
} from "@/lib/types";

function rowToResult(row: CandidateProfileRow): ProfileExtractionResult {
  return {
    profile: row.profile,
    warnings: row.warnings,
    source_filename: row.source_filename,
    raw_text_length: row.raw_text_length,
  };
}

function DossierScene({ ready }: { ready: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="hairline-grid relative overflow-hidden border border-[rgb(255_253_248_/_0.18)] bg-[var(--night-raised)] p-6 lg:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[var(--copper)]" />
      <div className="absolute bottom-5 left-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(244_240_232_/_0.6)]">
        {ready ? "Profile indexed / ready" : "Candidate record / pending"}
      </div>
      <div className="dossier-stage relative z-10">
        <div className="dossier-stack motion-float">
          <div className="dossier-sheet dossier-sheet--back" />
          <div className="dossier-sheet dossier-sheet--middle" />
          <div className="dossier-sheet dossier-sheet--front">
            <div className="relative z-10 flex h-full flex-col justify-between p-[13%] text-ink">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.19em] text-ink-soft">
                Application desk
              </span>
              <div>
                <span className="block font-display text-3xl leading-[0.9]">Career</span>
                <span className="block font-display text-3xl leading-[0.9]">Dossier</span>
              </div>
            </div>
            <span className="dossier-stamp">{ready ? "READY" : "01 / CV"}</span>
            <span className="dossier-orbit" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  userId,
  userEmail,
  initialProfile,
}: {
  userId: string;
  userEmail: string;
  initialProfile: CandidateProfileRow | null;
}) {
  const [result, setResult] = useState<ProfileExtractionResult | null>(
    initialProfile ? rowToResult(initialProfile) : null
  );
  const [showUploader, setShowUploader] = useState(!initialProfile);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function trySave(extractedResult: ProfileExtractionResult) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("candidate_profiles").upsert(
      {
        user_id: userId,
        source_filename: extractedResult.source_filename,
        profile: extractedResult.profile,
        warnings: extractedResult.warnings,
        raw_text_length: extractedResult.raw_text_length,
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    setSaveError(error ? error.message : null);
  }

  function handleExtracted(newResult: ProfileExtractionResult) {
    setResult(newResult);
    setShowUploader(false);
    void trySave(newResult);
  }

  const isReplacing = Boolean(result && showUploader);

  return (
    <main className="min-h-[100svh] bg-paper">
      <AppHeader active="profile" userEmail={userEmail} />

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <section className="grid gap-8 border-b border-line pb-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-16">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              01 / Candidate dossier
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.93] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
              {showUploader
                ? isReplacing
                  ? "Perbarui fondasi pencarianmu."
                  : "Bangun dossier pencarianmu."
                : "Dossier kamu siap bergerak."}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
              {showUploader
                ? "Unggah CV master untuk menyusun profil yang rapi. Dossier ini menjadi basis saat kamu menilai lowongan."
                : "Profil terstruktur memberi titik awal yang jernih. Pilih lowongan dengan sadar, lalu kamu yang tetap meninjau dan mengirim lamaran."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4 text-xs text-ink-soft">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--copper)]" />
                CV tetap milik kamu
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cobalt)]" />
                Kamu tetap meninjau &amp; mengirim
              </span>
            </div>

            {!showUploader && result && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/jobs"
                  className="inline-flex min-h-12 items-center justify-center bg-[var(--night)] px-5 text-sm font-semibold text-surface transition-transform hover:-translate-y-0.5 hover:bg-[var(--night-raised)] focus-visible:outline-offset-4"
                >
                  Lanjut cari lowongan
                  <span aria-hidden="true" className="ml-4 text-[var(--copper-soft)]">
                    02
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowUploader(true)}
                  className="min-h-12 border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-offset-4"
                >
                  Upload CV versi baru
                </button>
              </div>
            )}
          </div>

          <aside className="hidden lg:col-span-5 lg:block">
            <DossierScene ready={Boolean(result && !showUploader)} />
          </aside>
        </section>

        {showUploader && (
          <section
            aria-labelledby="upload-cv-title"
            className="grid gap-7 py-10 lg:grid-cols-12 lg:py-14"
          >
            <div className="lg:col-span-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                {isReplacing ? "Revision" : "Start here"}
              </p>
              <h2 id="upload-cv-title" className="mt-3 font-display text-3xl leading-none text-ink">
                {isReplacing ? "Versi baru" : "CV master"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                {isReplacing
                  ? "Versi aktif tetap digunakan sampai CV baru selesai diproses."
                  : "PDF, DOCX, atau TXT. Mulai dengan satu dokumen paling lengkap."}
              </p>
            </div>
            <div className="lg:col-span-9">
              <CvUploader onExtracted={handleExtracted} />
            </div>
          </section>
        )}

        <div aria-live="polite" className="sr-only">
          {saving ? "Menyimpan dossier" : ""}
        </div>

        {saving && (
          <div className="flex items-center gap-3 border-y border-line py-4 text-sm text-ink-soft" aria-live="polite">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--cobalt)]" />
            Menyimpan dossier ke akun kamu...
          </div>
        )}

        {saveError && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 border border-accent bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm leading-6 text-ink">
              Dossier sudah terbaca, tetapi belum tersimpan: {saveError}
            </p>
            <button
              type="button"
              onClick={() => result && trySave(result)}
              className="shrink-0 border-b border-ink pb-0.5 text-sm font-semibold text-ink"
            >
              Coba simpan lagi
            </button>
          </div>
        )}

        {result && !showUploader && (
          <section className="py-10 lg:py-14">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Profile ready
                </p>
                <h2 className="mt-2 font-display text-4xl tracking-[-0.035em] text-ink">
                  Candidate brief
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-ink-soft">
                Tinjau bagian bertanda sebelum menggunakan profil ini untuk pencarian.
              </p>
            </div>
            <ProfileReview result={result} />
          </section>
        )}
      </div>
    </main>
  );
}
