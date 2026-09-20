"""LangGraph pipeline: fan out to 5 job sources in parallel, merge results.

Mirrors the shape of app/graphs/profile_extractor.py — an explicit graph
so later pipelines (validation, enrichment, matching) can compose with it.
"""
from __future__ import annotations

import operator
from typing import Annotated, Optional, TypedDict

from langgraph.graph import END, START, StateGraph

from app.config import get_settings
from app.models.job import JobListing
from app.services.job_sources import adzuna, gemini_search, himalayas, remoteok


class JobSearchState(TypedDict, total=False):
    job_title: str
    location: str
    remote_only: bool
    target_companies: Optional[str]
    remoteok_results: list[JobListing]
    himalayas_results: list[JobListing]
    adzuna_results: list[JobListing]
    gemini_general_results: list[JobListing]
    gemini_specific_results: list[JobListing]
    source_errors: Annotated[list[str], operator.add]
    listings: list[JobListing]


def _fetch_remoteok(state: JobSearchState) -> JobSearchState:
    try:
        return {"remoteok_results": remoteok.fetch_remoteok(state["job_title"])}
    except Exception as exc:  # noqa: BLE001
        return {"remoteok_results": [], "source_errors": [f"remoteok: {exc}"]}


def _fetch_himalayas(state: JobSearchState) -> JobSearchState:
    try:
        results = himalayas.fetch_himalayas(state["job_title"], state["location"])
        return {"himalayas_results": results}
    except Exception as exc:  # noqa: BLE001
        return {"himalayas_results": [], "source_errors": [f"himalayas: {exc}"]}


def _fetch_adzuna(state: JobSearchState) -> JobSearchState:
    if not adzuna.resolve_country_code(state["location"]):
        return {"adzuna_results": []}
    settings = get_settings()
    try:
        results = adzuna.fetch_adzuna(
            state["job_title"],
            state["location"],
            settings.adzuna_app_id,
            settings.adzuna_app_key,
        )
        return {"adzuna_results": results}
    except Exception as exc:  # noqa: BLE001
        return {"adzuna_results": [], "source_errors": [f"adzuna: {exc}"]}


def _gemini_search_general(state: JobSearchState) -> JobSearchState:
    settings = get_settings()
    try:
        results = gemini_search.search_general(
            state["job_title"],
            state["location"],
            state.get("remote_only", False),
            settings.gemini_api_key,
            settings.gemini_model,
        )
        return {"gemini_general_results": results}
    except Exception as exc:  # noqa: BLE001
        return {
            "gemini_general_results": [],
            "source_errors": [f"gemini_general: {exc}"],
        }


def _gemini_search_specific(state: JobSearchState) -> JobSearchState:
    target_companies = (state.get("target_companies") or "").strip()
    if not target_companies:
        return {"gemini_specific_results": []}
    settings = get_settings()
    try:
        results = gemini_search.search_specific(
            state["job_title"],
            state["location"],
            target_companies,
            settings.gemini_api_key,
            settings.gemini_model,
        )
        return {"gemini_specific_results": results}
    except Exception as exc:  # noqa: BLE001
        return {
            "gemini_specific_results": [],
            "source_errors": [f"gemini_specific: {exc}"],
        }


def _merge(state: JobSearchState) -> JobSearchState:
    listings = (
        state.get("remoteok_results", [])
        + state.get("himalayas_results", [])
        + state.get("adzuna_results", [])
        + state.get("gemini_general_results", [])
        + state.get("gemini_specific_results", [])
    )
    return {"listings": listings}


def build_graph():
    graph = StateGraph(JobSearchState)

    graph.add_node("fetch_remoteok", _fetch_remoteok)
    graph.add_node("fetch_himalayas", _fetch_himalayas)
    graph.add_node("fetch_adzuna", _fetch_adzuna)
    graph.add_node("gemini_search_general", _gemini_search_general)
    graph.add_node("gemini_search_specific", _gemini_search_specific)
    graph.add_node("merge", _merge)

    for node in (
        "fetch_remoteok",
        "fetch_himalayas",
        "fetch_adzuna",
        "gemini_search_general",
        "gemini_search_specific",
    ):
        graph.add_edge(START, node)
        graph.add_edge(node, "merge")

    graph.add_edge("merge", END)

    return graph.compile()


_compiled_graph = None


def get_job_search_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


def run_job_search(
    job_title: str,
    location: str,
    remote_only: bool,
    target_companies: Optional[str],
) -> JobSearchState:
    graph = get_job_search_graph()
    return graph.invoke(
        {
            "job_title": job_title,
            "location": location,
            "remote_only": remote_only,
            "target_companies": target_companies,
        }
    )
