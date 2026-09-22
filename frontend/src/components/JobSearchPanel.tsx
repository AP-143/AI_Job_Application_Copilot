"use client";

import { useState } from "react";
import Link from "next/link";
import JobSearchForm from "./JobSearchForm";
import JobResultCard from "./JobResultCard";
import { searchJobs } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type {
  JobListingRow,
  JobSearchPreferencesRow,
  JobSearchRequest,
} from "@/lib/types";

const MAX_LISTING_AGE_DAYS = 30;

function isFresh(job: JobListingRow): boolean {
  const dateStr = job.posted_at ?? job.fetched_at;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return true;
  const ageMs = Date.now() - date.getTime();
  return ageMs <= MAX_LISTING_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export default function JobSearchPanel({
  userId,
  hasProfile,
  initialPreferences,
  initialListings,
}: {
  userId: string;
  hasProfile: boolean;
  initialPreferences: JobSearchPreferencesRow | null;
  initialListings: JobListingRow[];
}) {
  const [listings, setListings] = useState<JobListingRow[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sourceErrors, setSourceErrors] = useState<string[]>([]);

  async function handleSearch(request: JobSearchRequest) {
    setLoading(true);
    setSearchError(null);
    setSourceErrors([]);

    const supabase = createClient();

    const { error: preferenceError } = await supabase
      .from("job_search_preferences")
      .upsert(
        {
          user_id: userId,
          job_title: request.job_title,
          location: request.location,
          remote_only: request.remote_only,
          target_companies: request.target_companies ?? null,
        },
        { onConflict: "user_id" }
      );

    if (preferenceError) {
      setSearchError(
        `Gagal menyimpan brief pencarian: ${preferenceError.message}`
      );
      setLoading(false);
      return;
    }

    try {
      const result = await searchJobs(request);
      setSourceErrors(result.source_errors);

      if (result.listings.length > 0) {
        const rows = result.listings.map((l) => ({
          user_id: userId,
          ...l,
        }));

        const { data, error } = await supabase
          .from("job_listings")
          .upsert(rows, { onConflict: "user_id,source_url" })
          .select();

        if (error) {
          setSearchError("Gagal menyimpan hasil: " + error.message);
        } else if (data) {
          setListings((prev) => {
            const byUrl = new Map(prev.map((j) => [j.source_url, j]));
            for (const row of data as JobListingRow[]) {
              byUrl.set(row.source_url, row);
            }
            return Array.from(byUrl.values()).sort(
              (a, b) =>
                new Date(b.fetched_at).getTime() -
                new Date(a.fetched_at).getTime()
            );
          });
        }
      }
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Gagal mencari lowongan."
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleListings = listings.filter(isFresh);

  if (!hasProfile) {
    return (
      <section aria-label="Prasyarat pencarian lowongan">
        <aside
          aria-labelledby="profile-prerequisite-title"
          className="grid gap-5 border border-line bg-surface p-5 shadow-[4px_4px_0_var(--paper-deep)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-7"
        >
          <p className="font-display text-5xl leading-none text-accent">01</p>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              Start with context
            </p>
            <h2
              id="profile-prerequisite-title"
              className="mt-2 font-display text-3xl text-ink"
            >
              Buat dossier kandidat dulu.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Unggah CV master untuk membuat dasar pencarian yang lebih terarah.
              Setelah itu, kamu dapat menyusun brief lowongan.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center border border-ink bg-[var(--night)] px-4 text-xs font-semibold uppercase tracking-[0.13em] text-surface transition-colors hover:bg-[var(--night-raised)]"
          >
            Tambah CV
          </Link>
        </aside>

        {visibleListings.length > 0 && (
          <div className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Existing market ledger
                </p>
                <h2 className="mt-1 font-display text-2xl tracking-[-0.02em] text-ink">
                  Lowongan tersimpan
                </h2>
              </div>
              <p className="text-sm text-ink-soft">
                {visibleListings.length} hasil masih berlaku
              </p>
            </div>
            <div className="mt-5 grid gap-4">
              {visibleListings.map((job) => (
                <JobResultCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section aria-label="Workspace pencarian lowongan" aria-busy={loading}>
      <div className="border border-line bg-surface shadow-[4px_4px_0_var(--paper-deep)]">
        <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Search brief
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-[-0.02em] text-ink">
              Tetapkan mandat pencarian.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-5 text-ink-soft sm:text-right">
            Hasil disimpan di desk ini dan ditampilkan dalam jendela 30 hari.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <JobSearchForm
            initialPreferences={initialPreferences}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </div>

      <div className="mt-6" aria-live="polite" aria-atomic="true">
        {searchError && (
          <div
            role="alert"
            className="border-l-4 border-accent bg-accent-soft px-4 py-3 text-sm leading-5 text-ink"
          >
            <span className="font-semibold">Pencarian perlu diperiksa. </span>
            {searchError}
          </div>
        )}

        {sourceErrors.length > 0 && (
          <p className="border-l-2 border-[var(--cobalt)] bg-[var(--cobalt-soft)] px-4 py-3 text-sm leading-5 text-[var(--cobalt)]">
            Beberapa sumber tidak dapat diambil: {sourceErrors.join(", ")}.
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Market ledger
          </p>
          <h2 className="mt-1 font-display text-2xl tracking-[-0.02em] text-ink">
            Lowongan yang sedang berlaku
          </h2>
        </div>
        <p className="text-right text-sm text-ink-soft">
          <span className="font-display text-3xl leading-none text-ink">
            {visibleListings.length}
          </span>{" "}
          hasil dalam 30 hari
        </p>
      </div>

      {visibleListings.length === 0 ? (
        <div className="border-b border-line py-10 sm:grid sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
          <p className="font-display text-5xl leading-none text-[var(--line-strong)]">00</p>
          <div className="mt-3 sm:mt-0">
            <h3 className="text-base font-semibold text-ink">
              Belum ada catatan pasar.
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-ink-soft">
              Lengkapi brief di atas untuk menjalankan pencarian pertama. Hasil
              terbaru akan tercatat di sini.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {visibleListings.map((job) => (
            <JobResultCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
