"use client";

import { useState } from "react";
import CvUploader from "./CvUploader";
import ProfileReview from "./ProfileReview";
import LogoutButton from "./LogoutButton";
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

  async function trySave(r: ProfileExtractionResult) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("candidate_profiles").upsert(
      {
        user_id: userId,
        source_filename: r.source_filename,
        profile: r.profile,
        warnings: r.warnings,
        raw_text_length: r.raw_text_length,
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

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            Job Application Copilot
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-soft">
            <a href="/jobs" className="underline underline-offset-4 hover:text-ink">
              Cari Lowongan
            </a>
            <span>{userEmail}</span>
            <LogoutButton />
          </div>
        </div>

        {showUploader ? (
          <>
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink">
              Mulai dari CV kamu.
            </h1>
            <p className="mt-3 max-w-md text-ink-soft">
              Upload CV master, kami baca dan susun jadi data terstruktur —
              dasar untuk mencari lowongan yang cocok dan menyiapkan dokumen
              lamaran. Kamu yang tetap menekan tombol submit.
            </p>
            <div className="mt-10">
              <CvUploader onExtracted={handleExtracted} />
            </div>
          </>
        ) : (
          <div className="mt-10">
            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Upload CV baru
            </button>
          </div>
        )}

        {saving && <p className="mt-6 text-sm text-ink-soft">Menyimpan…</p>}

        {saveError && (
          <div className="mt-6 flex items-center justify-between gap-4 border-l-2 border-accent bg-accent-soft px-4 py-3">
            <p className="text-sm text-accent">
              Gagal menyimpan ke akun kamu: {saveError}
            </p>
            <button
              type="button"
              onClick={() => result && trySave(result)}
              className="whitespace-nowrap text-sm font-medium text-accent underline underline-offset-4"
            >
              Coba lagi
            </button>
          </div>
        )}

        {result && (
          <div className="mt-16">
            <ProfileReview result={result} />
          </div>
        )}
      </div>
    </main>
  );
}
