"""Data shape inference engine for chuk-mcp-ui views.

Analyzes a data payload and suggests which view type best fits.
Pure Python — no external dependencies.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class ViewSuggestion:
    """A suggested view type with confidence score."""

    view: str
    confidence: float
    reason: str


# Known view type names (the "type" discriminator values)
KNOWN_TYPES = {
    "alert", "audio", "boxplot", "carousel", "chart", "chat", "code",
    "compare", "confirm", "counter", "crosstab", "dashboard", "datatable",
    "detail", "diff", "embed", "filter", "form", "gallery", "gauge",
    "gis-legend", "heatmap", "image", "json", "kanban", "layers", "log",
    "map", "markdown", "minimap", "pdf", "pivot", "poll", "profile",
    "progress", "quiz", "ranked", "scatter", "settings", "spectrogram",
    "split", "status", "stepper", "sunburst", "tabs", "terminal",
    "timeline", "timeseries", "tree", "treemap", "video",
}


def infer_view(data: Any) -> ViewSuggestion:
    """Analyze data shape and return the best matching view type.

    Args:
        data: Any Python value — dict, list, string, number, etc.

    Returns:
        ViewSuggestion with view name, confidence (0-1), and reason.
    """
    suggestions = infer_views(data, limit=1)
    return suggestions[0]


def infer_views(data: Any, limit: int = 3) -> list[ViewSuggestion]:
    """Analyze data shape and return the top N matching view types.

    Args:
        data: Any Python value.
        limit: Maximum number of suggestions to return.

    Returns:
        List of ViewSuggestion sorted by confidence (descending).
    """
    candidates: list[ViewSuggestion] = []

    if isinstance(data, dict):
        candidates = _infer_from_dict(data)
    elif isinstance(data, list):
        candidates = _infer_from_list(data)
    elif isinstance(data, str):
        candidates = _infer_from_string(data)
    elif isinstance(data, (int, float)):
        candidates = [ViewSuggestion("counter", 0.65, "Numeric scalar value")]
    else:
        candidates = [ViewSuggestion("json", 0.50, "Unknown data type")]

    # Sort by confidence descending, deduplicate by view name
    seen: set[str] = set()
    unique: list[ViewSuggestion] = []
    for s in sorted(candidates, key=lambda x: x.confidence, reverse=True):
        if s.view not in seen:
            seen.add(s.view)
            unique.append(s)

    return unique[:limit]


def _infer_from_dict(data: dict[str, Any]) -> list[ViewSuggestion]:
    """Infer view types from a dict payload."""
    candidates: list[ViewSuggestion] = []

    # --- Tier 1: Exact type match ---
    if "type" in data and isinstance(data["type"], str):
        t = data["type"]
        if t in KNOWN_TYPES:
            candidates.append(ViewSuggestion(t, 1.0, f'Exact type field match: "{t}"'))
            return candidates

    # --- Tier 2: Signature fields ---
    # chart
    if "chartType" in data:
        candidates.append(ViewSuggestion("chart", 0.95, '"chartType" field is unique to chart schema'))

    # map
    if "layers" in data and ("center" in data or "bounds" in data):
        candidates.append(ViewSuggestion("map", 0.95, '"layers" + "center"/"bounds" are map-specific fields'))

    # datatable
    if "columns" in data and "rows" in data:
        candidates.append(ViewSuggestion("datatable", 0.95, '"columns" + "rows" is the tabular data signature'))

    # form
    if "schema" in data and "submitTool" in data:
        candidates.append(ViewSuggestion("form", 0.95, '"schema" + "submitTool" are form-specific fields'))

    # timeline
    if "events" in data and isinstance(data["events"], list):
        events = data["events"]
        if events and isinstance(events[0], dict) and "date" in events[0]:
            candidates.append(ViewSuggestion("timeline", 0.90, '"events" array with "date" fields'))

    # gauge
    if "value" in data and "thresholds" in data:
        candidates.append(ViewSuggestion("gauge", 0.90, '"value" + "thresholds" is the gauge signature'))

    # progress
    if "tracks" in data and isinstance(data["tracks"], list):
        tracks = data["tracks"]
        if tracks and isinstance(tracks[0], dict) and "bars" in tracks[0]:
            candidates.append(ViewSuggestion("progress", 0.85, '"tracks" with "bars" is progress-specific'))

    # log
    if "entries" in data and isinstance(data["entries"], list):
        entries = data["entries"]
        if entries and isinstance(entries[0], dict) and "level" in entries[0]:
            candidates.append(ViewSuggestion("log", 0.85, '"entries" with "level" field'))

    # tree
    if "nodes" in data or "children" in data:
        candidates.append(ViewSuggestion("tree", 0.85, '"nodes" or "children" indicates hierarchical data'))

    # poll
    if "options" in data and isinstance(data["options"], list):
        opts = data["options"]
        if opts and isinstance(opts[0], dict) and "votes" in opts[0]:
            candidates.append(ViewSuggestion("poll", 0.85, '"options" with "votes" is polling data'))

    if candidates:
        return candidates

    # --- Tier 3: Structural patterns ---

    # detail (title + fields/sections)
    if "title" in data and ("fields" in data or "sections" in data):
        candidates.append(ViewSuggestion("detail", 0.70, '"title" + "fields"/"sections" suggests single-record display'))

    # counter (simple value wrapper)
    if "value" in data and isinstance(data["value"], (int, float)):
        candidates.append(ViewSuggestion("counter", 0.65, '"value" field with numeric type'))

    # json fallback for any dict
    candidates.append(ViewSuggestion("json", 0.50, "Generic dict — fallback to JSON tree viewer"))

    return candidates


def _infer_from_list(data: list[Any]) -> list[ViewSuggestion]:
    """Infer view types from a list payload."""
    candidates: list[ViewSuggestion] = []

    if not data:
        return [ViewSuggestion("json", 0.50, "Empty array")]

    # Sample first few items
    sample = data[:5]

    # Check if all items are dicts
    if all(isinstance(item, dict) for item in sample):
        sample_dicts: list[dict[str, Any]] = sample  # type: ignore[assignment]
        keys = set()
        for d in sample_dicts:
            keys.update(d.keys())

        # Spatial data — lat/lon fields
        geo_fields = {"lat", "lon", "lng", "latitude", "longitude"}
        if len(keys & geo_fields) >= 2:
            candidates.append(ViewSuggestion("map", 0.80, "Array of objects with lat/lon fields"))

        # Label/value pairs → chart
        if keys >= {"label", "value"}:
            candidates.append(ViewSuggestion("chart", 0.70, "Array of {label, value} pairs"))

        # Uniform scalar objects → datatable
        candidates.append(ViewSuggestion("datatable", 0.50, "Array of objects — default table fallback"))

    elif all(isinstance(item, (int, float)) for item in sample):
        candidates.append(ViewSuggestion("chart", 0.60, "Array of numbers"))

    else:
        candidates.append(ViewSuggestion("json", 0.50, "Mixed array"))

    return candidates


def _infer_from_string(data: str) -> list[ViewSuggestion]:
    """Infer view types from a string payload."""
    candidates: list[ViewSuggestion] = []

    stripped = data.strip()

    # Code detection — common language patterns
    code_signals = ("def ", "function ", "class ", "import ", "const ", "let ", "var ", "pub fn ")
    if any(stripped.startswith(s) or f"\n{s}" in stripped for s in code_signals):
        candidates.append(ViewSuggestion("code", 0.65, "String contains code patterns"))

    # Markdown detection
    md_signals = ("# ", "## ", "**", "- ", "```")
    if any(s in stripped for s in md_signals):
        candidates.append(ViewSuggestion("markdown", 0.65, "String contains markdown formatting"))

    if not candidates:
        candidates.append(ViewSuggestion("markdown", 0.50, "Plain text — default to markdown"))

    return candidates
