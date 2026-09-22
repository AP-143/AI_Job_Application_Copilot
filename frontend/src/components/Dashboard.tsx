"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import AppHeader from "./AppHeader";
import CvUploader from "./CvUploader";
import ProfileReview, { displayName } from "./ProfileReview";
import { Alert, ArrowDot, Button, Spinner, Toast, buttonClass } from "./ui";
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

function Headline({ lines }: { lines: ReactNode[] }) {
  return (
    <h1 className="mx-auto max-w-[20ch] text-[clamp(2.25rem,5.2vw,4.25rem)] leading-[1.07] font-light tracking-[-0.03em] text-ink [&_strong]:font-bold">
      {lines.map((line, index) => (
        <span key={index} className="reveal-line" style={{ "--i": index } as CSSProperties}>
          <span>{line}</span>
        </span>
      ))}
    </h1>
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
  const [toast, setToast] = useState<string | null>(null);

  async function trySave(extractedResult: ProfileExtractionResult) {
    setSaving(true);
    setSaveError(null);
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
    if (!error) setToast("Profil tersimpan ke akunmu.");
  }

  function handleExtracted(newResult: ProfileExtractionResult) {
    setResult(newResult);
    setShowUploader(false);
    void trySave(newResult);
  }

  const isReplacing = Boolean(result && showUploader);
  const hasProfile = Boolean(result && !showUploader);
  const profile = result?.profile;
  const name = profile ? displayName(profile.contact.full_name) : "";

  return (
    <main className="min-h-[100svh]">
      <AppHeader active="profile" userEmail={userEmail} />

      {hasProfile && result && profile ? (
        <>
          <section className="wash">
            <div className="page flex flex-col items-center pt-14 pb-16 text-center sm:pt-24 sm:pb-24">
              <div className="animate-rise mb-8 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-line p-1.5">
                {[
                  { n: profile.experience.length, l: "pengalaman" },
                  { n: profile.skills.length, l: "keahlian" },
                  { n: profile.projects.length, l: "proyek" },
                ].map((s) => (
                  <span key={s.l} className="inline-flex min-h-7 items-center gap-1 rounded-full bg-sunken px-3 text-tag font-bold uppercase text-ink">
                    <span className="tabular">{s.n}</span> {s.l}
                  </span>
                ))}
                <span className="flex h-7 items-center gap-2 px-3 text-meta text-ink-2" aria-live="polite">
                  {saving ? (
                    <>
                      <Spinner className="h-3.5 w-3.5" /> Menyimpan…
                    </>
                  ) : (
                    <span className="max-w-48 truncate" title={result.source_filename}>
                      {result.source_filename}
                    </span>
                  )}
                </span>
              </div>

              <Headline
                lines={[
                  <>Profil</>,
                  <strong key="n" className="break-words">{name}</strong>,
                  <>siap mencari kerja.</>,
                ]}
              />

              <p className="animate-rise mx-auto mt-6 max-w-[36rem] text-lead font-light text-ink-2" style={{ animationDelay: "340ms" }}>
                Cek bagian di bawah dulu. Kalau ada yang keliru, unggah versi CV yang lebih lengkap.
              </p>

              <div className="animate-rise mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-8" style={{ animationDelay: "420ms" }}>
                <Link href="/jobs" className={buttonClass("primary", "min-h-12 gap-3 pr-2")}>
                  Cari lowongan
                  <ArrowDot light className="h-8 w-8" />
                </Link>
                <Button variant="arrow" onClick={() => setShowUploader(true)}>
                  Ganti CV
                </Button>
              </div>
            </div>
          </section>

          {saveError && (
            <div className="page pb-10">
              <Alert
                title="Profil sudah terbaca, tapi belum tersimpan"
                action={
                  <Button variant="secondary" loading={saving} onClick={() => result && trySave(result)}>
                    Simpan lagi
                  </Button>
                }
              >
                Kalau halaman ditutup sekarang, profil ini hilang. Detail: {saveError}
              </Alert>
            </div>
          )}

          <ProfileReview result={result} />
        </>
      ) : (
        <section className="wash">
          <div className="page pt-14 pb-20 text-center sm:pt-24">
            <p className="animate-rise mb-8 inline-flex min-h-7 items-center rounded-full bg-sunken px-3 text-tag font-bold uppercase text-ink">
              {isReplacing ? "Ganti CV" : "Langkah 1 dari 3"}
            </p>
            <Headline
              lines={
                isReplacing
                  ? [<>Unggah versi</>, <strong key="b">CV terbaru.</strong>]
                  : [<>Mulai dari</>, <strong key="b">CV kamu.</strong>]
              }
            />
            <p className="animate-rise mx-auto mt-6 max-w-[36rem] text-lead font-light text-ink-2" style={{ animationDelay: "300ms" }}>
              {isReplacing
                ? "Profil sekarang tetap dipakai sampai CV baru selesai dibaca."
                : "Kami baca pengalaman, keahlian, dan proyekmu, lalu menyusunnya jadi profil untuk mencari lowongan."}
            </p>
            <div className="animate-rise mx-auto mt-12 max-w-5xl text-left" style={{ animationDelay: "380ms" }}>
              <CvUploader onExtracted={handleExtracted} />
            </div>
            {isReplacing && (
              <div className="mt-8">
                <Button variant="arrow" onClick={() => setShowUploader(false)}>
                  Batal, tetap pakai profil sekarang
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </main>
  );
}
