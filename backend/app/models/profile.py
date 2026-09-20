"""Structured CV / candidate profile schema.

This is the canonical shape produced by the Profile Extractor and reused
later by CV-tailoring, matching, and cover-letter generation.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    full_name: str = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    other_links: list[str] = Field(default_factory=list)


class Skill(BaseModel):
    name: str
    category: Optional[str] = None  # e.g. "Technical", "Tool", "Language", "Soft skill"


class Experience(BaseModel):
    company: str
    title: str
    location: Optional[str] = None
    start_date: Optional[str] = None  # free-form, e.g. "Jan 2022"
    end_date: Optional[str] = None    # None / "Present" if ongoing
    is_current: bool = False
    bullets: list[str] = Field(default_factory=list)
    skills_used: list[str] = Field(default_factory=list)


class Education(BaseModel):
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    location: Optional[str] = None


class Project(BaseModel):
    name: str
    description: Optional[str] = None
    role: Optional[str] = None
    technologies: list[str] = Field(default_factory=list)
    link: Optional[str] = None
    date: Optional[str] = None


class CandidateProfile(BaseModel):
    """Fully structured representation of a candidate's master CV."""

    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: Optional[str] = None
    skills: list[Skill] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)


class ExtractionWarning(BaseModel):
    field: str
    message: str


class ProfileExtractionResult(BaseModel):
    """Response payload for the Profile Extractor endpoint."""

    profile: CandidateProfile
    warnings: list[ExtractionWarning] = Field(default_factory=list)
    source_filename: str
    raw_text_length: int
