"""Fetch jobs from Himalayas' public search API (no auth)."""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional

import httpx

from app.models.job import JobListing

HIMALAYAS_SEARCH_URL = "https://himalayas.app/jobs/api/search"
_MAX_PAGES = 3
_PAGE_SIZE = 20
_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return _TAG_RE.sub(" ", text or "").strip()


def _epoch_to_date(epoch: Optional[int]) -> Optional[str]:
    if not epoch:
        return None
    return datetime.fromtimestamp(epoch, tz=timezone.utc).strftime("%Y-%m-%d")


def _format_salary(job: dict) -> Optional[str]:
    lo, hi, currency = job.get("minSalary"), job.get("maxSalary"), job.get("currency")
    if not lo or not hi:
        return None
    return f"{currency or ''} {lo:,} - {hi:,}".strip()


def fetch_himalayas(job_title: str, location: str) -> list[JobListing]:
    results: list[JobListing] = []
    cursor: Optional[str] = None

    for _ in range(_MAX_PAGES):
        params: dict[str, str] = {"keyword": job_title, "limit": str(_PAGE_SIZE)}
        if location:
            params["country"] = location
        if cursor:
            params["cursor"] = cursor

        response = httpx.get(HIMALAYAS_SEARCH_URL, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        for job in data.get("jobs", []):
            results.append(
                JobListing(
                    source="himalayas",
                    source_url=job.get("applicationLink") or job.get("guid", ""),
                    title=job.get("title", ""),
                    company=job.get("companyName"),
                    location=", ".join(job.get("locationRestrictions") or [])
                    or "Remote",
                    remote=True,
                    salary_text=_format_salary(job),
                    posted_at=_epoch_to_date(job.get("pubDate")),
                    description=_strip_html(job.get("excerpt", ""))[:500],
                )
            )

        cursor = data.get("nextCursor")
        if not cursor:
            break

    return results
