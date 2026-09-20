from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import jobs, profile
from app.config import get_settings

settings = get_settings()

app = FastAPI(title="Job Application Copilot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(jobs.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
