// Pure date and freshness helpers. No imports, so `node --test` can load this file directly.

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const MAX_LISTING_AGE_DAYS = 30;

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/** Whole days between `value` and `now`, never negative. Null when the date is missing or invalid. */
export function daysAgo(value: string | null | undefined, now: number = Date.now()): number | null {
  const time = toTime(value);
  if (time === null) return null;
  return Math.max(0, Math.floor((now - time) / DAY_MS));
}

/** Posting age for a listing: "Hari ini", "Kemarin", "N hari lalu". */
export function ageLabel(days: number): string {
  if (days === 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  return `${days} hari lalu`;
}

/** Short relative time for "Diperbarui …". */
export function timeAgo(value: string | null | undefined, now: number = Date.now()): string | null {
  const time = toTime(value);
  if (time === null) return null;
  const diff = Math.max(0, now - time);
  if (diff < MINUTE_MS) return "baru saja";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)} menit lalu`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)} jam lalu`;
  const days = Math.floor(diff / DAY_MS);
  return days === 1 ? "kemarin" : `${days} hari lalu`;
}

/** Posted date (or fetch date as fallback) within MAX_LISTING_AGE_DAYS. Undated listings stay visible. */
export function isFresh(
  job: { posted_at?: string | null; fetched_at: string },
  now: number = Date.now()
): boolean {
  const time = toTime(job.posted_at ?? job.fetched_at);
  if (time === null) return true;
  return now - time <= MAX_LISTING_AGE_DAYS * DAY_MS;
}
