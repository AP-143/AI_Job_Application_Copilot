import type { JobListingRow } from "@/lib/types";
import { ArrowDot, Icon, Tag } from "./ui";

export const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK",
  himalayas: "Himalayas",
  adzuna: "Adzuna",
  gemini_general: "Gemini",
  gemini_specific: "Gemini (target)",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

const ENTITY: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
};

// Windows-1252 code points for bytes 0x80-0x9F, used to undo UTF-8 text that was decoded as cp1252.
const CP1252 = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

const MOJIBAKE_RUN = new RegExp(`[\u00c2-\u00f4][\u0080-\u00bf${CP1252}]+`, "g");

function decodeRun(run: string): string {
  const bytes = Array.from(run, (ch) => {
    const code = ch.charCodeAt(0);
    return code <= 0xff ? code : 0x80 + CP1252.indexOf(ch);
  });
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return run;
  }
}

function repairMojibake(value: string): string {
  return value.replace(MOJIBAKE_RUN, decodeRun);
}

// Source feeds sometimes ship HTML entities or double-encoded UTF-8; clean for display only.
export function cleanText(value: string): string {
  return repairMojibake(value).replace(/&(?:amp|lt|gt|quot|nbsp|#39|#x27);/g, (match) => ENTITY[match] ?? match);
}

function daysAgo(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / DAY_MS));
}

function ageLabel(days: number): string {
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  return `${days} hari lalu`;
}

export default function JobResultCard({ job }: { job: JobListingRow }) {
  const href = safeHref(job.source_url);
  const postedDays = daysAgo(job.posted_at);
  const fetchedDays = daysAgo(job.fetched_at);
  const title = cleanText(job.title);
  const description = job.description ? cleanText(job.description).replace(/s+/g, " ").trim() : null;
  const titleId = "job-title-" + job.id;
  const company = job.company ? cleanText(job.company) : null;
  const location = job.location ? cleanText(job.location) : null;
  const source = SOURCE_LABELS[job.source] ?? job.source;
  const age =
    postedDays !== null
      ? ageLabel(postedDays)
      : fetchedDays !== null
        ? `Ditemukan ${ageLabel(fetchedDays).toLowerCase()}`
        : "Tanpa tanggal";

  return (
    <article
      aria-labelledby={titleId}
      className="group relative flex h-full flex-col rounded-xs border border-dk-line bg-white/[0.035] p-5 transition-[background-color,border-color,transform] duration-[var(--dur-base)] ease-[var(--ease)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.07] sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <Tag tone={postedDays !== null && postedDays <= 1 ? "solid" : "dark"}>
          <span suppressHydrationWarning>{age}</span>
        </Tag>
        <span className="text-meta text-dk-ink-3">{source}</span>
      </div>

      <h3 id={titleId} className="mt-5 break-words text-[1.25rem] leading-[1.25] font-semibold tracking-[-0.01em] text-dk-ink">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:rounded-xs after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-dk-ink focus-visible:after:[outline-style:solid]"
          >
            {title}
            <span className="sr-only"> (buka di tab baru)</span>
          </a>
        ) : (
          title
        )}
      </h3>
      {company && <p className="mt-1 break-words text-body font-light text-dk-ink-2">{company}</p>}

      {description && <p className="mt-4 line-clamp-2 text-meta text-dk-ink-3">{description}</p>}

      <ul className="mt-5 space-y-1.5 text-meta text-dk-ink-2">
        {location && (
          <li className="flex items-start gap-2">
            <Icon name="pin" className="mt-px h-4 w-4 text-dk-ink-3" />
            <span className="break-words">{location}</span>
          </li>
        )}
        {job.salary_text && (
          <li className="flex items-start gap-2">
            <Icon name="wallet" className="mt-px h-4 w-4 text-dk-ink-3" />
            <span className="break-words">{cleanText(job.salary_text)}</span>
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div className="flex flex-wrap gap-1.5">{job.remote && <Tag tone="dark">Remote</Tag>}</div>
        {href && (
          <span className="translate-x-[-4px] opacity-60 transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease)] group-hover:translate-x-0 group-hover:opacity-100">
            <ArrowDot light />
          </span>
        )}
      </div>
    </article>
  );
}
