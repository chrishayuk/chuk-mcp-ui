# SSR Runtime Spec (Phase 8)

## Overview

A server-side composition engine that receives raw data, infers the best view types using `infer_view()` (Phase 5.7), and composes a dashboard `structuredContent` payload. The "Next.js of MCP" — a Python MCP server returns raw data sections without specifying view types, and the runtime decides the visualizations.

---

## Dependencies

- **Phase 5.7** (`infer_view()`) — data shape inference engine
- **Phase 7** (AppRenderer compat) — views verified across hosts
- **Dashboard v2/v3 schema** — composition target format

---

## API

### `compose(sections: list[DataSection], layout: str = "auto") -> DashboardContent`

The primary entry point. Takes a list of data sections and returns a dashboard `structuredContent` payload.

```python
from chuk_view_ssr import compose

result = compose([
    DataSection(label="Sites", data=geojson_data),
    DataSection(label="Statistics", data={"value": 42, "delta": "+12%"}),
    DataSection(label="Records", data=tabular_rows),
])
# Returns DashboardContent with 3 panels: map, counter, datatable
```

### `compose_single(data: dict, view: str | None = None) -> StructuredContent`

Wraps a single data payload in the correct `structuredContent` envelope. If `view` is None, uses `infer_view()`.

```python
from chuk_view_ssr import compose_single

result = compose_single(geojson_data)
# Returns {"type": "map", "version": "1.0", "layers": [...], "center": {...}}
```

---

## Data Model

```python
from dataclasses import dataclass, field
from typing import Any

@dataclass
class DataSection:
    """A single data payload to be rendered as one panel."""
    label: str
    data: Any
    view: str | None = None      # Explicit view type (skips inference)
    width: float | None = None   # Relative width hint (0-1)
    position: str | None = None  # "top", "left", "right", "bottom", "main"

@dataclass
class ComposedPanel:
    """A panel in the composed dashboard."""
    id: str
    label: str
    viewType: str
    structuredContent: dict
    width: float
    position: str

@dataclass
class DashboardContent:
    """The output: a dashboard structuredContent payload."""
    type: str = "dashboard"
    version: str = "2.0"
    layout: dict = field(default_factory=dict)
    panels: list[dict] = field(default_factory=list)
    links: list[dict] = field(default_factory=list)
```

---

## Layout Strategies

### `auto` (default)

The runtime selects layout based on panel count and types:

| Panel Count | Panel Types | Layout |
|-------------|-------------|--------|
| 1 | Any | Full width |
| 2 | map + table | 60/40 split |
| 2 | Any other | 50/50 split |
| 3+ with counter | Any | KPI strip top + grid below |
| 3+ with map | map + others | Map left (60%), stack right (40%) |
| 3+ | All same type | Equal grid |

### `grid`

Equal-width columns, wrapping at the natural breakpoint.

### `single`

Tabbed layout — each section is a tab.

### `split`

Two columns: first section left, rest stacked right.

### `report`

Full-width vertical stack — each section is a full-width row.

---

## Inference Integration

The runtime calls `infer_view()` for each `DataSection` that doesn't have an explicit `view` type:

```python
for section in sections:
    if section.view:
        view_type = section.view
    else:
        suggestion = infer_view(section.data)
        view_type = suggestion.view
```

### Schema Wrapping

Once the view type is determined, the raw data must be wrapped in the view's expected `structuredContent` shape. The runtime maintains a registry of wrapper functions:

```python
WRAPPERS: dict[str, Callable[[Any, str], dict]] = {
    "map": wrap_map,        # Wraps GeoJSON into MapContent
    "datatable": wrap_table, # Wraps rows into DatatableContent
    "chart": wrap_chart,     # Wraps series into ChartContent
    "counter": wrap_counter, # Wraps value into CounterContent
    ...
}
```

Each wrapper transforms raw data into the view's typed schema, adding required fields like `type`, `version`, and view-specific defaults.

---

## Cross-View Links

When the composed dashboard contains complementary views, the runtime auto-generates cross-view links:

| Source | Target | Link Type |
|--------|--------|-----------|
| map | datatable | selection (click marker → highlight row) |
| datatable | map | selection (click row → highlight marker) |
| datatable | chart | filter (filter table → update chart) |
| filter | any | filter (broadcast filter to all panels) |

Links are only generated when both panels share compatible data (same record IDs or field names).

---

## Streaming Support

The runtime supports progressive composition via `ontoolinputpartial`:

1. **First pass** — emit dashboard skeleton with panel placeholders (`set-loading: true`)
2. **Per-section** — as each data section is processed, emit `add-panel` or `update-panel` patches
3. **Final** — emit full `DashboardContent` as the tool result

This uses the dashboard's v3 `UIPatch` system for incremental updates.

```python
async def compose_streaming(sections, emit_patch):
    # Emit skeleton
    await emit_patch({"type": "ui_patch", "ops": [
        {"op": "update-layout", "layout": inferred_layout},
    ]})

    # Process sections progressively
    for section in sections:
        panel = process_section(section)
        await emit_patch({"type": "ui_patch", "ops": [
            {"op": "add-panel", "panel": panel},
        ]})
```

---

## Location

**Package:** `chuk-view-ssr` (new Python package, or `chuk_view_schemas.ssr` submodule)

```
chuk-view-ssr/
  chuk_view_ssr/
    __init__.py        # compose(), compose_single()
    layout.py          # Layout strategy selection
    wrappers/          # Per-view data wrappers
      __init__.py
      map.py
      chart.py
      datatable.py
      ...
    links.py           # Auto-generated cross-view links
    streaming.py       # Progressive composition
  tests/
    test_compose.py
    test_layout.py
    test_wrappers.py
```

---

## Test Cases

| ID | Input | Expected |
|----|-------|----------|
| SSR-01 | Single GeoJSON section | Full-width map panel |
| SSR-02 | GeoJSON + tabular rows | 60/40 map + datatable with selection links |
| SSR-03 | 3 sections: metric, table, chart | KPI strip + 2-column grid |
| SSR-04 | Section with explicit `view="chart"` | Chart used (no inference) |
| SSR-05 | `layout="report"` | Full-width vertical stack |
| SSR-06 | `layout="single"` | Tabbed layout |
| SSR-07 | Empty sections list | Empty dashboard |
| SSR-08 | Section with unrecognized data shape | JSON tree fallback |
| SSR-09 | `compose_single(geojson)` | MapContent with inferred center/layers |
| SSR-10 | Streaming: 3 sections | 3 `add-panel` patches followed by full result |
| SSR-11 | Map + datatable with shared IDs | Auto-generated bidirectional selection link |
| SSR-12 | 5 counter sections | KPI strip layout |

---

## Success Criteria

A Python MCP server returns raw data sections without specifying view types. The runtime infers the right visualizations, composes a dashboard, and returns a single rendered page. Zero UI decisions in the MCP server code.
