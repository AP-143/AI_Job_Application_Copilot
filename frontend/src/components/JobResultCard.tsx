import type { JobListingRow } from "@/lib/types";
import { ageLabel, daysAgo } from "@/lib/format";
import { cleanText } from "@/lib/text";
import { ArrowDot, Tag } from "./ui";

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

const SHELL = "group flex h-full flex-col rounded-xs border border-line bg-white/[0.04] p-5 sm:p-6";

/* Glass card in the dark results block. The whole card is one link to the original posting. */
export default function JobResultCard({ job }: { job: JobListingRow }) {
  const href = safeHref(job.source_url);
  const postedDays = daysAgo(job.posted_at);
  const fetchedDays = daysAgo(job.fetched_at);
  const title = cleanText(job.title);
  const company = job.company ? cleanText(job.company) : null;
  const meta = [job.location, job.salary_text].filter(Boolean).map((value) => cleanText(value as string));
  const age =
    postedDays !== null
      ? ageLabel(postedDays)
      : fetchedDays !== null
        ? `Ditemukan ${ageLabel(fetchedDays).toLowerCase()}`
        : "Tanpa tanggal";

  const body = (
    <>
      <div>
        <Tag tone={postedDays !== null && postedDays <= 1 ? "light" : "outline"}>
          <span suppressHydrationWarning>{age}</span>
        </Tag>
      </div>
      <h3 className="mt-5 break-words text-body leading-[1.35] font-bold text-ink">{title}</h3>
      {company && <p className="mt-1 break-words text-body font-light text-ink-2">{company}</p>}
      {meta.length > 0 && <p className="mt-4 break-words text-meta text-ink-2">{meta.join(" · ")}</p>}
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div className="flex flex-wrap gap-1.5">
          {job.remote && <Tag>Remote</Tag>}
          <Tag tone="outline">{sourceName(job.source)}</Tag>
        </div>
        {href && <ArrowDot className="h-8 w-8 opacity-70 transition-opacity group-hover:opacity-100" />}
      </div>
    </>
  );

  if (!href) return <article className={SHELL}>{body}</article>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${SHELL} transition-[border-color,background-color] duration-[var(--dur-base)] ease-[var(--ease)] hover:border-line-strong hover:bg-white/[0.07]`}
    >
      {body}
      <span className="sr-only"> (buka di tab baru)</span>
    </a>
  );
}
