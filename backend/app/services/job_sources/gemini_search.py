"""Gemini-grounded web search for job postings not covered by the
structured job board APIs. Prompts Gemini (with Google Search grounding)
to return a JSON array in the response text and parses it manually —
grounding and schema-constrained JSON output can't be combined in one
call, so this asks for JSON via the prompt instead.
"""
from __future__ import annotations

import json
import re

from google import genai
from google.genai import types

from app.models.job import JobListing

_JSON_ARRAY_RE = re.compile(r"\[.*\]", re.DOTALL)

_FIELDS_SPEC = (
    'each an object with exactly these fields: "title", "company", '
    '"location", "remote" (boolean), "salary_text" (string or null), '
    '"source_url" (the direct URL to the job posting or application page), '
    '"posted_at" (YYYY-MM-DD or null), "description" (a short 1-2 sentence '
    "summary)."
)

_GENERAL_PROMPT = """\
Search the web for current, real job postings matching:
- Job title / role: {job_title}
- Location: {location}
- Remote only: {remote_only}

Return ONLY a JSON array (no prose, no markdown fences) of up to 10 job \
postings, {fields_spec} Only include postings that appear genuinely \
current and real (from company career pages, job boards, or reputable \
listings) — do not invent postings.
"""

_SPECIFIC_PROMPT = """\
Search the web for current, real job openings at these specific companies \
or in these categories: {target_companies}
Prefer roles matching: {job_title} in {location}.

Return ONLY a JSON array (no prose, no markdown fences) of up to 10 job \
postings, {fields_spec} Only include postings that appear genuinely \
current and real — do not invent postings.
"""


def _run_grounded_search(prompt: str, api_key: str, model: str) -> list[JobListing]:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.2,
        ),
    )

    text = response.text or ""
    match = _JSON_ARRAY_RE.search(text)
    if not match:
        raise ValueError("Gemini grounded search did not return a JSON array.")

    raw_items = json.loads(match.group(0))
    results: list[JobListing] = []
    for item in raw_items:
        if not isinstance(item, dict) or not item.get("source_url"):
            continue
        try:
            results.append(
                JobListing(
                    source="gemini",
                    source_url=item["source_url"],
                    title=item.get("title", ""),
                    company=item.get("company"),
                    location=item.get("location"),
                    remote=bool(item.get("remote", False)),
                    salary_text=item.get("salary_text"),
                    posted_at=item.get("posted_at"),
                    description=item.get("description"),
                )
            )
        except ValueError:
            continue  # untrusted URL scheme or other invalid field — skip this item
    return results


def search_general(
    job_title: str, location: str, remote_only: bool, api_key: str, model: str
) -> list[JobListing]:
    prompt = _GENERAL_PROMPT.format(
        job_title=job_title,
        location=location,
        remote_only=remote_only,
        fields_spec=_FIELDS_SPEC,
    )
    results = _run_grounded_search(prompt, api_key, model)
    for r in results:
        r.source = "gemini_general"
    return results


def search_specific(
    job_title: str,
    location: str,
    target_companies: str,
    api_key: str,
    model: str,
) -> list[JobListing]:
    prompt = _SPECIFIC_PROMPT.format(
        target_companies=target_companies,
        job_title=job_title,
        location=location,
        fields_spec=_FIELDS_SPEC,
    )
    results = _run_grounded_search(prompt, api_key, model)
    for r in results:
        r.source = "gemini_specific"
    return results
