"""Fetch jobs from RemoteOK's public API (no auth) and filter by keyword.

RemoteOK has no server-side keyword search — this pulls the full feed and
filters locally against position/description/tags.
"""
from __future__ import annotations

import re

import httpx

from app.models.job import JobListing

REMOTEOK_URL = "https://remoteok.com/api"
_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return _TAG_RE.sub(" ", text or "").strip()


def fetch_remoteok(job_title: str) -> list[JobListing]:
    response = httpx.get(
        REMOTEOK_URL,
        headers={"User-Agent": "job-application-copilot (contact: none)"},
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()

    keywords = [w.lower() for w in job_title.split() if w]
    results: list[JobListing] = []

    for job in data:
        if not isinstance(job, dict) or not job.get("id"):
            continue  # first item is RemoteOK's API terms notice, not a job

        haystack = " ".join(
            [
                job.get("position", ""),
                job.get("description", ""),
                " ".join(job.get("tags", []) or []),
            ]
        ).lower()

        if keywords and not any(k in haystack for k in keywords):
            continue

        salary_min = job.get("salary_min")
        salary_max = job.get("salary_max")
        salary_text = (
            f"${salary_min:,} - ${salary_max:,}" if salary_min and salary_max else None
        )

        results.append(
            JobListing(
                source="remoteok",
                source_url=job.get("apply_url") or job.get("url", ""),
                title=job.get("position", ""),
                company=job.get("company"),
                location=job.get("location") or "Remote",
                remote=True,
                salary_text=salary_text,
                posted_at=(job.get("date") or "")[:10] or None,
                description=_strip_html(job.get("description", ""))[:500],
            )
        )

    return results
