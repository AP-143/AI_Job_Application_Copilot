"use client";

import { useState, type FormEvent } from "react";
import type { JobSearchPreferencesRow, JobSearchRequest } from "@/lib/types";
import { ArrowDot, Button, Field, inputClass } from "./ui";

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
  const [remoteOnly, setRemoteOnly] = useState(initialPreferences?.remote_only ?? false);
  const [targetCompanies, setTargetCompanies] = useState(initialPreferences?.target_companies ?? "");
  const [attempted, setAttempted] = useState(false);

  const titleError = attempted && !jobTitle.trim() ? "Isi peran yang kamu cari, misalnya Backend Engineer." : null;
  const locationError = attempted && !location.trim() ? "Isi negara atau kota, misalnya Singapura." : null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    if (!jobTitle.trim() || !location.trim()) {
      setAttempted(true);
      e.currentTarget.querySelector<HTMLElement>(!jobTitle.trim() ? "#job_title" : "#location")?.focus();
      return;
    }

    setAttempted(false);
    onSearch({
      job_title: jobTitle,
      location,
      remote_only: remoteOnly,
      target_companies: targetCompanies || undefined,
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Cari lowongan">
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="job_title" label="Peran" error={titleError}>
          <input
            id="job_title"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Backend Engineer"
            autoComplete="organization-title"
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? "job_title-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field id="location" label="Lokasi" error={locationError}>
          <input
            id="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Singapura"
            aria-invalid={locationError ? true : undefined}
            aria-describedby={locationError ? "location-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field
          id="target_companies"
          label="Perusahaan atau bidang incaran"
          aside={<span className="text-meta text-ink-3">Opsional</span>}
        >
          <input
            id="target_companies"
            value={targetCompanies}
            onChange={(e) => setTargetCompanies(e.target.value)}
            placeholder="Stripe, Vercel, fintech"
            aria-describedby="target_companies-help"
            className={inputClass}
          />
          <p id="target_companies-help" className="mt-2 text-meta text-ink-3">
            Pisahkan dengan koma.
          </p>
        </Field>

        <div className="md:pt-[1.625rem]">
          <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-sm border border-line-strong bg-surface px-4 transition-colors hover:border-ink has-[:focus-visible]:border-ink has-[:focus-visible]:shadow-[0_0_0_4px_rgb(10_10_10/0.08)]">
            <span className="text-body text-ink">Hanya lowongan remote</span>
            <input
              type="checkbox"
              role="switch"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-7 w-12 shrink-0 rounded-full bg-sunken transition-colors duration-[var(--dur-base)] ease-[var(--ease)] peer-checked:bg-ink after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgb(0_0_0/0.25)] after:transition-transform after:duration-[var(--dur-base)] after:ease-[var(--ease-out)] after:content-[''] peer-checked:after:translate-x-5"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-meta text-ink-3">Kriteria ini tersimpan otomatis setiap kali kamu mencari.</p>
        <Button type="submit" loading={loading} loadingText="Mencari lowongan…" className="min-h-12 gap-3 pr-2 sm:min-w-52">
          Cari lowongan
          <ArrowDot light className="h-8 w-8" />
        </Button>
      </div>
    </form>
  );
}
