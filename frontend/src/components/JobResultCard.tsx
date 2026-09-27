import type { JobListingRow } from "@/lib/types";
import { ageLabel, daysAgo } from "@/lib/format";
import { cleanText } from "@/lib/text";
import { Icon } from "./ui";

export const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK",
  himalayas: "Himalayas",
  adzuna: "Adzuna",
  gemini_general: "Gemini",
  gemini_specific: "Gemini (target)",
};

export function sourceName(raw: string): string {
  const key = Object.keys(SOURCE_LABELS).find((k) => raw.toLowerCase().includes(k));
  return key ? SOURCE_LABELS[key] : raw;
}

function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

const SHELL =
  "group grid gap-x-6 gap-y-1.5 rounded-md px-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center";

/* One row in the jobs panel. The whole row is one link to the original posting. */
export default function JobResultCard({ job }: { job: JobListingRow }) {
  const href = safeHref(job.source_url);
  const postedDays = daysAgo(job.posted_at);
  const fetchedDays = daysAgo(job.fetched_at);
  const title = cleanText(job.title);
  const details = [job.company, job.location, job.salary_text]
    .filter(Boolean)
    .map((value) => cleanText(value as string))
    .join(" · ");
  const age =
    postedDays !== null
      ? ageLabel(postedDays)
      : fetchedDays !== null
        ? `Ditemukan ${ageLabel(fetchedDays).toLowerCase()}`
        : "Tanpa tanggal";
  const isNew = postedDays !== null && postedDays <= 1;

  const body = (
    <>
      <div className="min-w-0">
        <h3 title={title} className="line-clamp-2 break-words font-semibold text-ink sm:line-clamp-1">
          {title}
        </h3>
        {details && (
          <p title={details} className="mt-0.5 truncate text-meta text-ink-2">
            {details}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 text-meta text-ink-2 sm:justify-end">
        {isNew && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ink" />}
        <span suppressHydrationWarning className={isNew ? "text-ink" : undefined}>
          {age}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {sourceName(job.source)}
          {job.remote && " · Remote"}
        </span>
        {href && (
          <Icon
            name="external"
            className="ml-2 hidden h-4 w-4 text-ink-3 transition-colors group-hover:text-ink sm:block"
          />
        )}
      </div>
    </>
  );

  if (!href) return <article className={SHELL}>{body}</article>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${SHELL} transition-colors duration-[var(--dur-fast)] hover:bg-sunken/60`}
    >
      {body}
      <span className="sr-only"> (buka di tab baru)</span>
    </a>
  );
}
