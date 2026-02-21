# infer_view() Spec (Phase 5.7)

## Overview

A Python utility that analyzes the shape of a data dict and suggests which view type best fits. Enables zero-decision rendering — the server returns raw data, and the inference engine selects the visualization.

---

## API

### `infer_view(data: dict) -> ViewSuggestion`

```python
from chuk_view_schemas import infer_view

data = [{"lat": 51.5, "lon": -0.1, "name": "London"}, ...]
suggestion = infer_view(data)
# ViewSuggestion(view="map", confidence=0.95, reason="Array of objects with lat/lon fields")
```

### `infer_views(data: dict, limit: int = 3) -> list[ViewSuggestion]`

Returns the top N matches ranked by confidence.

```python
suggestions = infer_views(data, limit=3)
# [ViewSuggestion(view="datatable", confidence=0.90, ...),
#  ViewSuggestion(view="chart", confidence=0.65, ...),
#  ViewSuggestion(view="json", confidence=0.50, ...)]
```

---

## Data Model

```python
from dataclasses import dataclass

@dataclass
class ViewSuggestion:
    view: str           # View type name (e.g., "map", "chart")
    confidence: float   # 0.0 to 1.0
    reason: str         # Human-readable explanation
```

---

## Location

**File:** `chuk-view-schemas/chuk_view_schemas/infer.py`

Part of the existing `chuk-view-schemas` Python package. No new package needed.

---

## Inference Rules

The engine checks rules in priority order. First match above the confidence threshold wins.

### Tier 1: Exact Type Match (confidence: 1.0)

If the input dict already has a `"type"` field matching a known view type, return it directly.

```python
{"type": "chart", "chartType": "bar", ...}  →  chart (1.0)
```

### Tier 2: Signature Fields (confidence: 0.85-0.95)

Fields that are uniquely diagnostic of a single view type.

| Signal | View | Confidence | Reason |
|--------|------|------------|--------|
| `chartType` field present | chart | 0.95 | `chartType` is unique to chart schema |
| `layers` + `center` or `bounds` | map | 0.95 | Map-specific required fields |
| `columns` + `rows` | datatable | 0.95 | Tabular data signature |
| `schema` + `submitTool` | form | 0.95 | Form-specific required fields |
| `events` array with `date` fields | timeline | 0.90 | Temporal events |
| `value` + `thresholds` | gauge | 0.90 | Single-metric with thresholds |
| `tracks` array with `bars` | progress | 0.85 | Multi-track progress bars |
| `entries` with `level` field | log | 0.85 | Log-level structured entries |
| `nodes` + `edges` or `children` | tree | 0.85 | Hierarchical data |
| `options` + `votes` | poll | 0.85 | Polling data |

### Tier 3: Structural Patterns (confidence: 0.60-0.80)

Patterns inferred from data shape rather than specific field names.

| Pattern | View | Confidence | Reason |
|---------|------|------------|--------|
| Array of objects with `lat`/`lon`/`latitude`/`longitude` | map | 0.80 | GeoJSON-like spatial data |
| Array of objects with uniform keys, all scalar values | datatable | 0.75 | Tabular structure |
| Array of `{label, value}` pairs | chart | 0.70 | Chart-ready data series |
| Object with `title` + `fields` or `sections` | detail | 0.70 | Single-record display |
| Single number or `{value: number}` | counter | 0.65 | Simple metric |
| String with markdown indicators (`#`, `**`, `- `) | markdown | 0.65 | Markdown content |
| Nested object with no arrays | json | 0.60 | Generic structured data |

### Tier 4: Fallback (confidence: 0.50)

| Pattern | View |
|---------|------|
| Any array of objects | datatable |
| Any dict | json |

---

## Input Handling

The function accepts several input shapes:

| Input | Behavior |
|-------|----------|
| `dict` with `type` field | Check Tier 1 first |
| `dict` without `type` | Check Tier 2-4 |
| `list[dict]` | Analyze first N items (default 5) for field patterns |
| `list[scalar]` | Suggest chart (single series) |
| `str` | Suggest markdown or code |
| `int` / `float` | Suggest counter |

---

## Test Matrix

| ID | Input | Expected View | Expected Confidence |
|----|-------|--------------|-------------------|
| IV-01 | `{"type": "chart", "chartType": "bar", "data": [...]}` | chart | 1.0 |
| IV-02 | `{"layers": [{"features": [...]}], "center": {"lat": 51, "lon": 0}}` | map | 0.95 |
| IV-03 | `{"columns": [{"key": "name"}], "rows": [{"name": "Alice"}]}` | datatable | 0.95 |
| IV-04 | `{"schema": {"properties": {...}}, "submitTool": "save"}` | form | 0.95 |
| IV-05 | `{"events": [{"date": "2024-01-01", "title": "Start"}]}` | timeline | 0.90 |
| IV-06 | `{"value": 75, "min": 0, "max": 100, "thresholds": [...]}` | gauge | 0.90 |
| IV-07 | `[{"lat": 51.5, "lon": -0.1, "name": "London"}]` | map | 0.80 |
| IV-08 | `[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]` | datatable | 0.75 |
| IV-09 | `[{"label": "Jan", "value": 100}, {"label": "Feb", "value": 200}]` | chart | 0.70 |
| IV-10 | `{"title": "Site Report", "fields": [{"label": "Name", "value": "..."}]}` | detail | 0.70 |
| IV-11 | `42` | counter | 0.65 |
| IV-12 | `"# Hello\n\nSome **markdown** content"` | markdown | 0.65 |
| IV-13 | `{"deeply": {"nested": {"data": 1}}}` | json | 0.60 |
| IV-14 | `[{"id": 1}, {"id": 2}]` (no clear pattern) | datatable | 0.50 |
| IV-15 | `{"chartType": "pie", "data": [{"label": "A", "values": [1]}]}` | chart | 0.95 |
| IV-16 | `{"entries": [{"level": "error", "message": "fail"}]}` | log | 0.85 |
| IV-17 | `{"nodes": [{"id": "a"}], "edges": [{"from": "a", "to": "b"}]}` | tree | 0.85 |
| IV-18 | `{"question": "?", "options": [{"text": "A", "votes": 5}]}` | poll | 0.85 |
| IV-19 | `{"value": 42}` | counter | 0.65 |
| IV-20 | `"def hello():\n    print('hi')"` | code | 0.65 |

---

## Dependencies

- No external dependencies (pure Python stdlib)
- Uses existing `chuk-view-schemas` package structure
- References the 52 `schemas/input.json` files as the source of truth for field patterns
