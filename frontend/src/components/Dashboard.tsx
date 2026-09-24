"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AppHeader from "./AppHeader";
import CvUploader from "./CvUploader";
import PageHero from "./PageHero";
import ProfileReview from "./ProfileReview";
import { Alert, ArrowDot, Button, Spinner, StatGrid, Tag, Toast, buttonClass, displayClass } from "./ui";
import { createClient } from "@/lib/supabase/client";
import { displayName, groupWarnings, profileStats, sectionAnchor, sectionForWarning } from "@/lib/profile";
import type { CandidateProfileRow, ProfileExtractionResult } from "@/lib/types";

function rowToResult(row: CandidateProfileRow): ProfileExtractionResult {
  return {
    profile: row.profile,
    warnings: row.warnings,
    source_filename: row.source_filename,
    raw_text_length: row.raw_text_length,
  };
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
  // Bumped by "Batal" while an upload is in flight, so its late result can be told apart from a fresh one.
  const uploadToken = useRef(0);

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

  // Captures the current upload token so a result that arrives after "Batal" (which bumps the
  // token) can be told apart from one that arrived before it, and discarded.
  function makeOnExtracted() {
    const startToken = uploadToken.current;
    return (newResult: ProfileExtractionResult) => {
      if (uploadToken.current !== startToken) return;
      setResult(newResult);
      setShowUploader(false);
      void trySave(newResult);
    };
  }

  const isReplacing = Boolean(result && showUploader);
  const hasProfile = Boolean(result && !showUploader);
  const profile = result?.profile;

  return (
    <main className="min-h-[100svh]">
      <AppHeader active="profile" userEmail={userEmail} />

      {hasProfile && result && profile ? (
        <>
          <PageHero>
            <div className="flex flex-wrap items-center gap-3">
              <Tag>Profil dari CV</Tag>
              <span className="flex min-h-6 min-w-0 items-center gap-2 text-meta text-ink-2" aria-live="polite">
                {saving ? (
                  <>
                    <Spinner className="h-3.5 w-3.5" /> Menyimpan…
                  </>
                ) : (
                  <span className="max-w-[16rem] truncate sm:max-w-[28rem]" title={result.source_filename}>
                    {result.source_filename}
                  </span>
                )}
              </span>
            </div>

            <h1 className={`${displayClass} animate-rise mt-6 max-w-[18ch] break-words`}>
              Profil <strong>{displayName(profile.contact.full_name)}</strong> siap.
            </h1>

            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
              <Link href="/jobs" className={buttonClass("primary", "min-h-12 gap-3 pr-2")}>
                Cari lowongan
                <ArrowDot inverse className="h-8 w-8" />
              </Link>
              <Button variant="arrow" onClick={() => setShowUploader(true)}>
                Ganti CV
              </Button>
            </div>

            <StatGrid className="mt-12 sm:mt-16" items={profileStats(profile)} />

            {result.warnings.length > 0 && (
              <a
                href={`#${sectionAnchor(sectionForWarning(result.warnings[0].field))}`}
                className="group mt-6 inline-flex min-h-11 items-center gap-3 text-body text-ink"
              >
                <span>
                  <strong className="font-bold">{Object.keys(groupWarnings(result.warnings)).length} bagian</strong>{" "}
                  perlu kamu cek
                </span>
                <ArrowDot className="h-7 w-7" />
              </a>
            )}
          </PageHero>

          {saveError && (
            <div className="page pt-10">
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
        <PageHero>
          <Tag>{isReplacing ? "Ganti CV" : "Langkah 1 dari 3"}</Tag>
          <h1 className={`${displayClass} animate-rise mt-6 max-w-[16ch]`}>
            {isReplacing ? (
              <>
                Unggah <strong>CV terbaru</strong>.
              </>
            ) : (
              <>
                Mulai dari <strong>CV kamu</strong>.
              </>
            )}
          </h1>
          <p className="mt-6 max-w-[36rem] text-lead text-ink-2">
            {isReplacing
              ? "Profil sekarang tetap dipakai sampai CV baru selesai dibaca."
              : "Kami baca pengalaman, keahlian, dan proyekmu, lalu menyusunnya jadi profil untuk mencari lowongan."}
          </p>
          <div className="mt-10 max-w-5xl">
            <CvUploader onExtracted={makeOnExtracted()} />
          </div>
          {isReplacing && (
            <div className="mt-8">
              <Button
                variant="arrow"
                onClick={() => {
                  uploadToken.current += 1;
                  setShowUploader(false);
                }}
              >
                Batal, tetap pakai profil sekarang
              </Button>
            </div>
          )}
        </PageHero>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </main>
  );
}
