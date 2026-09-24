"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import JobSearchForm, { type SearchValues } from "./JobSearchForm";
import JobResultCard, { sourceName } from "./JobResultCard";
import PageHero from "./PageHero";
import { Alert, ArrowDot, Button, EmptyState, Skeleton, Spinner, Tag, Toast, buttonClass, displayClass } from "./ui";
import { ApiError, searchJobs } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { isFresh, timeAgo } from "@/lib/format";
import type { JobListingRow, JobSearchPreferencesRow, JobSearchRequest } from "@/lib/types";

const EXAMPLES: SearchValues[] = [
  { job_title: "Frontend Engineer", location: "Singapura", remote_only: true, target_companies: "" },
  { job_title: "Data Analyst", location: "Jakarta", remote_only: false, target_companies: "" },
  { job_title: "Product Designer", location: "Indonesia", remote_only: true, target_companies: "" },
];

function exampleLabel(values: SearchValues): string {
  return [values.job_title, values.location, values.remote_only ? "Remote" : null].filter(Boolean).join(" · ");
}

function searchErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status >= 500) return "Server pencarian sedang bermasalah. Tunggu sebentar, lalu cari lagi.";
    return err.message;
  }
  if (err instanceof TypeError) return "Tidak bisa terhubung ke server pencarian. Periksa koneksi, lalu cari lagi.";
  return err instanceof Error ? err.message : "Pencarian belum berhasil. Coba cari lagi.";
}

function CardSkeleton() {
  return (
    <div aria-hidden="true" className="flex h-60 flex-col rounded-xs border border-line p-6">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="mt-6 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-6 h-3.5 w-2/3" />
    </div>
  );
}

function Grid({ listings }: { listings: JobListingRow[] }) {
  return (
    <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((job, index) => (
        <div key={job.id} style={{ "--i": index } as CSSProperties}>
          <JobResultCard job={job} />
        </div>
      ))}
    </div>
  );
}

