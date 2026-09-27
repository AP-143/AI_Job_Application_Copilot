"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import JobSearchForm, { type SearchValues } from "./JobSearchForm";
import JobResultCard, { sourceName } from "./JobResultCard";
import PageHero from "./PageHero";
import { Alert, Button, EmptyState, Icon, Skeleton, Spinner, Tag, Toast, buttonClass, displayClass, panelClass, panelTitleClass } from "./ui";
import { ApiError, searchJobs } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { byNewest, isFresh, timeAgo } from "@/lib/format";
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

const PAGE_SIZE = 15;

function RowSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center justify-between gap-6 py-4">
      <div className="flex-1">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="mt-2 h-3 w-2/5" />
      </div>
      <Skeleton className="hidden h-3.5 w-28 sm:block" />
    </div>
  );
}

function List({ listings }: { listings: JobListingRow[] }) {
  return (
    <ul className="stagger -mx-3 divide-y divide-line">
      {listings.map((job, index) => (
        <li key={job.id} style={{ "--i": index } as CSSProperties}>
          <JobResultCard job={job} />
        </li>
      ))}
    </ul>
  );
}

function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  const nav = buttonClass("secondary", "min-h-10 gap-2 text-sm disabled:opacity-30");
  return (
    <nav aria-label="Halaman hasil" className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-6">
      <button type="button" className={nav} disabled={page === 0} onClick={() => onChange(page - 1)}>
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        <span className="hidden sm:inline">Sebelumnya</span>
        <span className="sr-only sm:hidden">Sebelumnya</span>
      </button>
      <p className="tabular text-sm text-ink-2" aria-live="polite">
        Halaman <span className="text-ink">{page + 1}</span> dari {pages}
      </p>
      <button type="button" className={nav} disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>
        <span className="hidden sm:inline">Berikutnya</span>
        <span className="sr-only sm:hidden">Berikutnya</span>
        <Icon name="arrow" className="h-4 w-4" />
      </button>
    </nav>
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
  sources: Array<{ name: string; count: number }>;
  children: ReactNode;
}) {
  const status = loading ? (
    <span className="flex items-center gap-2">
      <Spinner className="h-3.5 w-3.5" /> Mencari di 4 sumber…
    </span>
  ) : (
    <span suppressHydrationWarning>{updated ? `Diperbarui ${updated}` : "30 hari terakhir"}</span>
  );

  return (
    <section
      id="results"
      aria-labelledby="results-heading"
      className={`page grid scroll-mt-6 gap-5 pt-10 pb-24 lg:items-start ${
        count > 0 ? "lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]" : ""
      }`}
    >
      <div className={panelClass}>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 id="results-heading" className={panelTitleClass}>
            Lowongan
          </h2>
          <p className="text-meta text-ink-2 lg:hidden" aria-live="polite">
            {status}
          </p>
        </div>
        {children}
      </div>

      {count > 0 && (
        <div className="flex min-w-0 flex-col gap-5">
          <div className={panelClass}>
            <h2 className={`${panelTitleClass} mb-5`}>Ringkasan</h2>
            <p className="tabular font-serif text-6xl leading-none text-ink">{count}</p>
            <p className="mt-2 text-meta text-ink-2">lowongan dari 30 hari terakhir, terbaru di depan</p>
            <p className="mt-4 border-t border-line pt-4 text-meta text-ink-2" aria-live="polite">
              {status}
            </p>
          </div>
          <div className={panelClass}>
            <h2 className={`${panelTitleClass} mb-5`}>Sumber</h2>
            <ul className="divide-y divide-line text-meta">
              {sources.map((source) => (
                <li key={source.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="text-ink">{source.name}</span>
                  <span className="tabular text-ink-2">{source.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
  const [page, setPage] = useState(0);

  function goToPage(next: number) {
    setPage(next);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("results")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  async function handleSearch(request: JobSearchRequest) {
    setLoading(true);
    setPage(0);
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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  const visibleListings = listings.filter((job) => isFresh(job)).sort(byNewest);
  const count = visibleListings.length;
  const pages = Math.ceil(count / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pages - 1, 0));
  const pageListings = visibleListings.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const sourceCounts = new Map<string, number>();
  for (const job of visibleListings) {
    const name = sourceName(job.source);
    sourceCounts.set(name, (sourceCounts.get(name) ?? 0) + 1);
  }
  const sources = Array.from(sourceCounts, ([name, total]) => ({ name, count: total })).sort((a, b) => b.count - a.count);
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
        <div role="status" aria-label="Mencari lowongan" className="divide-y divide-line">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <RowSkeleton key={i} />
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
          <List key={currentPage} listings={pageListings} />
          <Pager page={currentPage} pages={pages} onChange={goToPage} />
        </div>
      )}
    </Results>
  );

  if (!hasProfile) {
    return (
      <>
        <PageHero>
          <Tag>Pencarian lowongan</Tag>
          <h1 className={`${displayClass} animate-fade-rise mt-6 max-w-[14ch]`}>
            Unggah <strong>CV</strong> dulu.
          </h1>
          <p className="animate-fade-rise-delay mt-6 max-w-[34rem] text-lg text-ink-2">
            Setelah profil jadi, kamu bisa mencari lowongan di sini.
          </p>
          <Link href="/" className={buttonClass("glass", "animate-fade-rise-delay-2 mt-10 px-14 py-5 text-base")}>
            Unggah CV
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
        <h1 className={`${displayClass} animate-fade-rise mt-6 max-w-[16ch]`}>
          Cari peran <strong>yang cocok.</strong>
        </h1>
        <div className="animate-fade-rise-delay mt-10 w-full max-w-5xl">
          <JobSearchForm key={seed?.key ?? 0} initialValues={initialValues} onSearch={handleSearch} loading={loading} />
        </div>
        <div aria-live="polite" className="mt-4 w-full max-w-5xl space-y-3 empty:hidden">
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
