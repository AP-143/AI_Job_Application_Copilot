"""Job listing schema shared by all search sources and the search endpoint."""
from __future__ import annotations

from typing import Optional
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator


class JobListing(BaseModel):
    source: str
    source_url: str
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    remote: bool = False
    salary_text: Optional[str] = None
    posted_at: Optional[str] = None  # YYYY-MM-DD
    description: Optional[str] = None

    @field_validator("source_url")
    @classmethod
    def _require_http_scheme(cls, value: str) -> str:
        # Sources include Gemini-grounded web search, which reflects
        # whatever a third-party page returned — never trust its scheme
        # (e.g. javascript:) before it ends up in an <a href> on the client.
        if urlparse(value).scheme not in ("http", "https"):
            raise ValueError(f"source_url must be http(s), got: {value!r}")
        return value


class JobSearchRequest(BaseModel):
    job_title: str
    location: str
    remote_only: bool = False
    target_companies: Optional[str] = None


class JobSearchResponse(BaseModel):
    listings: list[JobListing] = Field(default_factory=list)
    source_errors: list[str] = Field(default_factory=list)
