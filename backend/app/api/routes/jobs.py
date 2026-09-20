from __future__ import annotations

from fastapi import APIRouter

from app.graphs.job_search import run_job_search
from app.models.job import JobSearchRequest, JobSearchResponse

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/search", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest) -> JobSearchResponse:
    result = run_job_search(
        request.job_title,
        request.location,
        request.remote_only,
        request.target_companies,
    )
    return JobSearchResponse(
        listings=result.get("listings", []),
        source_errors=result.get("source_errors", []),
    )
