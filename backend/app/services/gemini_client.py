"""Thin wrapper around the Gemini API for structured CV extraction."""
from __future__ import annotations

from google import genai
from google.genai import types

from app.config import get_settings
from app.models.profile import CandidateProfile

_EXTRACTION_PROMPT = """\
You are a precise CV/resume parser. Read the raw text of a candidate's CV \
(extracted from a PDF or Word file, so spacing/line breaks may be imperfect) \
and convert it into the structured JSON schema provided.

Rules:
- Only use information that is actually present in the text. Never invent \
  employers, dates, degrees, or numbers.
- If a field is not present, omit it or leave it empty — do not guess.
- Normalize dates to a human-readable free-form string as written \
  (e.g. "Jan 2022", "2019", "Present"); do not fabricate missing dates.
- Split each work experience's responsibilities/achievements into separate, \
  concise bullet points (rewrite lightly for clarity, but do not add facts \
  that are not implied by the source text).
- Infer a skill's category (Technical, Tool, Language, Soft skill, Other) \
  only when it's reasonably obvious.
- Preserve the candidate's original wording for the professional summary if \
  one exists; if there is no explicit summary section, leave "summary" null \
  rather than writing one yourself.
- Order experience and education as they appear in the source document \
  (usually most recent first).

CV TEXT:
---
{cv_text}
---
"""


class GeminiExtractionError(RuntimeError):
    pass


def extract_candidate_profile(cv_text: str) -> CandidateProfile:
    """Call Gemini with structured output to turn raw CV text into a CandidateProfile."""
    settings = get_settings()
    if not settings.gemini_api_key:
        raise GeminiExtractionError(
            "GEMINI_API_KEY is not configured on the backend."
        )

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = _EXTRACTION_PROMPT.format(cv_text=cv_text)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CandidateProfile,
                temperature=0.1,
            ),
        )
    except Exception as exc:  # noqa: BLE001 - surface as a domain error
        raise GeminiExtractionError(f"Gemini request failed: {exc}") from exc

    if not response.text:
        raise GeminiExtractionError("Gemini returned an empty response.")

    try:
        return CandidateProfile.model_validate_json(response.text)
    except Exception as exc:  # noqa: BLE001
        raise GeminiExtractionError(
            f"Gemini returned data that doesn't match the expected schema: {exc}"
        ) from exc
