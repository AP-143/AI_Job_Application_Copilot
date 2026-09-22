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
  const [formError, setFormError] = useState<string | null>(null);

  const titleMissing = !jobTitle.trim();
  const locationMissing = !location.trim();

  function clearFormError() {
    if (formError) setFormError(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    if (titleMissing || locationMissing) {
      setFormError("Isi peran yang dituju dan basis lokasi terlebih dahulu.");
      const missingField = e.currentTarget.querySelector<HTMLElement>(
        titleMissing ? "#job_title" : "#location"
      );
      missingField?.focus();
      return;
    }

    setFormError(null);
    onSearch({
      job_title: jobTitle,
      location,
      remote_only: remoteOnly,
      target_companies: targetCompanies || undefined,
    });
  }

  const inputClassName =
    "mt-2 min-h-12 w-full border border-line bg-surface px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-soft transition-colors focus-visible:border-[var(--cobalt)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)]";

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label
            htmlFor="job_title"
            className="flex items-baseline justify-between gap-3 text-sm font-semibold text-ink"
          >
            <span>Peran yang dituju</span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              Wajib
            </span>
          </label>
          <input
            id="job_title"
            required
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              clearFormError();
            }}
            placeholder="Backend Engineer"
            aria-invalid={Boolean(formError && titleMissing)}
            aria-describedby={
              formError && titleMissing ? "search-form-error" : undefined
            }
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="flex items-baseline justify-between gap-3 text-sm font-semibold text-ink"
          >
            <span>Basis lokasi</span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              Wajib
            </span>
          </label>
          <input
            id="location"
            required
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              clearFormError();
            }}
            placeholder="Singapore"
            aria-invalid={Boolean(formError && locationMissing)}
            aria-describedby={
              formError && locationMissing ? "search-form-error" : undefined
            }
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-5 border-y border-line py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--night)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)]"
          />
          <span>
            <span className="block font-medium">Hanya lowongan remote</span>
            <span className="mt-0.5 block text-xs leading-5 text-ink-soft">
              Prioritaskan peran yang dapat dijalankan dari lokasi kamu.
            </span>
          </span>
        </label>

        <div>
          <label
            htmlFor="target_companies"
            className="text-sm font-semibold text-ink"
          >
            Organisasi atau kategori target
          </label>
          <p id="target-companies-hint" className="mt-0.5 text-xs text-ink-soft">
            Opsional. Pisahkan beberapa nama dengan koma.
          </p>
          <textarea
            id="target_companies"
            value={targetCompanies}
            onChange={(e) => setTargetCompanies(e.target.value)}
            placeholder="Stripe, Vercel, fintech remote-first"
            rows={2}
            aria-describedby="target-companies-hint"
            className={inputClassName + " resize-y"}
          />
        </div>
      </div>

      {formError && (
        <p
          id="search-form-error"
          role="alert"
          className="border-l-2 border-accent bg-accent-soft px-3 py-2 text-sm text-ink"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs leading-5 text-ink-soft">
          Preferensi tersimpan saat pencarian dijalankan.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 items-center gap-3 border border-ink bg-[var(--night)] px-4 py-3 text-sm font-semibold text-surface transition-colors hover:bg-[var(--night-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cobalt)] disabled:cursor-not-allowed disabled:border-[var(--line-strong)] disabled:bg-[var(--line-strong)]"
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-[var(--copper-soft)]" />
          {loading ? "Memindai pasar…" : "Jalankan pencarian"}
        </button>
      </div>
    </form>
  );
}
