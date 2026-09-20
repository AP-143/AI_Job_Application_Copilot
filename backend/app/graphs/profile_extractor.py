"""LangGraph pipeline: raw CV file -> structured CandidateProfile.

Kept as an explicit graph (rather than a plain function call) so later
pipelines (job search, matching, tailoring) can compose with it or follow
the same pattern.
"""
from __future__ import annotations

from typing import Optional, TypedDict

from langgraph.graph import END, StateGraph

from app.models.profile import CandidateProfile, ExtractionWarning
from app.services import file_parser, gemini_client


class ProfileExtractionState(TypedDict, total=False):
    filename: str
    file_bytes: bytes
    cv_text: str
    profile: CandidateProfile
    warnings: list[ExtractionWarning]
    error: Optional[str]


def _parse_file(state: ProfileExtractionState) -> ProfileExtractionState:
    try:
        text = file_parser.extract_text(state["filename"], state["file_bytes"])
        return {"cv_text": text}
    except (file_parser.UnsupportedFileTypeError, file_parser.EmptyDocumentError) as exc:
        return {"error": str(exc)}


def _extract_profile(state: ProfileExtractionState) -> ProfileExtractionState:
    if state.get("error"):
        return {}
    try:
        profile = gemini_client.extract_candidate_profile(state["cv_text"])
        return {"profile": profile}
    except gemini_client.GeminiExtractionError as exc:
        return {"error": str(exc)}


def _validate(state: ProfileExtractionState) -> ProfileExtractionState:
    if state.get("error"):
        return {}

    profile = state["profile"]
    warnings: list[ExtractionWarning] = []

    if not profile.contact.full_name:
        warnings.append(ExtractionWarning(field="contact.full_name", message="Name not detected."))
    if not profile.contact.email:
        warnings.append(ExtractionWarning(field="contact.email", message="Email not detected."))
    if not profile.experience:
        warnings.append(ExtractionWarning(field="experience", message="No work experience detected."))
    if not profile.skills:
        warnings.append(ExtractionWarning(field="skills", message="No skills detected."))

    return {"warnings": warnings}


def _route_after_parse(state: ProfileExtractionState) -> str:
    return "end" if state.get("error") else "extract_profile"


def _route_after_extract(state: ProfileExtractionState) -> str:
    return "end" if state.get("error") else "validate"


def build_graph():
    graph = StateGraph(ProfileExtractionState)

    graph.add_node("parse_file", _parse_file)
    graph.add_node("extract_profile", _extract_profile)
    graph.add_node("validate", _validate)

    graph.set_entry_point("parse_file")
    graph.add_conditional_edges("parse_file", _route_after_parse, {"extract_profile": "extract_profile", "end": END})
    graph.add_conditional_edges("extract_profile", _route_after_extract, {"validate": "validate", "end": END})
    graph.add_edge("validate", END)

    return graph.compile()


_compiled_graph = None


def get_profile_extraction_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


def run_profile_extraction(filename: str, file_bytes: bytes) -> ProfileExtractionState:
    graph = get_profile_extraction_graph()
    return graph.invoke({"filename": filename, "file_bytes": file_bytes})
