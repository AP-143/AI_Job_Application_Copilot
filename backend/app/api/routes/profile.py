from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import get_settings
from app.graphs.profile_extractor import run_profile_extraction
from app.models.profile import ProfileExtractionResult

router = APIRouter(prefix="/api/profile", tags=["profile"])

_ALLOWED_SUFFIXES = (".pdf", ".docx", ".txt")


@router.post("/extract", response_model=ProfileExtractionResult)
async def extract_profile(file: UploadFile = File(...)) -> ProfileExtractionResult:
    settings = get_settings()

    if not file.filename or not file.filename.lower().endswith(_ALLOWED_SUFFIXES):
        raise HTTPException(status_code=400, detail="Please upload a PDF, DOCX, or TXT file.")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise HTTPException(
            status_code=400,
            detail=f"File is too large ({size_mb:.1f} MB). Max is {settings.max_upload_mb} MB.",
        )

    result = run_profile_extraction(file.filename, content)

    if result.get("error"):
        raise HTTPException(status_code=422, detail=result["error"])

    return ProfileExtractionResult(
        profile=result["profile"],
        warnings=result.get("warnings", []),
        source_filename=file.filename,
        raw_text_length=len(result.get("cv_text", "")),
    )