function Results({
  count,
  loading,
  updated,
  sources,
  children,
}: {
  count: number;
  loading: boolean;
  updated: string | null;
  sources: string[];
  children: ReactNode;
}) {
  return (
    <section aria-labelledby="results-heading" className="page pt-12 pb-24 sm:pt-16">
      <div className="dark-block tone-dark px-4 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="results-heading" className="text-heading font-light text-ink">
              <strong className="tabular font-bold">{count} lowongan</strong>
            </h2>
            <p className="mt-1 flex items-center gap-2 text-meta text-ink-2" aria-live="polite">
              {loading ? (
                <>
                  <Spinner className="h-3.5 w-3.5" /> Mencari di 4 sumber…
                </>
              ) : (
                <span suppressHydrationWarning>
                  {updated ? `Diperbarui ${updated} · ` : ""}30 hari terakhir, terbaru di depan
                </span>
              )}
            </p>
          </div>
          {sources.length > 0 && (
            <ul aria-label="Sumber" className="flex flex-wrap gap-1.5">
              {sources.map((source) => (
                <li key={source}>
                  <Tag tone="outline">{source}</Tag>
                </li>
              ))}
            </ul>
          )}
        </div>
        {children}
      </div>
    </section>
  );
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
  const [lastRequest, setLastRequest] = useState<JobSearchRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [seed, setSeed] = useState<{ key: number; values: SearchValues } | null>(null);

  async function handleSearch(request: JobSearchRequest) {
    setLoading(true);
    setSearchError(null);
    setSourceErrors([]);
    setLastRequest(request);

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
      setSearchError(`Kriteria pencarian belum tersimpan, jadi pencarian dibatalkan. Detail: ${preferenceError.message}`);
      setLoading(false);
      return;
    }

    try {
      const result = await searchJobs(request);
      setSourceErrors(result.source_errors);

      if (result.listings.length === 0) {
        setToast("Pencarian selesai, belum ada lowongan baru.");
        return;
      }

      const rows = result.listings.map((l) => ({
        user_id: userId,
        ...l,
      }));

      const { data, error } = await supabase
        .from("job_listings")
        .upsert(rows, { onConflict: "user_id,source_url" })
        .select();

      if (error) {
        setSearchError(`Lowongan ditemukan, tapi belum tersimpan. Detail: ${error.message}`);
      } else if (data) {
        const known = new Set(listings.map((j) => j.source_url));
        const added = (data as JobListingRow[]).filter((row) => !known.has(row.source_url)).length;
        setListings((prev) => {
          const byUrl = new Map(prev.map((j) => [j.source_url, j]));
          for (const row of data as JobListingRow[]) {
            byUrl.set(row.source_url, row);
          }
          return Array.from(byUrl.values()).sort(
            (a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
          );
        });
        setToast(added > 0 ? `${added} lowongan baru ditemukan.` : "Pencarian selesai, semua hasil sudah ada di daftar.");
      }
    } catch (err) {
      setSearchError(searchErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function applyExample(values: SearchValues) {
    setSeed((prev) => ({ key: (prev?.key ?? 0) + 1, values }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const visibleListings = listings.filter((job) => isFresh(job));
  const count = visibleListings.length;
  const sources = Array.from(new Set(visibleListings.map((job) => sourceName(job.source))));
  const latestFetch = visibleListings.reduce<string | null>(
    (latest, job) => (!latest || job.fetched_at > latest ? job.fetched_at : latest),
    null
  );
  const initialValues: SearchValues = seed?.values ?? {
    job_title: initialPreferences?.job_title ?? "",
    location: initialPreferences?.location ?? "",
    remote_only: initialPreferences?.remote_only ?? false,
    target_companies: initialPreferences?.target_companies ?? "",
  };

  const results = (
    <Results count={count} loading={loading} updated={timeAgo(latestFetch)} sources={sources}>
      {loading && count === 0 ? (
        <div role="status" aria-label="Mencari lowongan" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : count === 0 ? (
        lastRequest ? (
          <EmptyState
            title={
              <>
                Tidak ada lowongan <strong>yang cocok</strong>.
              </>
            }
          >
            Belum ada hasil dari 30 hari terakhir untuk pencarian ini. Coba matikan Remote saja, atau perluas lokasinya.
          </EmptyState>
        ) : (
          <EmptyState
            title={
              <>
                Belum ada <strong>lowongan</strong> di sini.
              </>
            }
            action={
              hasProfile && (
                <ul className="flex flex-wrap justify-center gap-2">
                  {EXAMPLES.map((example) => (
                    <li key={exampleLabel(example)}>
                      <button
                        type="button"
                        onClick={() => applyExample(example)}
                        className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 text-meta text-ink transition-colors hover:border-ink"
                      >
                        {exampleLabel(example)}
                      </button>
                    </li>
                  ))}
                </ul>
              )
            }
          >
            Isi peran dan lokasi di atas, atau mulai dari salah satu contoh ini. Hasilnya tersimpan, jadi kamu bisa kembali kapan saja.
          </EmptyState>
        )
      ) : (
        <div inert={loading} className={`transition-opacity duration-[var(--dur-base)] ${loading ? "opacity-40" : "opacity-100"}`}>
          <Grid listings={visibleListings} />
        </div>
      )}
    </Results>
  );

  if (!hasProfile) {
    return (
      <>
        <PageHero>
          <Tag>Pencarian lowongan</Tag>
          <h1 className={`${displayClass} animate-rise mt-6 max-w-[14ch]`}>
            Unggah <strong>CV</strong> dulu.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lead text-ink-2">Setelah profil jadi, kamu bisa mencari lowongan di sini.</p>
          <Link href="/" className={buttonClass("primary", "mt-9 min-h-12 gap-3 pr-2")}>
            Unggah CV
            <ArrowDot inverse className="h-8 w-8" />
          </Link>
        </PageHero>
        {count > 0 && results}
      </>
    );
  }

  return (
    <div aria-busy={loading}>
      <PageHero>
        <Tag>Pencarian lowongan</Tag>
        <h1 className={`${displayClass} animate-rise mt-6 max-w-[14ch]`}>
          Cari peran <strong>yang cocok</strong>.
        </h1>
        <div className="mt-10 max-w-5xl">
          <JobSearchForm key={seed?.key ?? 0} initialValues={initialValues} onSearch={handleSearch} loading={loading} />
        </div>
        <div aria-live="polite" className="mt-4 max-w-5xl space-y-3 empty:hidden">
          {searchError && (
            <Alert
              title="Pencarian belum berhasil"
              action={
                lastRequest && (
                  <Button variant="secondary" onClick={() => handleSearch(lastRequest)}>
                    Coba lagi
                  </Button>
                )
              }
            >
              {searchError}
            </Alert>
          )}
          {sourceErrors.length > 0 && (
            <Alert tone="info" title="Sebagian sumber tidak merespons">
              {Array.from(new Set(sourceErrors.map(sourceName))).join(", ")} gagal diambil kali ini. Hasil dari sumber lain tetap
              ditampilkan; cari lagi nanti untuk melengkapi.
            </Alert>
          )}
        </div>
      </PageHero>

      {results}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
