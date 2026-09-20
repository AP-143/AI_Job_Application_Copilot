"use client";

import { useState } from "react";
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
  initialPreferences,
  initialListings,
}: {
  userId: string;
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

    await supabase.from("job_search_preferences").upsert(
      {
        user_id: userId,
        job_title: request.job_title,
        location: request.location,
        remote_only: request.remote_only,
        target_companies: request.target_companies ?? null,
      },
      { onConflict: "user_id" }
    );

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
          setSearchError(`Gagal menyimpan hasil: ${error.message}`);
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

  return (
    <div>
      <JobSearchForm
        initialPreferences={initialPreferences}
        onSearch={handleSearch}
        loading={loading}
      />

      {searchError && (
        <p className="mt-4 border-l-2 border-accent pl-3 text-sm text-accent">
          {searchError}
        </p>
      )}

      {sourceErrors.length > 0 && (
        <p className="mt-4 text-sm text-ink-soft">
          Sebagian sumber gagal diambil: {sourceErrors.join(", ")}
        </p>
      )}

      <p className="mt-8 text-xs uppercase tracking-[0.18em] text-ink-soft">
        Hasil ({visibleListings.length})
      </p>

      {visibleListings.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Belum ada hasil. Isi preferensi di atas dan klik &quot;Cari
          Lowongan&quot;.
        </p>
      ) : (
        <div className="mt-2">
          {visibleListings.map((job) => (
            <JobResultCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
