"""Fetch jobs from Adzuna's official API (requires app_id/app_key).

Only queries countries Adzuna actually covers — resolve_country_code
returns None for anything not in the map, and the caller (the LangGraph
node in job_search.py) treats that as "skip this source", not an error.
"""
from __future__ import annotations

from typing import Optional

import httpx

from app.models.job import JobListing

ADZUNA_SEARCH_URL = "https://api.adzuna.com/v1/api/jobs/{country}/search/1"

_SUPPORTED_COUNTRIES = {
    "singapore": "sg",
    "united kingdom": "gb",
    "uk": "gb",
    "germany": "de",
    "netherlands": "nl",
    "australia": "au",
    "canada": "ca",
    "united states": "us",
    "usa": "us",
    "new zealand": "nz",
    "france": "fr",
    "italy": "it",
    "poland": "pl",
    "south africa": "za",
    "india": "in",
    "brazil": "br",
    "mexico": "mx",
    "austria": "at",
}


def resolve_country_code(location: str) -> Optional[str]:
    return _SUPPORTED_COUNTRIES.get(location.strip().lower())


def fetch_adzuna(
    job_title: str, location: str, app_id: str, app_key: str
) -> list[JobListing]:
    country = resolve_country_code(location)
    if not country or not app_id or not app_key:
        return []

    response = httpx.get(
        ADZUNA_SEARCH_URL.format(country=country),
        params={
            "app_id": app_id,
            "app_key": app_key,
            "what": job_title,
            "results_per_page": 25,
            "content-type": "application/json",
        },
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()

    results: list[JobListing] = []
    for job in data.get("results", []):
        salary_min = job.get("salary_min")
        salary_max = job.get("salary_max")
        salary_text = (
            f"{salary_min:,.0f} - {salary_max:,.0f}"
            if salary_min and salary_max
            else None
        )

        results.append(
            JobListing(
                source="adzuna",
                source_url=job.get("redirect_url", ""),
                title=job.get("title", ""),
                company=(job.get("company") or {}).get("display_name"),
                location=(job.get("location") or {}).get("display_name"),
                remote=False,
                salary_text=salary_text,
                posted_at=(job.get("created") or "")[:10] or None,
                description=(job.get("description") or "")[:500],
            )
        )

    return results
