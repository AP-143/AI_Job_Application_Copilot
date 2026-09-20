"use client";

import { useState } from "react";
import CvUploader from "@/components/CvUploader";
import ProfileReview from "@/components/ProfileReview";
import type { ProfileExtractionResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<ProfileExtractionResult | null>(null);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Job Application Copilot
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">
          Mulai dari CV kamu.
        </h1>
        <p className="mt-3 max-w-md text-ink-soft">
          Upload CV master, kami baca dan susun jadi data terstruktur —
          dasar untuk mencari lowongan yang cocok dan menyiapkan dokumen
          lamaran. Kamu yang tetap menekan tombol submit.
        </p>

        <div className="mt-10">
          <CvUploader onExtracted={setResult} />
        </div>

        {result && (
          <div className="mt-16">
            <ProfileReview result={result} />
          </div>
        )}
      </div>
    </main>
  );
}
