"use client";

import { useState, type FormEvent } from "react";
import type { JobSearchRequest } from "@/lib/types";
import { ArrowDot, Button, Icon, inputClass } from "./ui";

export type SearchValues = {
  job_title: string;
  location: string;
  remote_only: boolean;
  target_companies: string;
};

const segment =
  "flex min-w-0 flex-1 flex-col justify-center rounded-full px-5 py-2 transition-colors duration-[var(--dur-fast)] hover:bg-sunken has-[:focus-visible]:bg-sunken has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink";
const bareInput = "w-full min-w-0 bg-transparent text-body text-ink placeholder:text-ink-3 focus:outline-none";
const divider = "hidden h-8 w-px shrink-0 bg-line md:block";

/* Wide white pill search bar that sits in the dark jobs hero. Stacks on mobile. */
export default function JobSearchForm({
  initialValues,
  onSearch,
  loading,
}: {
  initialValues: SearchValues;
  onSearch: (request: JobSearchRequest) => void;
  loading: boolean;
}) {
  const [jobTitle, setJobTitle] = useState(initialValues.job_title);
  const [location, setLocation] = useState(initialValues.location);
  const [remoteOnly, setRemoteOnly] = useState(initialValues.remote_only);
  const [targetCompanies, setTargetCompanies] = useState(initialValues.target_companies);
  const [showCompanies, setShowCompanies] = useState(Boolean(initialValues.target_companies));
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
      target_companies: targetCompanies.trim() || undefined,
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Cari lowongan">
      <div className="tone-light flex flex-col gap-1 rounded-md bg-bg p-2 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)] md:flex-row md:items-center md:rounded-full md:p-1.5">
        <div className={`${segment} ${titleError ? "ring-2 ring-danger" : ""}`}>
          <label htmlFor="job_title" className="text-tag font-bold uppercase text-ink">
            Peran
          </label>
          <input
            id="job_title"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Backend Engineer"
            autoComplete="organization-title"
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? "job_title-error" : undefined}
            className={bareInput}
          />
        </div>
        <span aria-hidden="true" className={divider} />
        <div className={`${segment} ${locationError ? "ring-2 ring-danger" : ""}`}>
          <label htmlFor="location" className="text-tag font-bold uppercase text-ink">
            Lokasi
          </label>
          <input
            id="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Singapura"
            aria-invalid={locationError ? true : undefined}
            aria-describedby={locationError ? "location-error" : undefined}
            className={bareInput}
          />
        </div>
        <span aria-hidden="true" className={divider} />
        <label className="flex min-h-12 shrink-0 cursor-pointer items-center justify-between gap-3 rounded-full px-5 transition-colors hover:bg-sunken has-[:focus-visible]:bg-sunken has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink">
          <span className="text-body text-ink">Remote saja</span>
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
        <Button type="submit" loading={loading} loadingText="Mencari…" className="min-h-12 shrink-0 gap-3 pr-1.5 md:ml-1">
          Cari
          <ArrowDot inverse className="h-9 w-9" />
        </Button>
      </div>

      {(titleError || locationError) && (
        <ul className="mt-3 space-y-1 text-meta font-medium text-danger">
          {titleError && (
            <li id="job_title-error" className="flex items-start gap-1.5">
              <Icon name="alert" className="mt-px h-4 w-4" />
              {titleError}
            </li>
          )}
          {locationError && (
            <li id="location-error" className="flex items-start gap-1.5">
              <Icon name="alert" className="mt-px h-4 w-4" />
              {locationError}
            </li>
          )}
        </ul>
      )}

      {showCompanies && (
        <div className="mt-5 max-w-xl">
          <label htmlFor="target_companies" className="text-meta font-semibold text-ink">
            Perusahaan atau bidang incaran <span className="font-normal text-ink-2">(opsional)</span>
          </label>
          <input
            id="target_companies"
            value={targetCompanies}
            onChange={(e) => setTargetCompanies(e.target.value)}
            placeholder="Stripe, Vercel, fintech"
            aria-describedby="target_companies-help"
            className={`${inputClass} mt-2`}
          />
          <p id="target_companies-help" className="mt-2 text-meta text-ink-2">
            Pisahkan dengan koma.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {!showCompanies && (
          <button
            type="button"
            onClick={() => setShowCompanies(true)}
            className="inline-flex min-h-11 items-center gap-2 text-meta text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="plus" className="h-4 w-4" />
            Perusahaan target
          </button>
        )}
        <p className="text-meta text-ink-2">Kriteria tersimpan otomatis setiap kali kamu mencari.</p>
      </div>
    </form>
  );
}
