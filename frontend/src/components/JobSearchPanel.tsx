"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import JobSearchForm from "./JobSearchForm";
import JobResultCard, { SOURCE_LABELS } from "./JobResultCard";
import { Alert, ArrowDot, Button, EmptyState, Panel, Skeleton, Toast, buttonClass } from "./ui";
import { ApiError, searchJobs } from "@/lib/api";
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

function sourceName(raw: string): string {
  const key = Object.keys(SOURCE_LABELS).find((k) => raw.toLowerCase().includes(k));
  return key ? SOURCE_LABELS[key] : raw;
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
    <div aria-hidden="true" className="flex h-64 flex-col rounded-xs border border-dk-line p-6">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mt-6 h-6 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-6 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-2/3" />
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

function Results({ children, loading, count }: { children: ReactNode; loading: boolean; count: number }) {
  return (
    <section aria-labelledby="results-heading" className="page">
      <div className="dark-block px-4 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="inline-flex min-h-7 items-center rounded-full bg-white/10 px-3 text-tag font-bold uppercase text-dk-ink">
            <span className="tabular">{loading && count === 0 ? "…" : count}</span>&nbsp;lowongan
          </p>
          <h2 id="results-heading" className="mt-5 text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] font-light tracking-[-0.025em] text-dk-ink">
            Dari <strong className="font-bold">30 hari terakhir</strong>, yang terbaru di depan.
          </h2>
          <div className={`mx-auto mt-6 h-0.5 w-40 overflow-hidden rounded-full ${loading ? "bg-white/15" : "bg-transparent"}`}>
            {loading && <div className="h-full w-1/3 animate-[progress_1.3s_ease-in-out_infinite] rounded-full bg-dk-ink" />}
          </div>
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

  const visibleListings = listings.filter(isFresh);
  const count = visibleListings.length;

  if (!hasProfile) {
    return (
      <div className="pb-24">
        <div className="page">
          <Panel float className="mx-auto max-w-3xl">
            <EmptyState
              title={<>Unggah <strong>CV</strong> dulu.</>}
              action={
                <Link href="/" className={buttonClass("primary", "min-h-12 gap-3 pr-2")}>
                  Unggah CV
                  <ArrowDot light className="h-8 w-8" />
                </Link>
              }
            >
              Pencarian memakai profil dari CV kamu sebagai dasar. Setelah profil jadi, kamu bisa langsung mencari lowongan di sini.
            </EmptyState>
          </Panel>
        </div>
        {count > 0 && (
          <div className="mt-16">
            <Results loading={loading} count={count}>
              <Grid listings={visibleListings} />
            </Results>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24" aria-busy={loading}>
      <div className="page">
        <div className="mx-auto max-w-4xl">
          <Panel float className="p-5 sm:p-8">
            <JobSearchForm initialPreferences={initialPreferences} onSearch={handleSearch} loading={loading} />
          </Panel>

          <div aria-live="polite" className="mt-4 space-y-3 empty:hidden">
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
        </div>
      </div>

      <div className="mt-16 lg:mt-20">
        <Results loading={loading} count={count}>
          {loading && count === 0 ? (
            <div role="status" aria-label="Mencari lowongan" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : count === 0 ? (
            <EmptyState dark title={<>Belum ada <strong>lowongan</strong> di sini.</>}>
              Isi peran dan lokasi di atas, lalu tekan Cari lowongan. Hasilnya tersimpan di halaman ini, jadi kamu bisa kembali kapan saja.
            </EmptyState>
          ) : (
            <div inert={loading} className={`transition-opacity duration-[var(--dur-base)] ${loading ? "opacity-40" : "opacity-100"}`}>
              <Grid listings={visibleListings} />
            </div>
          )}
        </Results>
      </div>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
