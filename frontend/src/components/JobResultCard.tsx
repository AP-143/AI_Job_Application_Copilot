import type { JobListingRow } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK",
  himalayas: "Himalayas",
  adzuna: "Adzuna",
  gemini_general: "Gemini",
  gemini_specific: "Gemini (target)",
};

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

export default function JobResultCard({ job }: { job: JobListingRow }) {
  const href = safeHref(job.source_url);

  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-ink">{job.title}</p>
          <p className="text-sm text-ink-soft">
            {[job.company, job.location].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="whitespace-nowrap border border-line px-2 py-0.5 text-xs text-ink-soft">
          {SOURCE_LABELS[job.source] ?? job.source}
        </span>
      </div>

      {job.salary_text && (
        <p className="mt-2 text-sm text-ink">{job.salary_text}</p>
      )}
      {job.description && (
        <p className="mt-2 text-sm text-ink-soft">{job.description}</p>
      )}

      <div className="mt-3 flex items-center gap-4 text-sm">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            Lihat lowongan
          </a>
        )}
      </div>
    </div>
  );
}
