"use client";

import { useState, type FormEvent } from "react";
import type { JobSearchPreferencesRow, JobSearchRequest } from "@/lib/types";

export default function JobSearchForm({
  initialPreferences,
  onSearch,
  loading,
}: {
  initialPreferences: JobSearchPreferencesRow | null;
  onSearch: (request: JobSearchRequest) => void;
  loading: boolean;
}) {
  const [jobTitle, setJobTitle] = useState(initialPreferences?.job_title ?? "");
  const [location, setLocation] = useState(initialPreferences?.location ?? "");
  const [remoteOnly, setRemoteOnly] = useState(
    initialPreferences?.remote_only ?? false
  );
  const [targetCompanies, setTargetCompanies] = useState(
    initialPreferences?.target_companies ?? ""
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch({
      job_title: jobTitle,
      location,
      remote_only: remoteOnly,
      target_companies: targetCompanies || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="job_title" className="text-sm text-ink-soft">
            Judul pekerjaan
          </label>
          <input
            id="job_title"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Backend Engineer"
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-ink outline-none focus:border-ink-soft"
          />
        </div>
        <div>
          <label htmlFor="location" className="text-sm text-ink-soft">
            Lokasi / negara
          </label>
          <input
            id="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Singapore"
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-ink outline-none focus:border-ink-soft"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={remoteOnly}
          onChange={(e) => setRemoteOnly(e.target.checked)}
        />
        Remote only
      </label>

      <div>
        <label htmlFor="target_companies" className="text-sm text-ink-soft">
          Perusahaan/kategori target (opsional, pisahkan koma)
        </label>
        <textarea
          id="target_companies"
          value={targetCompanies}
          onChange={(e) => setTargetCompanies(e.target.value)}
          placeholder="Stripe, Vercel, fintech remote-first"
          rows={2}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-ink outline-none focus:border-ink-soft"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Mencari…" : "Cari Lowongan"}
      </button>
    </form>
  );
}
