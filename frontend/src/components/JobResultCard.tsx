import type { JobListingRow } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK",
  himalayas: "Himalayas",
  adzuna: "Adzuna",
  gemini_general: "Gemini",
  gemini_specific: "Gemini (target)",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? url
      : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return (
    String(date.getUTCDate()).padStart(2, "0") +
    " " +
    MONTHS[date.getUTCMonth()] +
    " " +
    date.getUTCFullYear()
  );
}

function conciseDescription(description: string): string {
  const copy = description.replace(/\s+/g, " ").trim();
  return copy.length > 260 ? copy.slice(0, 257).trimEnd() + "…" : copy;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-5 text-ink">{value}</dd>
    </div>
  );
}

export default function JobResultCard({ job }: { job: JobListingRow }) {
  const href = safeHref(job.source_url);
  const postedAt = formatDate(job.posted_at);
  const fetchedAt = formatDate(job.fetched_at);
  const description = job.description ? conciseDescription(job.description) : null;
  const titleId = "job-title-" + job.id;
  const companyAndLocation = [job.company, job.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      aria-labelledby={titleId}
      className="border border-line bg-surface px-5 py-5 shadow-[3px_3px_0_var(--paper-deep)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[5px_5px_0_var(--paper-deep)] focus-within:border-[var(--cobalt)] sm:px-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            {SOURCE_LABELS[job.source] ?? job.source}
          </p>
          <h3
            id={titleId}
            className="mt-2 font-display text-2xl leading-tight tracking-[-0.02em] text-ink"
          >
            {job.title}
          </h3>
          {companyAndLocation && (
            <p className="mt-1 text-sm text-ink-soft">{companyAndLocation}</p>
          )}
        </div>

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={"Buka lowongan " + job.title + " di tab baru"}
            className="inline-flex min-h-10 w-fit shrink-0 items-center gap-2 border border-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cobalt)]"
          >
            Buka lowongan <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      {description && (
        <p className="mt-4 max-w-4xl text-sm leading-6 text-ink-soft">
          {description}
        </p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-5">
        <Fact label="Sumber" value={SOURCE_LABELS[job.source] ?? job.source} />
        <Fact label="Mode kerja" value={job.remote ? "Remote" : "Tidak remote"} />
        <Fact label="Kompensasi" value={job.salary_text ?? "Tidak dicantumkan"} />
        <Fact label="Diposting" value={postedAt ?? "Tidak dicantumkan"} />
        <Fact label="Diambil" value={fetchedAt ?? "Tidak diketahui"} />
      </dl>
    </article>
  );
}
