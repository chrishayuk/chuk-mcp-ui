"""
Demo MCP server showcasing all 67 chuk-mcp-ui Views.

Spec-compliant: registers ui:// resources, proxies View HTML from CDN,
uses ToolAnnotations, and returns structuredContent + content fallback.

Run:
    pip install -r requirements.txt
    mcp dev server.py

Or add to Claude Desktop config:
    {
      "mcpServers": {
        "view-demo": {
          "command": "python",
          "args": ["/path/to/examples/demo-server/server.py"]
        }
      }
    }
"""

import json
import os

import httpx
from mcp.server.fastmcp import FastMCP
from mcp.types import CallToolResult, TextContent, ToolAnnotations


class _QuietFastMCP(FastMCP):
    """FastMCP subclass that hides resources from list_resources.

    Resources are still registered (so resources/read works), but
    list_resources returns empty. This stops hosts like Claude from
    pre-fetching all 67 views on connect (~50 MB combined > 5 MB limit).
    """

    async def list_resources(self):
        return []


mcp = _QuietFastMCP(
    "view-demo",
    host="0.0.0.0",
    port=int(os.getenv("PORT", "8000")),
)

# ── CDN + resource URI constants ──────────────────────────────────────────

CDN_BASE = "https://chuk-mcp-ui-views.fly.dev"

VIEWS = {
    # Core (17)
    "map": "/map/v1", "datatable": "/datatable/v1", "chart": "/chart/v1",
    "form": "/form/v1", "markdown": "/markdown/v1", "video": "/video/v1",
    "pdf": "/pdf/v1", "dashboard": "/dashboard/v1", "split": "/split/v1",
    "tabs": "/tabs/v1", "detail": "/detail/v1", "counter": "/counter/v1",
    "code": "/code/v1", "progress": "/progress/v1", "confirm": "/confirm/v1",
    "json": "/json/v1", "status": "/status/v1",
    # Interactive (10)
    "compare": "/compare/v1", "gallery": "/gallery/v1", "ranked": "/ranked/v1",
    "poll": "/poll/v1", "quiz": "/quiz/v1", "chat": "/chat/v1",
    "image": "/image/v1", "log": "/log/v1", "timeline": "/timeline/v1",
    "tree": "/tree/v1",
    # Developer (7)
    "alert": "/alert/v1", "diff": "/diff/v1", "embed": "/embed/v1",
    "filter": "/filter/v1", "kanban": "/kanban/v1", "settings": "/settings/v1",
    "stepper": "/stepper/v1",
    # Data Viz (10)
    "gauge": "/gauge/v1", "heatmap": "/heatmap/v1", "crosstab": "/crosstab/v1",
    "scatter": "/scatter/v1", "boxplot": "/boxplot/v1", "timeseries": "/timeseries/v1",
    "treemap": "/treemap/v1", "sunburst": "/sunburst/v1", "pivot": "/pivot/v1",
    "profile": "/profile/v1",
    # Specialist (7)
    "audio": "/audio/v1", "carousel": "/carousel/v1", "terminal": "/terminal/v1",
    "gis-legend": "/gis-legend/v1", "layers": "/layers/v1", "minimap": "/minimap/v1",
    "spectrogram": "/spectrogram/v1",
    # Phase 6 — Novel Compound (15)
    "notebook": "/notebook/v1", "funnel": "/funnel/v1", "swimlane": "/swimlane/v1",
    "slides": "/slides/v1", "annotation": "/annotation/v1", "neural": "/neural/v1",
    "sankey": "/sankey/v1", "geostory": "/geostory/v1", "investigation": "/investigation/v1",
    "gantt": "/gantt/v1", "calendar": "/calendar/v1", "graph": "/graph/v1",
    "flowchart": "/flowchart/v1", "globe": "/globe/v1", "threed": "/threed/v1",
}

# ui:// URIs for tool metadata (host fetches HTML via resources/read)
UI_URI = {name: f"ui://view-demo/{name}" for name in VIEWS}

# https:// URLs — used in tool metadata (viewUrl) and composition Views (iframe src)
CDN_URL = {name: f"{CDN_BASE}{path}" for name, path in VIEWS.items()}

# Annotation shared by all read-only show_* tools
READ_ONLY = ToolAnnotations(readOnlyHint=True)

# ── Resource registration ─────────────────────────────────────────────────
# Register every view as a ui:// resource so resources/read works.
# list_resources is overridden (see _QuietFastMCP) to return empty.

_html_cache: dict[str, str] = {}


async def _fetch_view_html(view_name: str) -> str:
    """Fetch View HTML from CDN with in-memory caching."""
    if view_name in _html_cache:
        return _html_cache[view_name]

    url = f"{CDN_BASE}{VIEWS[view_name]}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, follow_redirects=True)
        resp.raise_for_status()
        html = resp.text

    _html_cache[view_name] = html
    return html


def _make_resource_handler(view_name: str):
    """Factory that returns a zero-arg async handler."""
    async def handler() -> str:
        return await _fetch_view_html(view_name)
    return handler


for _view_name, _path in VIEWS.items():
    _uri = f"ui://view-demo/{_view_name}"
    _desc = f"{_view_name.replace('-', ' ').title()} View"
    mcp.resource(
        _uri, name=f"{_view_name} View", mime_type="text/html;profile=mcp-app", description=_desc
    )(_make_resource_handler(_view_name))


# ── 1. Map ──────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["map"], "viewUrl": CDN_URL["map"]}},
    annotations=READ_ONLY,
)
async def show_map() -> CallToolResult:
    """Show world landmarks on an interactive map."""
    landmarks = [
        ("Eiffel Tower", 48.8584, 2.2945, "Paris, France"),
        ("Statue of Liberty", 40.6892, -74.0445, "New York, USA"),
        ("Colosseum", 41.8902, 12.4922, "Rome, Italy"),
        ("Great Wall", 40.4319, 116.5704, "Beijing, China"),
        ("Sydney Opera House", -33.8568, 151.2153, "Sydney, Australia"),
        ("Machu Picchu", -13.1631, -72.5450, "Cusco, Peru"),
        ("Taj Mahal", 27.1751, 78.0421, "Agra, India"),
    ]

    structured = {
        "type": "map",
        "version": "1.0",
        "center": {"lat": 20, "lon": 10},
        "zoom": 2,
        "basemap": "osm",
        "layers": [
            {
                "id": "landmarks",
                "label": "World Landmarks",
                "features": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [lon, lat],
                            },
                            "properties": {
                                "name": name,
                                "location": loc,
                            },
                        }
                        for name, lat, lon, loc in landmarks
                    ],
                },
                "popup": {
                    "title": "{properties.name}",
                    "fields": ["location"],
                },
            }
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Showing {len(landmarks)} world landmarks."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 2. Chart ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["chart"], "viewUrl": CDN_URL["chart"]}},
    annotations=READ_ONLY,
)
async def show_chart(chart_type: str = "bar") -> CallToolResult:
    """Show programming language popularity as a chart. chart_type: bar, pie, or line."""
    structured = {
        "type": "chart",
        "version": "1.0",
        "title": "Programming Language Popularity 2025",
        "chartType": chart_type,
        "data": [
            {
                "label": "Popularity (%)",
                "values": [
                    {"label": "Python", "value": 28.1},
                    {"label": "JavaScript", "value": 21.3},
                    {"label": "TypeScript", "value": 12.7},
                    {"label": "Java", "value": 10.5},
                    {"label": "C#", "value": 7.8},
                    {"label": "Go", "value": 5.2},
                    {"label": "Rust", "value": 3.9},
                ],
            }
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Programming language popularity ({chart_type} chart)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 3. DataTable ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["datatable"], "viewUrl": CDN_URL["datatable"]}},
    annotations=READ_ONLY,
)
async def show_table() -> CallToolResult:
    """Show country data in a sortable, filterable table with all column types."""
    countries = [
        ("Japan", "Asia", 125.7, 4940.88, "High income", True, "1956-12-18", "https://en.wikipedia.org/wiki/Japan"),
        ("Brazil", "South America", 214.3, 1920.10, "Upper middle", True, "1945-10-24", "https://en.wikipedia.org/wiki/Brazil"),
        ("Germany", "Europe", 83.2, 4259.93, "High income", True, "1973-09-18", "https://en.wikipedia.org/wiki/Germany"),
        ("Nigeria", "Africa", 223.8, 477.39, "Lower middle", True, "1960-10-07", "https://en.wikipedia.org/wiki/Nigeria"),
        ("Australia", "Oceania", 26.4, 1724.79, "High income", True, "1945-11-01", "https://en.wikipedia.org/wiki/Australia"),
        ("Canada", "North America", 39.6, 2139.84, "High income", True, "1945-11-09", "https://en.wikipedia.org/wiki/Canada"),
        ("India", "Asia", 1428.6, 3732.22, "Lower middle", True, "1945-10-30", "https://en.wikipedia.org/wiki/India"),
        ("France", "Europe", 67.8, 2923.49, "High income", True, "1945-10-24", "https://en.wikipedia.org/wiki/France"),
    ]

    income_colors = {
        "High income": "#2a9d8f",
        "Upper middle": "#e9c46a",
        "Lower middle": "#e76f51",
    }

    structured = {
        "type": "datatable",
        "version": "1.0",
        "title": "World Countries",
        "sortable": True,
        "filterable": True,
        "exportable": True,
        "columns": [
            {"key": "name", "label": "Country", "sortable": True, "width": "15%"},
            {"key": "continent", "label": "Continent", "sortable": True},
            {
                "key": "population",
                "label": "Population (M)",
                "type": "number",
                "sortable": True,
                "align": "right",
            },
            {
                "key": "gdp",
                "label": "GDP ($B)",
                "type": "number",
                "sortable": True,
                "align": "right",
            },
            {
                "key": "income",
                "label": "Income Level",
                "type": "badge",
                "badgeColors": income_colors,
            },
            {
                "key": "un_member",
                "label": "UN Member",
                "type": "boolean",
                "align": "center",
            },
            {
                "key": "un_joined",
                "label": "UN Joined",
                "type": "date",
                "sortable": True,
            },
            {
                "key": "wiki",
                "label": "Wikipedia",
                "type": "link",
            },
        ],
        "rows": [
            {
                "name": name,
                "continent": cont,
                "population": pop,
                "gdp": gdp,
                "income": inc,
                "un_member": un,
                "un_joined": joined,
                "wiki": wiki,
            }
            for name, cont, pop, gdp, inc, un, joined, wiki in countries
        ],
        "actions": [
            {
                "label": "Details",
                "tool": "show_country_detail",
                "arguments": {"country": "{name}"},
            },
            {
                "label": "Remove",
                "tool": "remove_country",
                "arguments": {"country": "{name}"},
                "confirm": "Are you sure you want to remove {name}?",
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Showing {len(countries)} countries with all column types."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 4. Markdown ─────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["markdown"], "viewUrl": CDN_URL["markdown"]}},
    annotations=READ_ONLY,
)
async def show_markdown() -> CallToolResult:
    """Show a rich markdown document with headings, code, tables, and lists."""
    md = """\
# MCP Views Demo

Welcome to the **chuk-mcp-ui** View system. This document is rendered using the
Markdown View, powered by [marked](https://github.com/markedjs/marked).

## Design System

All 51 Views share a unified design system built with:

- **Tailwind CSS v4** — utility-first styling via the `@tailwindcss/vite` plugin
- **shadcn/ui + Radix UI** — 15 accessible component primitives (Button, Table, Badge, Input, Select, Checkbox, RadioGroup, Slider, Tabs, etc.)
- **Framer Motion** — declarative enter/exit animations (opt-in per View)

The theme bridge maps runtime `--chuk-*` CSS variables to Tailwind tokens, so Views
automatically adapt to host light/dark themes.

## View Categories

### Core (17 views)
map, datatable, chart, form, markdown, video, pdf, dashboard, split, tabs,
detail, counter, code, progress, confirm, json, status

### Interactive (10 views)
compare, gallery, ranked, poll, quiz, chat, image, log, timeline, tree

### Developer (7 views)
alert, diff, embed, filter, kanban, settings, stepper

### Data Viz (10 views)
gauge, heatmap, crosstab, scatter, boxplot, timeseries, treemap, sunburst, pivot, profile

### Specialist (7 views)
audio, carousel, terminal, gis-legend, layers, minimap, spectrogram

## Features

- **51 View types** across 5 categories
- **Dual distribution**: npm packages (inline) + Fly.io CDN (URL reference)
- **Triple schema**: JSON Schema + Zod (TypeScript) + Pydantic (Python)
- **Themeable**: All Views respect the host client's color scheme via CSS variable bridge
- **Composable**: v2.0 dashboards support cross-view selection linking

## Code Example

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool(meta={"ui": {"resourceUri": "ui://my-server/map"}})
async def show_map() -> dict:
    return CallToolResult(
        content=[TextContent(type="text", text="Here's a map!")],
        structuredContent={
            "type": "map", "version": "1.0",
            "center": {"lat": 51.5, "lon": -0.1}, "zoom": 12,
            "layers": [...]
        }
    }
```

## View Types

| Category | View | Description |
|----------|------|-------------|
| Core | Map | Leaflet interactive map with GeoJSON layers |
| Core | Chart | Bar, line, pie, scatter, radar charts |
| Core | DataTable | Sortable/filterable table with CSV export |
| Core | Form | JSON Schema driven form with validation |
| Core | Markdown | Rich text rendering with code highlighting |
| Core | Video | HTML5 video player with poster and controls |
| Core | PDF | PDF.js document viewer with page navigation |
| Core | Dashboard | Multi-panel grid layout embedding child Views |
| Core | Split | Two-panel side-by-side layout |
| Core | Tabs | Tabbed panel switching between child Views |
| Core | Detail | Key-value detail card with actions |
| Core | Counter | Single metric display with trend |
| Core | Code | Syntax-highlighted code block |
| Core | Status | Multi-item system status board |
| Interactive | Timeline | Chronological event display |
| Interactive | Gallery | Image grid with lightbox |
| Interactive | Tree | Hierarchical node explorer |
| Developer | Kanban | Drag-and-drop board columns |
| Data Viz | Gauge | Radial metric with thresholds |

> All Views are self-contained single HTML files that communicate via `postMessage`.
"""
    structured = {
        "type": "markdown",
        "version": "1.0",
        "title": "MCP Views Documentation",
        "content": md,
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Showing MCP Views documentation."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 5. Video ────────────────────────────────────────────────────────────────

_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
_VIDEO_POSTER = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg"


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["video"], "viewUrl": CDN_URL["video"]}},
    annotations=READ_ONLY,
)
async def show_video() -> CallToolResult:
    """Show a sample video (Big Buck Bunny — public domain).

    After the video loads, use these follow-up tools to control playback:
    - play_video() — start playback
    - pause_video() — pause playback
    - seek_video(time=30) — jump to a specific time in seconds
    - set_video_speed(rate=1.5) — change playback speed
    - set_video_volume(level=0.5) — change volume (0.0–1.0)
    """
    structured = {
        "type": "dashboard",
        "version": "2.0",
        "title": "Video Player",
        "layout": {"type": "named", "preset": "single"},
        "panels": [
            {
                "id": "video",
                "label": "Big Buck Bunny",
                "viewType": "video",
                "structuredContent": {
                    "type": "video",
                    "version": "1.0",
                    "title": "Big Buck Bunny",
                    "url": _VIDEO_URL,
                    "poster": _VIDEO_POSTER,
                    "autoplay": False,
                    "muted": False,
                    "loop": False,
                },
            }
        ],
    }

    return CallToolResult(
        content=[
            TextContent(
                type="text",
                text=(
                    "Showing Big Buck Bunny sample video.\n\n"
                    "Follow-up actions: play_video, pause_video, seek_video, "
                    "set_video_speed, set_video_volume."
                ),
            ),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


def _video_patch(**fields) -> dict:
    """Build a ui_patch that merges fields into the video panel."""
    base = {
        "type": "video",
        "version": "1.0",
        "url": _VIDEO_URL,
        "title": "Big Buck Bunny",
    }
    base.update(fields)
    return {
        "type": "ui_patch",
        "version": "3.0",
        "ops": [
            {
                "op": "update-panel",
                "panelId": "video",
                "action": "replace",
                "data": {"structuredContent": base},
            }
        ],
    }


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False),
)
async def play_video() -> CallToolResult:
    """Start (or resume) video playback."""
    structured = _video_patch(playing=True)
    return CallToolResult(
        content=[
            TextContent(type="text", text="Video playback started."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False),
)
async def pause_video() -> CallToolResult:
    """Pause video playback."""
    structured = _video_patch(playing=False)
    return CallToolResult(
        content=[
            TextContent(type="text", text="Video paused."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False),
)
async def seek_video(time: float = 0) -> CallToolResult:
    """Jump to a specific time in the video. time: position in seconds."""
    structured = _video_patch(currentTime=time, playing=True)
    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Seeked to {time:.1f}s and playing."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False),
)
async def set_video_speed(rate: float = 1.0) -> CallToolResult:
    """Change video playback speed. rate: 0.25–4.0 (1.0 = normal)."""
    structured = _video_patch(playbackRate=rate)
    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Playback speed set to {rate}x."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False),
)
async def set_video_volume(level: float = 1.0) -> CallToolResult:
    """Change video volume. level: 0.0 (mute) to 1.0 (full)."""
    structured = _video_patch(volume=level)
    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Volume set to {int(level * 100)}%."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 6. PDF ──────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["pdf"], "viewUrl": CDN_URL["pdf"]}},
    annotations=READ_ONLY,
)
async def show_pdf() -> CallToolResult:
    """Display a sample PDF document."""
    structured = {
        "type": "pdf",
        "version": "1.0",
        "title": "Sample PDF",
        "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf",
        "initialPage": 1,
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Showing sample PDF document."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 7. Form ─────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["form"], "viewUrl": CDN_URL["form"]}},
    annotations=READ_ONLY,
)
async def show_form() -> CallToolResult:
    """Show an event registration form demonstrating all widget types."""
    structured = {
        "type": "form",
        "version": "1.0",
        "title": "Event Registration",
        "description": "Register for the MCP Views Conference 2026. Fields marked * are required.",
        "submitLabel": "Register",
        "submitTool": "handle_registration",
        "schema": {
            "type": "object",
            "required": ["name", "email", "ticket_type"],
            "properties": {
                "name": {
                    "type": "string",
                    "title": "Full Name",
                    "minLength": 2,
                },
                "email": {"type": "string", "title": "Email Address"},
                "password": {
                    "type": "string",
                    "title": "Create Password",
                    "minLength": 8,
                },
                "ticket_type": {
                    "type": "string",
                    "title": "Ticket Type",
                    "enum": ["general", "vip", "speaker"],
                    "enumLabels": [
                        "General Admission",
                        "VIP Access",
                        "Speaker Pass",
                    ],
                },
                "track": {
                    "type": "string",
                    "title": "Preferred Track",
                    "enum": [
                        "frontend",
                        "backend",
                        "infrastructure",
                        "ai-ml",
                        "security",
                    ],
                    "enumLabels": [
                        "Frontend",
                        "Backend",
                        "Infrastructure",
                        "AI & ML",
                        "Security",
                    ],
                },
                "workshop_date": {"type": "string", "title": "Workshop Date"},
                "experience": {
                    "type": "number",
                    "title": "Years of Experience",
                    "minimum": 0,
                    "maximum": 30,
                },
                "newsletter": {
                    "type": "boolean",
                    "title": "Subscribe to newsletter",
                },
                "badge_color": {"type": "string", "title": "Badge Color"},
                "dietary": {
                    "type": "string",
                    "title": "Dietary Requirements",
                },
                "referral_code": {"type": "string"},
            },
        },
        "uiSchema": {
            "groups": [
                {
                    "title": "Personal Information",
                    "fields": ["name", "email", "password"],
                },
                {
                    "title": "Event Preferences",
                    "fields": ["ticket_type", "track", "workshop_date"],
                },
                {
                    "title": "Additional Options",
                    "fields": [
                        "experience",
                        "newsletter",
                        "badge_color",
                        "dietary",
                    ],
                    "collapsible": True,
                    "collapsed": False,
                },
            ],
            "fields": {
                "email": {
                    "placeholder": "you@example.com",
                    "help": "We'll send your confirmation here.",
                },
                "password": {
                    "widget": "password",
                    "help": "Must be at least 8 characters.",
                },
                "track": {"placeholder": "Choose a track..."},
                "workshop_date": {"widget": "date"},
                "experience": {"widget": "slider"},
                "badge_color": {"widget": "color"},
                "dietary": {
                    "widget": "textarea",
                    "placeholder": "Any allergies or preferences...",
                },
                "referral_code": {"widget": "hidden"},
            },
        },
        "initialValues": {
            "referral_code": "MCP-2026",
            "newsletter": True,
            "badge_color": "#3388ff",
        },
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Showing event registration form with 10 widget types."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 8. Dashboard ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["dashboard"], "viewUrl": CDN_URL["dashboard"]}},
    annotations=READ_ONLY,
)
async def show_dashboard() -> CallToolResult:
    """Show a composed 4-panel dashboard with map, chart, table, and markdown."""
    landmarks = [
        ("Eiffel Tower", 48.8584, 2.2945, "Europe"),
        ("Statue of Liberty", 40.6892, -74.0445, "North America"),
        ("Colosseum", 41.8902, 12.4922, "Europe"),
        ("Great Wall", 40.4319, 116.5704, "Asia"),
        ("Sydney Opera House", -33.8568, 151.2153, "Oceania"),
        ("Taj Mahal", 27.1751, 78.0421, "Asia"),
    ]

    from collections import Counter

    continent_counts = Counter(cont for _, _, _, cont in landmarks)

    continent_badge_colors = {
        "Europe": "#3b82f6",
        "North America": "#10b981",
        "Asia": "#f59e0b",
        "Oceania": "#8b5cf6",
    }

    # NOTE: viewUrl uses https:// CDN URLs — these are loaded by the
    # dashboard iframe directly, not by the host via resources/read.
    structured = {
        "type": "dashboard",
        "version": "1.0",
        "title": "World Landmarks Dashboard",
        "layout": "grid",
        "gap": "6px",
        "panels": [
            {
                "id": "map-panel",
                "label": "Map",
                "viewUrl": CDN_URL["map"],
                "width": "60%",
                "height": "50%",
                "structuredContent": {
                    "type": "map",
                    "version": "1.0",
                    "center": {"lat": 20, "lon": 10},
                    "zoom": 2,
                    "layers": [
                        {
                            "id": "landmarks",
                            "label": "Landmarks",
                            "features": {
                                "type": "FeatureCollection",
                                "features": [
                                    {
                                        "type": "Feature",
                                        "geometry": {
                                            "type": "Point",
                                            "coordinates": [lon, lat],
                                        },
                                        "properties": {
                                            "name": name,
                                            "continent": cont,
                                        },
                                    }
                                    for name, lat, lon, cont in landmarks
                                ],
                            },
                            "popup": {
                                "title": "{properties.name}",
                                "fields": ["continent"],
                            },
                        }
                    ],
                },
            },
            {
                "id": "chart-panel",
                "label": "By Continent",
                "viewUrl": CDN_URL["chart"],
                "width": "40%",
                "height": "50%",
                "structuredContent": {
                    "type": "chart",
                    "version": "1.0",
                    "title": "Landmarks by Continent",
                    "chartType": "pie",
                    "data": [
                        {
                            "label": "Count",
                            "values": [
                                {"label": k, "value": v}
                                for k, v in continent_counts.items()
                            ],
                        }
                    ],
                },
            },
            {
                "id": "table-panel",
                "label": "All Landmarks",
                "viewUrl": CDN_URL["datatable"],
                "width": "60%",
                "height": "50%",
                "structuredContent": {
                    "type": "datatable",
                    "version": "1.0",
                    "title": "Landmarks",
                    "sortable": True,
                    "filterable": True,
                    "columns": [
                        {"key": "name", "label": "Name", "sortable": True},
                        {
                            "key": "continent",
                            "label": "Continent",
                            "type": "badge",
                            "badgeColors": continent_badge_colors,
                        },
                    ],
                    "rows": [
                        {"name": name, "continent": cont}
                        for name, _, _, cont in landmarks
                    ],
                },
            },
            {
                "id": "summary-panel",
                "label": "Summary",
                "viewUrl": CDN_URL["markdown"],
                "width": "40%",
                "height": "50%",
                "structuredContent": {
                    "type": "markdown",
                    "version": "1.0",
                    "content": (
                        f"## Dashboard Overview\n\n"
                        f"Displaying **{len(landmarks)} landmarks** across "
                        f"**{len(continent_counts)} continents**.\n\n"
                        f"| Continent | Count |\n|---|---|\n"
                        + "\n".join(
                            f"| {k} | {v} |"
                            for k, v in continent_counts.items()
                        )
                        + "\n\nThis dashboard composes **4 View types** "
                        "(map, chart, table, markdown) in a single panel layout."
                    ),
                },
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Dashboard: {len(landmarks)} landmarks across {len(continent_counts)} continents in 4 panels."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 9. Split ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["split"], "viewUrl": CDN_URL["split"]}},
    annotations=READ_ONLY,
)
async def show_split() -> CallToolResult:
    """Show a side-by-side split view: markdown on the left, chart on the right."""
    structured = {
        "type": "split",
        "version": "1.0",
        "direction": "horizontal",
        "ratio": 50,
        "left": {
            "viewUrl": CDN_URL["markdown"],
            "structuredContent": {
                "type": "markdown",
                "version": "1.0",
                "content": "# Language Stats\n\nThis panel shows a **markdown** document alongside a chart.\n\n- Python leads with **28.1%**\n- JavaScript follows at **21.3%**\n- TypeScript is rising at **12.7%**\n\n> Use split views to show related content side by side.",
            },
        },
        "right": {
            "viewUrl": CDN_URL["chart"],
            "structuredContent": {
                "type": "chart",
                "version": "1.0",
                "title": "Language Share",
                "chartType": "pie",
                "data": [
                    {
                        "label": "Share",
                        "values": [
                            {"label": "Python", "value": 28.1},
                            {"label": "JavaScript", "value": 21.3},
                            {"label": "TypeScript", "value": 12.7},
                            {"label": "Other", "value": 37.9},
                        ],
                    }
                ],
            },
        },
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Split view: documentation + chart."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 10. Tabs ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["tabs"], "viewUrl": CDN_URL["tabs"]}},
    annotations=READ_ONLY,
)
async def show_tabs() -> CallToolResult:
    """Show a tabbed view with map, table, and chart tabs."""
    structured = {
        "type": "tabs",
        "version": "1.0",
        "activeTab": "map-tab",
        "tabs": [
            {
                "id": "map-tab",
                "label": "Map",
                "viewUrl": CDN_URL["map"],
                "structuredContent": {
                    "type": "map",
                    "version": "1.0",
                    "center": {"lat": 48.8584, "lon": 2.2945},
                    "zoom": 5,
                    "layers": [
                        {
                            "id": "cities",
                            "label": "European Cities",
                            "features": {
                                "type": "FeatureCollection",
                                "features": [
                                    {
                                        "type": "Feature",
                                        "geometry": {
                                            "type": "Point",
                                            "coordinates": [lon, lat],
                                        },
                                        "properties": {"name": name},
                                    }
                                    for name, lat, lon in [
                                        ("Paris", 48.8566, 2.3522),
                                        ("London", 51.5074, -0.1278),
                                        ("Berlin", 52.5200, 13.4050),
                                        ("Rome", 41.9028, 12.4964),
                                        ("Madrid", 40.4168, -3.7038),
                                    ]
                                ],
                            },
                            "popup": {
                                "title": "{properties.name}",
                            },
                        }
                    ],
                },
            },
            {
                "id": "table-tab",
                "label": "Table",
                "viewUrl": CDN_URL["datatable"],
                "structuredContent": {
                    "type": "datatable",
                    "version": "1.0",
                    "title": "European Cities",
                    "sortable": True,
                    "columns": [
                        {"key": "city", "label": "City", "sortable": True},
                        {"key": "country", "label": "Country"},
                        {
                            "key": "population",
                            "label": "Population (M)",
                            "type": "number",
                            "sortable": True,
                        },
                    ],
                    "rows": [
                        {
                            "city": "Paris",
                            "country": "France",
                            "population": 2.16,
                        },
                        {
                            "city": "London",
                            "country": "UK",
                            "population": 8.98,
                        },
                        {
                            "city": "Berlin",
                            "country": "Germany",
                            "population": 3.64,
                        },
                        {
                            "city": "Rome",
                            "country": "Italy",
                            "population": 2.87,
                        },
                        {
                            "city": "Madrid",
                            "country": "Spain",
                            "population": 3.22,
                        },
                    ],
                },
            },
            {
                "id": "chart-tab",
                "label": "Chart",
                "viewUrl": CDN_URL["chart"],
                "structuredContent": {
                    "type": "chart",
                    "version": "1.0",
                    "title": "City Populations",
                    "chartType": "bar",
                    "data": [
                        {
                            "label": "Population (M)",
                            "values": [
                                {"label": "London", "value": 8.98},
                                {"label": "Berlin", "value": 3.64},
                                {"label": "Madrid", "value": 3.22},
                                {"label": "Rome", "value": 2.87},
                                {"label": "Paris", "value": 2.16},
                            ],
                        }
                    ],
                },
            },
            {
                "id": "form-tab",
                "label": "Feedback",
                "viewUrl": CDN_URL["form"],
                "structuredContent": {
                    "type": "form",
                    "version": "1.0",
                    "title": "City Feedback",
                    "description": "Share your thoughts about these European cities.",
                    "submitTool": "handle_feedback",
                    "submitLabel": "Send Feedback",
                    "schema": {
                        "type": "object",
                        "required": ["name", "message"],
                        "properties": {
                            "name": {"type": "string", "title": "Your Name"},
                            "city": {
                                "type": "string",
                                "title": "Favourite City",
                                "enum": [
                                    "Paris",
                                    "London",
                                    "Berlin",
                                    "Rome",
                                    "Madrid",
                                ],
                            },
                            "visited": {
                                "type": "boolean",
                                "title": "I have visited this city",
                            },
                            "rating": {
                                "type": "number",
                                "title": "Rating",
                                "minimum": 1,
                                "maximum": 10,
                            },
                            "message": {
                                "type": "string",
                                "title": "Comments",
                            },
                        },
                    },
                    "uiSchema": {
                        "fields": {
                            "rating": {"widget": "slider"},
                            "message": {
                                "widget": "textarea",
                                "placeholder": "What did you enjoy most?",
                            },
                        },
                    },
                    "initialValues": {"rating": 5, "visited": False},
                },
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Tabbed view: 4 tabs (map, table, chart, form)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 11. Detail ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["detail"], "viewUrl": CDN_URL["detail"]}},
    annotations=READ_ONLY,
)
async def show_detail() -> CallToolResult:
    """Show a heritage monument detail card with key-value fields and actions."""
    structured = {
        "type": "detail",
        "version": "1.0",
        "title": "Stonehenge",
        "subtitle": "Scheduled Monument — National Heritage List for England",
        "fields": [
            {"label": "Name", "value": "Stonehenge"},
            {"label": "Type", "value": "Stone Circle"},
            {"label": "Period", "value": "Neolithic to Bronze Age"},
            {"label": "Location", "value": "Wiltshire, England"},
            {"label": "Grid Reference", "value": "SU 1224 4218"},
            {"label": "Grade", "value": "Grade I Listed"},
            {"label": "Designation Date", "value": "1882-01-01"},
            {"label": "Condition", "value": "Generally satisfactory"},
        ],
        "actions": [
            {"label": "Show on Map", "tool": "show_map", "arguments": {}},
            {"label": "Export Record", "tool": "show_country_detail", "arguments": {"country": "United Kingdom"}},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Showing detail card for Stonehenge — a Scheduled Monument."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 12. Counter ─────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["counter"], "viewUrl": CDN_URL["counter"]}},
    annotations=READ_ONLY,
)
async def show_counter() -> CallToolResult:
    """Show a single metric counter with trend indicator."""
    structured = {
        "type": "counter",
        "version": "1.0",
        "label": "Listed Buildings",
        "value": 376842,
        "prefix": "",
        "suffix": "",
        "trend": {"direction": "up", "value": 2.3, "label": "vs last year"},
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Counter: 376,842 Listed Buildings (+2.3% vs last year)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 13. Code ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["code"], "viewUrl": CDN_URL["code"]}},
    annotations=READ_ONLY,
)
async def show_code() -> CallToolResult:
    """Show a syntax-highlighted code block with an MCP tool example."""
    structured = {
        "type": "code",
        "version": "1.0",
        "title": "MCP Tool Implementation",
        "language": "python",
        "code": (
            "from mcp.server.fastmcp import FastMCP\n"
            "\n"
            "mcp = FastMCP('my-server')\n"
            "\n"
            "@mcp.tool()\n"
            "async def hello(name: str) -> str:\n"
            "    return f'Hello, {name}!'\n"
        ),
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Showing syntax-highlighted Python code for an MCP tool."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 14. Status ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["status"], "viewUrl": CDN_URL["status"]}},
    annotations=READ_ONLY,
)
async def show_status() -> CallToolResult:
    """Show a system health status board with multiple service checks."""
    structured = {
        "type": "status",
        "version": "1.0",
        "title": "System Health",
        "items": [
            {"label": "API Server", "status": "ok", "message": "All endpoints responding"},
            {"label": "Database", "status": "ok", "message": "Connected, 12ms latency"},
            {"label": "CDN", "status": "warning", "message": "Cache hit rate 78%"},
            {"label": "Worker Queue", "status": "error", "message": "3 failed jobs"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="System Health: API ok, Database ok, CDN warning, Worker Queue error."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 15. Timeline ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["timeline"], "viewUrl": CDN_URL["timeline"]}},
    annotations=READ_ONLY,
)
async def show_timeline() -> CallToolResult:
    """Show project milestones on a chronological timeline."""
    structured = {
        "type": "timeline",
        "version": "1.0",
        "title": "Project Milestones",
        "events": [
            {"date": "2025-01-15", "title": "Project kickoff", "description": "Initial planning meeting"},
            {"date": "2025-03-01", "title": "v1.0 release", "description": "Core views shipped"},
            {"date": "2025-06-15", "title": "v2.0 composable", "description": "Dashboard runtime and cross-view links"},
            {"date": "2025-09-01", "title": "v3.0 dynamic", "description": "Conversation-driven UI with patch engine"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Timeline: 4 project milestones from kickoff to v3.0."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 16. Gallery ─────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["gallery"], "viewUrl": CDN_URL["gallery"]}},
    annotations=READ_ONLY,
)
async def show_gallery() -> CallToolResult:
    """Show an architecture photo gallery with lightbox support."""
    structured = {
        "type": "gallery",
        "version": "1.0",
        "title": "Architecture Gallery",
        "items": [
            {
                "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/800px-Tour_Eiffel_Wikimedia_Commons.jpg",
                "title": "Eiffel Tower",
                "caption": "Paris, France",
            },
            {
                "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg",
                "title": "Colosseum",
                "caption": "Rome, Italy",
            },
            {
                "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg",
                "title": "Empire State Building",
                "caption": "New York, USA",
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Gallery: 3 architectural landmarks with lightbox."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 17. Kanban ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["kanban"], "viewUrl": CDN_URL["kanban"]}},
    annotations=READ_ONLY,
)
async def show_kanban() -> CallToolResult:
    """Show a sprint board with To Do, In Progress, and Done columns."""
    structured = {
        "type": "kanban",
        "version": "1.0",
        "title": "Sprint Board",
        "columns": [
            {
                "id": "todo",
                "title": "To Do",
                "items": [
                    {"id": "1", "title": "Add auth middleware", "tags": ["backend"]},
                    {"id": "2", "title": "Design settings page", "tags": ["frontend"]},
                ],
            },
            {
                "id": "in-progress",
                "title": "In Progress",
                "items": [
                    {"id": "3", "title": "Implement search API", "tags": ["backend", "api"]},
                ],
            },
            {
                "id": "done",
                "title": "Done",
                "items": [
                    {"id": "4", "title": "Setup CI pipeline", "tags": ["devops"]},
                    {"id": "5", "title": "Write unit tests", "tags": ["testing"]},
                ],
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Kanban: Sprint board with 3 columns and 5 items."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 18. Composable Dashboard (v2.0) ────────────────────────────────────────


# ── Monument dataset (shared by composable dashboard + interactive tools) ───

MONUMENTS = [
    ("stonehenge", "Stonehenge", "Stone Circle", "Neolithic", 51.1789, -1.8262,
     "Prehistoric monument consisting of a ring of standing stones, each around 4m high.",
     "Grade I", "English Heritage"),
    ("hadrians-wall", "Hadrian's Wall", "Frontier Wall", "Roman", 55.0240, -2.2593,
     "Defensive fortification built by the Romans across northern England, spanning 73 miles.",
     "Grade I", "English Heritage"),
    ("maiden-castle", "Maiden Castle", "Hillfort", "Iron Age", 50.6940, -2.4710,
     "One of the largest and most complex hillforts in Europe, with massive ramparts.",
     "Scheduled", "English Heritage"),
    ("avebury", "Avebury", "Stone Circle", "Neolithic", 51.4288, -1.8544,
     "The largest megalithic stone circle in the world, enclosing part of Avebury village.",
     "Grade I", "National Trust"),
    ("old-sarum", "Old Sarum", "Castle & Settlement", "Iron Age", 51.0925, -1.8103,
     "Iron Age hillfort reused as a Norman castle and early medieval cathedral site.",
     "Scheduled", "English Heritage"),
    ("bath-roman", "Roman Baths", "Bath House", "Roman", 51.3811, -2.3590,
     "Well-preserved Roman bathing complex fed by natural hot springs.",
     "Grade I", "Bath & NE Somerset Council"),
    ("skara-brae", "Skara Brae", "Settlement", "Neolithic", 59.0488, -3.3415,
     "Neolithic settlement of eight clustered houses, older than Stonehenge and the Pyramids.",
     "Scheduled", "Historic Scotland"),
    ("tintagel", "Tintagel Castle", "Castle", "Medieval", 50.6685, -4.7578,
     "Ruined medieval castle associated with the legends of King Arthur.",
     "Grade I", "English Heritage"),
    ("silbury-hill", "Silbury Hill", "Mound", "Neolithic", 51.4158, -1.8575,
     "The tallest prehistoric man-made mound in Europe, 30m high and 160m in diameter.",
     "Scheduled", "English Heritage"),
    ("caernarfon", "Caernarfon Castle", "Castle", "Medieval", 53.1393, -4.2767,
     "Imposing medieval fortress built by Edward I, a UNESCO World Heritage Site.",
     "Grade I", "Cadw"),
]

# Indexed for fast lookup
_MONUMENT_BY_ID = {m[0]: m for m in MONUMENTS}


def _build_monument_geojson(monuments_subset):
    """Build GeoJSON FeatureCollection from monument tuples."""
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "feature_id": mid, "name": name,
                    "type": mtype, "period": period,
                },
            }
            for mid, name, mtype, period, lat, lon, *_ in monuments_subset
        ],
    }


def _build_monument_rows(monuments_subset):
    """Build datatable rows from monument tuples."""
    return [
        {"id": mid, "name": name, "type": mtype, "period": period}
        for mid, name, mtype, period, *_ in monuments_subset
    ]


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["dashboard"], "viewUrl": CDN_URL["dashboard"]}},
    annotations=READ_ONLY,
)
async def show_composable_dashboard() -> CallToolResult:
    """Show a v2.0 composable dashboard with cross-view selection linking.

    This is an interactive heritage investigation board. After it loads:
    - Click a marker on the map or a row in the table to select a monument
    - The selection is automatically linked between map and table
    - Call filter_monuments(period=...) to filter by historical period
    - Call inspect_monument(monument_id=...) to show detailed info in the detail panel
    - Call add_chart_analysis() to add a chart panel breaking down monuments by period
    """
    from collections import Counter

    period_counts = Counter(m[3] for m in MONUMENTS)
    period_colors = {
        "Neolithic": "#8b5cf6", "Iron Age": "#f59e0b",
        "Roman": "#ef4444", "Medieval": "#3b82f6",
    }

    structured = {
        "type": "dashboard",
        "version": "2.0",
        "title": "Heritage Investigation Board",
        "layout": {"type": "named", "preset": "investigation"},
        "panels": [
            {
                "id": "map",
                "label": "Map",
                "viewType": "map",
                "selectionField": "feature_id",
                "structuredContent": {
                    "type": "map",
                    "version": "1.0",
                    "center": {"lat": 53.0, "lon": -2.5},
                    "zoom": 6,
                    "layers": [
                        {
                            "id": "monuments",
                            "label": "Scheduled Monuments",
                            "features": _build_monument_geojson(MONUMENTS),
                            "popup": {
                                "title": "{properties.name}",
                                "fields": ["type", "period"],
                            },
                        }
                    ],
                },
            },
            {
                "id": "table",
                "label": "Monuments",
                "viewType": "datatable",
                "selectionField": "id",
                "structuredContent": {
                    "type": "datatable",
                    "version": "1.0",
                    "title": "Scheduled Monuments",
                    "sortable": True,
                    "filterable": True,
                    "columns": [
                        {"key": "name", "label": "Name", "sortable": True},
                        {
                            "key": "type",
                            "label": "Type",
                            "type": "badge",
                            "badgeColors": {
                                "Stone Circle": "#8b5cf6", "Frontier Wall": "#ef4444",
                                "Hillfort": "#f59e0b", "Castle & Settlement": "#3b82f6",
                                "Castle": "#3b82f6", "Bath House": "#ef4444",
                                "Settlement": "#8b5cf6", "Mound": "#8b5cf6",
                            },
                        },
                        {
                            "key": "period",
                            "label": "Period",
                            "sortable": True,
                            "type": "badge",
                            "badgeColors": period_colors,
                        },
                    ],
                    "rows": _build_monument_rows(MONUMENTS),
                    "actions": [
                        {
                            "label": "Inspect",
                            "tool": "inspect_monument",
                            "arguments": {"monument_id": "{id}"},
                        },
                    ],
                },
            },
            {
                "id": "detail",
                "label": "Detail",
                "viewType": "detail",
                "structuredContent": {
                    "type": "detail",
                    "version": "1.0",
                    "title": "Select a monument",
                    "subtitle": "Click a marker on the map or a row in the table, then call inspect_monument",
                    "fields": [
                        {"label": "Monuments loaded", "value": str(len(MONUMENTS)), "type": "text"},
                        {"label": "Periods", "value": ", ".join(sorted(period_counts.keys())), "type": "text"},
                    ],
                },
            },
        ],
        "links": [
            {
                "source": "map",
                "target": "table",
                "type": "selection",
                "sourceField": "feature_id",
                "targetField": "id",
                "bidirectional": True,
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(
                type="text",
                text=(
                    f"Heritage Investigation Board: {len(MONUMENTS)} monuments across "
                    f"{len(period_counts)} historical periods.\n\n"
                    "Interactive tools available:\n"
                    "- inspect_monument(monument_id) — show monument details in the detail panel\n"
                    "- filter_monuments(period) — filter map and table by period\n"
                    "- add_chart_analysis() — add a chart panel showing period breakdown\n"
                    "- reset_dashboard() — reset all panels to original state"
                ),
            ),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── Interactive dashboard tools (return ui_patch to modify live dashboard) ──


@mcp.tool(
    annotations=READ_ONLY,
)
async def inspect_monument(monument_id: str) -> CallToolResult:
    """Show detailed information about a monument in the dashboard's detail panel.

    Call this when the user selects a monument on the map or table.
    Returns a ui_patch that updates the detail panel with rich content.
    """
    m = _MONUMENT_BY_ID.get(monument_id)
    if not m:
        return CallToolResult(
            content=[TextContent(type="text", text=f"Monument '{monument_id}' not found.")],
        )

    mid, name, mtype, period, lat, lon, desc, grade, custodian = m

    structured = {
        "type": "ui_patch",
        "version": "3.0",
        "ops": [
            {
                "op": "update-panel",
                "panelId": "detail",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "detail",
                        "version": "1.0",
                        "title": name,
                        "subtitle": desc,
                        "fields": [
                            {"label": "Type", "value": mtype, "type": "badge"},
                            {"label": "Period", "value": period, "type": "badge"},
                            {"label": "Grade", "value": grade, "type": "text"},
                            {"label": "Custodian", "value": custodian, "type": "text"},
                            {"label": "Latitude", "value": f"{lat:.4f}", "type": "text"},
                            {"label": "Longitude", "value": f"{lon:.4f}", "type": "text"},
                        ],
                        "actions": [
                            {
                                "label": "Show on Map",
                                "tool": "zoom_to_monument",
                                "args": {"monument_id": mid},
                            },
                            {
                                "label": "Find Nearby",
                                "tool": "find_nearby_monuments",
                                "args": {"monument_id": mid, "radius_km": 50},
                            },
                        ],
                    },
                },
            },
            {
                "op": "show-panel",
                "panelId": "detail",
                "visible": True,
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Showing details for {name} ({period} {mtype})."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=READ_ONLY,
)
async def filter_monuments(period: str = "", monument_type: str = "") -> CallToolResult:
    """Filter the dashboard's map and table by historical period or monument type.

    Returns a ui_patch that updates both the map layers and the table rows.
    Pass an empty string to clear filters and show all monuments.

    Args:
        period: Filter by period (Neolithic, Iron Age, Roman, Medieval). Empty = all.
        monument_type: Filter by type (Stone Circle, Hillfort, Castle, etc.). Empty = all.
    """
    filtered = MONUMENTS
    filters_applied = []

    if period:
        filtered = [m for m in filtered if m[3].lower() == period.lower()]
        filters_applied.append(f"period={period}")
    if monument_type:
        filtered = [m for m in filtered if m[2].lower() == monument_type.lower()]
        filters_applied.append(f"type={monument_type}")

    filter_label = f"Filtered: {', '.join(filters_applied)}" if filters_applied else "All Monuments"

    structured = {
        "type": "ui_patch",
        "version": "3.0",
        "ops": [
            {
                "op": "update-panel",
                "panelId": "map",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "map",
                        "version": "1.0",
                        "center": {"lat": 53.0, "lon": -2.5},
                        "zoom": 6,
                        "layers": [
                            {
                                "id": "monuments",
                                "label": filter_label,
                                "features": _build_monument_geojson(filtered),
                                "popup": {
                                    "title": "{properties.name}",
                                    "fields": ["type", "period"],
                                },
                            }
                        ],
                    },
                },
            },
            {
                "op": "update-panel",
                "panelId": "table",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "datatable",
                        "version": "1.0",
                        "title": filter_label,
                        "sortable": True,
                        "filterable": True,
                        "columns": [
                            {"key": "name", "label": "Name", "sortable": True},
                            {"key": "type", "label": "Type", "type": "badge"},
                            {"key": "period", "label": "Period", "sortable": True, "type": "badge"},
                        ],
                        "rows": _build_monument_rows(filtered),
                        "actions": [
                            {
                                "label": "Inspect",
                                "tool": "inspect_monument",
                                "arguments": {"monument_id": "{id}"},
                            },
                        ],
                    },
                },
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Filtered to {len(filtered)} monuments. {filter_label}."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=READ_ONLY,
)
async def add_chart_analysis() -> CallToolResult:
    """Add a chart panel to the dashboard showing monument breakdown by period.

    Returns a ui_patch with an add-panel op to insert a pie chart.
    """
    from collections import Counter

    period_counts = Counter(m[3] for m in MONUMENTS)

    structured = {
        "type": "ui_patch",
        "version": "3.0",
        "ops": [
            {
                "op": "add-panel",
                "panel": {
                    "id": "analysis",
                    "label": "Period Analysis",
                    "viewType": "chart",
                    "structuredContent": {
                        "type": "chart",
                        "version": "1.0",
                        "title": "Monuments by Period",
                        "chartType": "pie",
                        "data": [
                            {
                                "label": "Count",
                                "values": [
                                    {"label": period, "value": count}
                                    for period, count in period_counts.most_common()
                                ],
                            }
                        ],
                    },
                },
                "after": "table",
            },
            {
                "op": "update-layout",
                "layout": {"type": "grid", "columns": 2},
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Added chart panel: {len(period_counts)} periods across {len(MONUMENTS)} monuments."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=READ_ONLY,
)
async def reset_dashboard() -> CallToolResult:
    """Reset the dashboard to its original state: remove added panels, clear filters, restore all monuments."""
    structured = {
        "type": "ui_patch",
        "version": "3.0",
        "ops": [
            {
                "op": "remove-panel",
                "panelId": "analysis",
            },
            {
                "op": "update-panel",
                "panelId": "map",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "map",
                        "version": "1.0",
                        "center": {"lat": 53.0, "lon": -2.5},
                        "zoom": 6,
                        "layers": [
                            {
                                "id": "monuments",
                                "label": "Scheduled Monuments",
                                "features": _build_monument_geojson(MONUMENTS),
                                "popup": {
                                    "title": "{properties.name}",
                                    "fields": ["type", "period"],
                                },
                            }
                        ],
                    },
                },
            },
            {
                "op": "update-panel",
                "panelId": "table",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "datatable",
                        "version": "1.0",
                        "title": "Scheduled Monuments",
                        "sortable": True,
                        "filterable": True,
                        "columns": [
                            {"key": "name", "label": "Name", "sortable": True},
                            {"key": "type", "label": "Type", "type": "badge"},
                            {"key": "period", "label": "Period", "sortable": True, "type": "badge"},
                        ],
                        "rows": _build_monument_rows(MONUMENTS),
                        "actions": [
                            {
                                "label": "Inspect",
                                "tool": "inspect_monument",
                                "arguments": {"monument_id": "{id}"},
                            },
                        ],
                    },
                },
            },
            {
                "op": "update-panel",
                "panelId": "detail",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "detail",
                        "version": "1.0",
                        "title": "Select a monument",
                        "subtitle": "Click a marker on the map or a row in the table",
                        "fields": [
                            {"label": "Monuments loaded", "value": str(len(MONUMENTS)), "type": "text"},
                        ],
                    },
                },
            },
            {
                "op": "update-layout",
                "layout": {"type": "named", "preset": "investigation"},
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Dashboard reset to original state."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


@mcp.tool(
    annotations=READ_ONLY,
)
async def find_nearby_monuments(monument_id: str, radius_km: float = 50) -> CallToolResult:
    """Find monuments near a given monument and update the map to highlight them.

    Filters the map to show the selected monument plus nearby ones within radius_km.
    Updates the table to show only nearby results.
    """
    import math

    source = _MONUMENT_BY_ID.get(monument_id)
    if not source:
        return CallToolResult(
            content=[TextContent(type="text", text=f"Monument '{monument_id}' not found.")],
        )

    src_lat, src_lon = source[4], source[5]

    def haversine_km(lat1, lon1, lat2, lon2):
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        return R * 2 * math.asin(math.sqrt(a))

    nearby = []
    for m in MONUMENTS:
        dist = haversine_km(src_lat, src_lon, m[4], m[5])
        if dist <= radius_km:
            nearby.append(m)

    structured = {
        "type": "ui_patch",
        "version": "3.0",
        "ops": [
            {
                "op": "update-panel",
                "panelId": "map",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "map",
                        "version": "1.0",
                        "center": {"lat": src_lat, "lon": src_lon},
                        "zoom": 9,
                        "layers": [
                            {
                                "id": "nearby",
                                "label": f"Within {radius_km}km of {source[1]}",
                                "features": _build_monument_geojson(nearby),
                                "popup": {
                                    "title": "{properties.name}",
                                    "fields": ["type", "period"],
                                },
                            }
                        ],
                    },
                },
            },
            {
                "op": "update-panel",
                "panelId": "table",
                "action": "replace",
                "data": {
                    "structuredContent": {
                        "type": "datatable",
                        "version": "1.0",
                        "title": f"Nearby: {source[1]} ({radius_km}km)",
                        "sortable": True,
                        "columns": [
                            {"key": "name", "label": "Name", "sortable": True},
                            {"key": "type", "label": "Type", "type": "badge"},
                            {"key": "period", "label": "Period", "sortable": True},
                        ],
                        "rows": _build_monument_rows(nearby),
                        "actions": [
                            {
                                "label": "Inspect",
                                "tool": "inspect_monument",
                                "arguments": {"monument_id": "{id}"},
                            },
                        ],
                    },
                },
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Found {len(nearby)} monuments within {radius_km}km of {source[1]}."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 19. Gauge ───────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["gauge"], "viewUrl": CDN_URL["gauge"]}},
    annotations=READ_ONLY,
)
async def show_gauge() -> CallToolResult:
    """Show a radial gauge displaying system CPU usage with colour thresholds."""
    structured = {
        "type": "gauge",
        "version": "1.0",
        "title": "System CPU",
        "value": 67,
        "min": 0,
        "max": 100,
        "unit": "%",
        "thresholds": [
            {"value": 60, "color": "#22c55e"},
            {"value": 80, "color": "#f59e0b"},
            {"value": 100, "color": "#ef4444"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Gauge: System CPU at 67% (green < 60, amber < 80, red >= 80)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 20. Tree ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["tree"], "viewUrl": CDN_URL["tree"]}},
    annotations=READ_ONLY,
)
async def show_tree() -> CallToolResult:
    """Show a hierarchical project structure as an expandable tree."""
    structured = {
        "type": "tree",
        "version": "1.0",
        "title": "Project Structure",
        "nodes": [
            {
                "id": "root",
                "label": "chuk-mcp-ui",
                "children": [
                    {
                        "id": "apps",
                        "label": "apps/",
                        "children": [
                            {"id": "map", "label": "map/"},
                            {"id": "chart", "label": "chart/"},
                            {"id": "dashboard", "label": "dashboard/"},
                        ],
                    },
                    {
                        "id": "packages",
                        "label": "packages/",
                        "children": [
                            {"id": "shared", "label": "shared/"},
                            {"id": "ui", "label": "ui/"},
                        ],
                    },
                ],
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Tree: chuk-mcp-ui project structure with apps/ and packages/ branches."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 21. Progress ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["progress"], "viewUrl": CDN_URL["progress"]}},
    annotations=READ_ONLY,
)
async def show_progress() -> CallToolResult:
    """Show a multi-track progress display for a data pipeline."""
    structured = {
        "type": "progress",
        "version": "1.0",
        "title": "Data Pipeline",
        "overall": {"value": 68, "max": 100, "label": "Overall"},
        "tracks": [
            {"id": "ingest", "label": "Data Ingestion", "value": 100, "max": 100, "status": "complete", "detail": "12,480 records"},
            {"id": "validate", "label": "Validation", "value": 100, "max": 100, "status": "complete", "detail": "12,312 passed"},
            {"id": "transform", "label": "Transform", "value": 72, "max": 100, "status": "active", "detail": "Processing batch 18/25"},
            {"id": "load", "label": "Load to DB", "value": 0, "max": 100, "status": "pending", "detail": "Waiting..."},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Progress: Data pipeline at 68% — ingestion and validation complete, transform in progress."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 22. Confirm ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["confirm"], "viewUrl": CDN_URL["confirm"]}},
    annotations=READ_ONLY,
)
async def show_confirm() -> CallToolResult:
    """Show a confirmation dialog for a destructive action."""
    structured = {
        "type": "confirm",
        "version": "1.0",
        "title": "Delete Dataset",
        "message": "Are you sure you want to delete the 'Heritage Monuments 2024' dataset? This action cannot be undone.",
        "severity": "danger",
        "details": "This will permanently remove 12,480 records, 3 linked views, and all associated exports.",
        "confirmLabel": "Delete Dataset",
        "cancelLabel": "Keep Dataset",
        "confirmTool": "delete_dataset",
        "confirmArgs": {"dataset_id": "heritage-2024"},
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Confirm: Delete 'Heritage Monuments 2024' dataset (12,480 records)?"),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 23. JSON Viewer ────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["json"], "viewUrl": CDN_URL["json"]}},
    annotations=READ_ONLY,
)
async def show_json() -> CallToolResult:
    """Show an interactive JSON tree viewer with expandable nodes."""
    sample = {
        "server": {
            "name": "view-demo",
            "version": "2.0.0",
            "capabilities": {
                "tools": True,
                "resources": True,
                "prompts": False,
            },
        },
        "views": {
            "total": 51,
            "categories": {
                "core": 17,
                "interactive": 10,
                "developer": 7,
                "dataviz": 10,
                "specialist": 7,
            },
        },
        "deployment": {
            "provider": "fly.io",
            "region": "lhr",
            "url": "https://chuk-mcp-ui-views.fly.dev",
            "status": "healthy",
        },
    }

    structured = {
        "type": "json",
        "version": "1.0",
        "title": "Server Configuration",
        "data": sample,
        "expandDepth": 2,
        "searchable": True,
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="JSON viewer: Server configuration with 3 top-level sections."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 24. Compare ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["compare"], "viewUrl": CDN_URL["compare"]}},
    annotations=READ_ONLY,
)
async def show_compare() -> CallToolResult:
    """Show a before/after image comparison slider."""
    structured = {
        "type": "compare",
        "version": "1.0",
        "title": "Restoration Progress",
        "before": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Wilton_Diptych.jpg/800px-Wilton_Diptych.jpg",
            "alt": "Before restoration",
        },
        "after": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Wilton_Diptych.jpg/800px-Wilton_Diptych.jpg",
            "alt": "After restoration",
        },
        "labels": {"before": "Before", "after": "After"},
        "initialPosition": 50,
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Compare: Before/after restoration slider for the Wilton Diptych."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 25. Ranked ─────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["ranked"], "viewUrl": CDN_URL["ranked"]}},
    annotations=READ_ONLY,
)
async def show_ranked() -> CallToolResult:
    """Show a ranked leaderboard of programming languages."""
    structured = {
        "type": "ranked",
        "version": "1.0",
        "title": "Language Popularity Index",
        "maxScore": 100,
        "scoreLabel": "Score",
        "showDelta": True,
        "items": [
            {"id": "python", "rank": 1, "title": "Python", "score": 100.0, "previousRank": 1, "subtitle": "General purpose, AI/ML", "badges": ["Stable"]},
            {"id": "js", "rank": 2, "title": "JavaScript", "score": 75.8, "previousRank": 2, "subtitle": "Web, full-stack", "badges": ["Stable"]},
            {"id": "ts", "rank": 3, "title": "TypeScript", "score": 45.3, "previousRank": 5, "subtitle": "Typed JavaScript", "badges": ["Rising"]},
            {"id": "java", "rank": 4, "title": "Java", "score": 37.4, "previousRank": 3, "subtitle": "Enterprise, Android", "badges": ["Declining"]},
            {"id": "csharp", "rank": 5, "title": "C#", "score": 27.8, "previousRank": 4, "subtitle": ".NET, Unity", "badges": []},
            {"id": "go", "rank": 6, "title": "Go", "score": 18.5, "previousRank": 8, "subtitle": "Cloud, systems", "badges": ["Rising"]},
            {"id": "rust", "rank": 7, "title": "Rust", "score": 13.9, "previousRank": 10, "subtitle": "Systems, WASM", "badges": ["Rising"]},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Ranked: 7 programming languages with popularity scores and trend indicators."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 26. Poll ───────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["poll"], "viewUrl": CDN_URL["poll"]}},
    annotations=READ_ONLY,
)
async def show_poll() -> CallToolResult:
    """Show a developer preferences poll with multiple question types."""
    structured = {
        "type": "poll",
        "version": "1.0",
        "title": "Developer Survey 2026",
        "description": "Help us understand developer preferences.",
        "voteTool": "handle_poll_vote",
        "questions": [
            {
                "id": "editor",
                "type": "single",
                "prompt": "What is your primary code editor?",
                "options": [
                    {"id": "vscode", "label": "VS Code", "votes": 142},
                    {"id": "neovim", "label": "Neovim", "votes": 58},
                    {"id": "jetbrains", "label": "JetBrains", "votes": 45},
                    {"id": "cursor", "label": "Cursor", "votes": 37},
                ],
            },
            {
                "id": "lang",
                "type": "multiple",
                "prompt": "Which languages do you use regularly?",
                "maxSelections": 3,
                "options": [
                    {"id": "python", "label": "Python", "votes": 180},
                    {"id": "typescript", "label": "TypeScript", "votes": 156},
                    {"id": "go", "label": "Go", "votes": 78},
                    {"id": "rust", "label": "Rust", "votes": 42},
                ],
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Poll: Developer Survey with 2 questions on editor and language preferences."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 27. Quiz ───────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["quiz"], "viewUrl": CDN_URL["quiz"]}},
    annotations=READ_ONLY,
)
async def show_quiz() -> CallToolResult:
    """Show an interactive history trivia quiz."""
    structured = {
        "type": "quiz",
        "version": "1.0",
        "title": "Heritage History Quiz",
        "description": "Test your knowledge of British heritage sites.",
        "validateTool": "handle_quiz_answer",
        "questions": [
            {
                "id": "q1",
                "type": "single",
                "prompt": "When was Stonehenge built?",
                "points": 10,
                "options": [
                    {"id": "a", "label": "~500 BCE"},
                    {"id": "b", "label": "~3000 BCE"},
                    {"id": "c", "label": "~1000 CE"},
                    {"id": "d", "label": "~100 CE"},
                ],
                "explanation": "Stonehenge was built in stages, with the main stone circle erected around 2500 BCE.",
            },
            {
                "id": "q2",
                "type": "single",
                "prompt": "Which Roman emperor ordered the building of Hadrian's Wall?",
                "points": 10,
                "options": [
                    {"id": "a", "label": "Augustus"},
                    {"id": "b", "label": "Hadrian"},
                    {"id": "c", "label": "Nero"},
                    {"id": "d", "label": "Constantine"},
                ],
                "explanation": "Emperor Hadrian ordered its construction in 122 CE during his visit to Britain.",
            },
            {
                "id": "q3",
                "type": "single",
                "prompt": "Skara Brae is located in which part of Britain?",
                "points": 10,
                "options": [
                    {"id": "a", "label": "Cornwall"},
                    {"id": "b", "label": "Orkney, Scotland"},
                    {"id": "c", "label": "Yorkshire"},
                    {"id": "d", "label": "Wales"},
                ],
                "explanation": "Skara Brae is a Neolithic settlement on the west coast of Mainland, Orkney.",
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Quiz: Heritage History — 3 questions, 30 points total."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 28. Chat ───────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["chat"], "viewUrl": CDN_URL["chat"]}},
    annotations=READ_ONLY,
)
async def show_chat() -> CallToolResult:
    """Show a chat interface with sample conversation history."""
    structured = {
        "type": "chat",
        "version": "1.0",
        "title": "Heritage Assistant",
        "respondTool": "handle_chat_message",
        "placeholder": "Ask about heritage sites...",
        "suggestions": ["Tell me about Stonehenge", "What Roman sites are in England?", "Show me medieval castles"],
        "messages": [
            {"id": "1", "role": "user", "content": "What are the oldest heritage sites in England?", "timestamp": "2026-02-20T10:00:00Z"},
            {"id": "2", "role": "assistant", "content": "The oldest heritage sites in England date back to the Neolithic period (roughly 4000-2000 BCE). Notable examples include:\n\n- **Stonehenge** (~3000 BCE) — The iconic stone circle in Wiltshire\n- **Avebury** (~2850 BCE) — The largest megalithic stone circle in the world\n- **Silbury Hill** (~2400 BCE) — The tallest prehistoric man-made mound in Europe\n- **Skara Brae** (~3180 BCE) — A remarkably preserved Neolithic settlement in Orkney\n\nWould you like details about any of these sites?", "timestamp": "2026-02-20T10:00:05Z"},
            {"id": "3", "role": "user", "content": "Tell me more about Avebury", "timestamp": "2026-02-20T10:01:00Z"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Chat: Heritage Assistant with 3 messages and suggested prompts."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 29. Image ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["image"], "viewUrl": CDN_URL["image"]}},
    annotations=READ_ONLY,
)
async def show_image() -> CallToolResult:
    """Show an image viewer with annotations."""
    structured = {
        "type": "image",
        "version": "1.0",
        "title": "Stonehenge Aerial View",
        "images": [
            {
                "id": "aerial",
                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/1280px-Stonehenge2007_07_30.jpg",
                "alt": "Stonehenge from above",
                "caption": "Aerial photograph of Stonehenge showing the complete stone circle and surrounding earthworks.",
            },
            {
                "id": "closeup",
                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/800px-Tour_Eiffel_Wikimedia_Commons.jpg",
                "alt": "Eiffel Tower close-up",
                "caption": "The Eiffel Tower at sunset, Paris.",
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Image: 2 heritage images with captions."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 30. Log ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["log"], "viewUrl": CDN_URL["log"]}},
    annotations=READ_ONLY,
)
async def show_log() -> CallToolResult:
    """Show a structured log viewer with multiple severity levels."""
    structured = {
        "type": "log",
        "version": "1.0",
        "title": "Application Logs",
        "searchable": True,
        "showTimestamp": True,
        "monospace": True,
        "entries": [
            {"timestamp": "2026-02-20T09:00:01Z", "level": "info", "message": "Server started on port 8000", "source": "server"},
            {"timestamp": "2026-02-20T09:00:02Z", "level": "info", "message": "Connected to database (12ms)", "source": "db"},
            {"timestamp": "2026-02-20T09:00:03Z", "level": "info", "message": "Loaded 51 view resources", "source": "registry"},
            {"timestamp": "2026-02-20T09:00:15Z", "level": "debug", "message": "GET /health 200 2ms", "source": "http"},
            {"timestamp": "2026-02-20T09:01:22Z", "level": "info", "message": "Tool call: show_map (user-abc)", "source": "tools"},
            {"timestamp": "2026-02-20T09:01:23Z", "level": "debug", "message": "Fetching view HTML from CDN: map/v1", "source": "cdn"},
            {"timestamp": "2026-02-20T09:02:45Z", "level": "warning", "message": "Cache miss for view: dashboard/v1", "source": "cdn"},
            {"timestamp": "2026-02-20T09:03:10Z", "level": "error", "message": "Tool call failed: timeout after 30s", "source": "tools"},
            {"timestamp": "2026-02-20T09:03:10Z", "level": "info", "message": "Retrying tool call (attempt 2/3)", "source": "tools"},
            {"timestamp": "2026-02-20T09:03:12Z", "level": "info", "message": "Tool call succeeded on retry", "source": "tools"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Log: 10 application log entries across info, debug, warning, and error levels."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 31. Alert ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["alert"], "viewUrl": CDN_URL["alert"]}},
    annotations=READ_ONLY,
)
async def show_alert() -> CallToolResult:
    """Show a system alerts panel with multiple severity levels."""
    structured = {
        "type": "alert",
        "version": "1.0",
        "title": "System Alerts",
        "dismissible": True,
        "alerts": [
            {"id": "a1", "severity": "error", "title": "Database connection pool exhausted", "message": "All 20 connections in use. New queries are being queued.", "source": "PostgreSQL", "timestamp": "2026-02-20T09:03:00Z"},
            {"id": "a2", "severity": "warning", "title": "CDN cache hit rate below threshold", "message": "Cache hit rate dropped to 78% (threshold: 85%).", "source": "Fly.io CDN", "timestamp": "2026-02-20T09:02:30Z"},
            {"id": "a3", "severity": "info", "title": "Scheduled maintenance window", "message": "Database maintenance scheduled for 2026-02-21 02:00 UTC.", "source": "Operations", "timestamp": "2026-02-20T08:00:00Z"},
            {"id": "a4", "severity": "success", "title": "Deployment completed", "message": "v2.1.0 deployed to production. All health checks passing.", "source": "CI/CD", "timestamp": "2026-02-20T07:45:00Z"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Alerts: 4 system alerts — 1 error, 1 warning, 1 info, 1 success."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 32. Diff ───────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["diff"], "viewUrl": CDN_URL["diff"]}},
    annotations=READ_ONLY,
)
async def show_diff() -> CallToolResult:
    """Show a side-by-side code diff viewer."""
    structured = {
        "type": "diff",
        "version": "1.0",
        "title": "schema.ts changes",
        "language": "typescript",
        "fileA": "schema.ts (before)",
        "fileB": "schema.ts (after)",
        "hunks": [
            {
                "headerA": "@@ -1,6 +1,8 @@",
                "lines": [
                    {"type": "context", "content": "export interface PanelV1 {", "lineA": 1, "lineB": 1},
                    {"type": "context", "content": "  id: string;", "lineA": 2, "lineB": 2},
                    {"type": "remove", "content": "  viewUrl: string;", "lineA": 3},
                    {"type": "add", "content": "  viewUrl?: string;", "lineB": 3},
                    {"type": "add", "content": "  viewType?: string;", "lineB": 4},
                    {"type": "context", "content": "  label?: string;", "lineA": 4, "lineB": 5},
                    {"type": "add", "content": "  selectionField?: string;", "lineB": 6},
                    {"type": "context", "content": "  structuredContent: unknown;", "lineA": 5, "lineB": 7},
                    {"type": "context", "content": "}", "lineA": 6, "lineB": 8},
                ],
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Diff: schema.ts — viewUrl made optional, viewType and selectionField added."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 33. Embed ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["embed"], "viewUrl": CDN_URL["embed"]}},
    annotations=READ_ONLY,
)
async def show_embed() -> CallToolResult:
    """Show an embedded webpage in an iframe."""
    structured = {
        "type": "embed",
        "version": "1.0",
        "title": "MCP Specification",
        "url": "https://spec.modelcontextprotocol.io",
        "aspectRatio": "16:9",
        "fallbackText": "Visit https://spec.modelcontextprotocol.io to view the MCP specification.",
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Embed: MCP specification website."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 34. Filter ─────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["filter"], "viewUrl": CDN_URL["filter"]}},
    annotations=READ_ONLY,
)
async def show_filter() -> CallToolResult:
    """Show a filter panel with multiple control types."""
    structured = {
        "type": "filter",
        "version": "1.0",
        "title": "Monument Search",
        "layout": "vertical",
        "submitMode": "auto",
        "filters": [
            {"id": "name", "label": "Name", "type": "text", "placeholder": "Search by name..."},
            {"id": "period", "label": "Historical Period", "type": "select", "options": [
                {"value": "neolithic", "label": "Neolithic"},
                {"value": "iron-age", "label": "Iron Age"},
                {"value": "roman", "label": "Roman"},
                {"value": "medieval", "label": "Medieval"},
            ]},
            {"id": "type", "label": "Monument Type", "type": "multi-select", "options": [
                {"value": "stone-circle", "label": "Stone Circle"},
                {"value": "hillfort", "label": "Hillfort"},
                {"value": "castle", "label": "Castle"},
                {"value": "settlement", "label": "Settlement"},
            ]},
            {"id": "grade", "label": "Minimum Grade", "type": "range", "min": 1, "max": 3, "defaultValue": 1},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Filter: Monument search with text, select, multi-select, and range controls."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 35. Settings ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["settings"], "viewUrl": CDN_URL["settings"]}},
    annotations=READ_ONLY,
)
async def show_settings() -> CallToolResult:
    """Show an application settings panel with grouped controls."""
    structured = {
        "type": "settings",
        "version": "1.0",
        "title": "Application Settings",
        "saveTool": "handle_save_settings",
        "sections": [
            {
                "id": "appearance",
                "title": "Appearance",
                "fields": [
                    {"id": "theme", "label": "Theme", "type": "select", "value": "system", "options": [
                        {"value": "light", "label": "Light"},
                        {"value": "dark", "label": "Dark"},
                        {"value": "system", "label": "System"},
                    ]},
                    {"id": "font_size", "label": "Font Size", "type": "range", "value": 14, "min": 10, "max": 24, "step": 1},
                    {"id": "animations", "label": "Enable Animations", "type": "toggle", "value": True},
                ],
            },
            {
                "id": "data",
                "title": "Data & Privacy",
                "description": "Control how your data is handled.",
                "fields": [
                    {"id": "analytics", "label": "Usage Analytics", "type": "toggle", "value": False, "description": "Help improve the product by sending anonymous usage data."},
                    {"id": "cache_ttl", "label": "Cache Duration (min)", "type": "number", "value": 15, "min": 1, "max": 60},
                    {"id": "export_format", "label": "Export Format", "type": "select", "value": "json", "options": [
                        {"value": "json", "label": "JSON"},
                        {"value": "csv", "label": "CSV"},
                        {"value": "geojson", "label": "GeoJSON"},
                    ]},
                ],
            },
            {
                "id": "notifications",
                "title": "Notifications",
                "collapsible": True,
                "collapsed": True,
                "fields": [
                    {"id": "email_alerts", "label": "Email Alerts", "type": "toggle", "value": True},
                    {"id": "alert_threshold", "label": "Alert Threshold", "type": "select", "value": "warning", "options": [
                        {"value": "info", "label": "Info"},
                        {"value": "warning", "label": "Warning"},
                        {"value": "error", "label": "Error only"},
                    ]},
                ],
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Settings: 3 sections — Appearance, Data & Privacy, Notifications."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 36. Stepper ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["stepper"], "viewUrl": CDN_URL["stepper"]}},
    annotations=READ_ONLY,
)
async def show_stepper() -> CallToolResult:
    """Show a multi-step wizard for data import."""
    structured = {
        "type": "stepper",
        "version": "1.0",
        "title": "Data Import Wizard",
        "activeStep": "validate",
        "steps": [
            {"id": "upload", "label": "Upload", "status": "complete", "description": "Select data file"},
            {"id": "validate", "label": "Validate", "status": "active", "description": "Check data quality", "detail": "Validating 12,480 records..."},
            {"id": "map", "label": "Map Fields", "status": "pending", "description": "Map to schema"},
            {"id": "import", "label": "Import", "status": "pending", "description": "Load into database"},
            {"id": "verify", "label": "Verify", "status": "pending", "description": "Confirm results"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Stepper: Data Import Wizard — 5 steps, currently validating (step 2 of 5)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 37. Heatmap ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["heatmap"], "viewUrl": CDN_URL["heatmap"]}},
    annotations=READ_ONLY,
)
async def show_heatmap() -> CallToolResult:
    """Show an activity heatmap of commit counts by day of week and hour."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    hours = [f"{h:02d}:00" for h in range(24)]

    values = [
        [0, 0, 0, 0, 0, 1, 2, 5, 12, 18, 21, 19, 14, 17, 20, 22, 18, 15, 8, 4, 2, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 3, 7, 15, 22, 25, 23, 16, 19, 24, 26, 21, 17, 9, 5, 3, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 6, 14, 20, 23, 21, 15, 18, 22, 24, 19, 14, 7, 3, 2, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 3, 6, 13, 19, 22, 20, 14, 17, 21, 23, 18, 13, 7, 4, 2, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 5, 11, 16, 19, 17, 12, 15, 18, 16, 12, 8, 4, 2, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 6, 5, 3, 4, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 4, 3, 2, 3, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0],
    ]

    structured = {
        "type": "heatmap",
        "version": "1.0",
        "title": "Commit Activity Heatmap",
        "rows": days,
        "columns": hours,
        "values": values,
        "colorScale": {"min": "#f0fdf4", "max": "#166534"},
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Heatmap: commit activity by day of week and hour. Peak on Tuesday afternoons."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 38. Crosstab ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["crosstab"], "viewUrl": CDN_URL["crosstab"]}},
    annotations=READ_ONLY,
)
async def show_crosstab() -> CallToolResult:
    """Show a cross-tabulation of heritage monument counts by period vs type."""
    structured = {
        "type": "crosstab",
        "version": "1.0",
        "title": "Monuments: Period vs Type",
        "rowHeaders": ["Neolithic", "Iron Age", "Roman", "Medieval", "Post-Medieval"],
        "columnHeaders": ["Stone Circle", "Hillfort", "Castle", "Settlement", "Bath House", "Church"],
        "values": [
            [12, 0, 0, 4, 0, 0],
            [0, 23, 0, 8, 0, 0],
            [0, 0, 3, 6, 9, 0],
            [0, 0, 47, 15, 0, 32],
            [0, 0, 5, 22, 0, 18],
        ],
        "showTotals": True,
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Crosstab: monument counts by period vs type. Medieval castles dominate with 47."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 39. Scatter ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["scatter"], "viewUrl": CDN_URL["scatter"]}},
    annotations=READ_ONLY,
)
async def show_scatter() -> CallToolResult:
    """Show a scatter plot of city population vs GDP across three regions."""
    structured = {
        "type": "scatter",
        "version": "1.0",
        "title": "City Population vs GDP",
        "xAxis": {"label": "Population (millions)", "min": 0, "max": 40},
        "yAxis": {"label": "GDP ($ billions)", "min": 0, "max": 2000},
        "datasets": [
            {
                "label": "European Cities",
                "color": "#3b82f6",
                "points": [
                    {"x": 2.16, "y": 850, "label": "Paris"},
                    {"x": 8.98, "y": 1100, "label": "London"},
                    {"x": 3.64, "y": 470, "label": "Berlin"},
                    {"x": 2.87, "y": 320, "label": "Rome"},
                    {"x": 3.22, "y": 390, "label": "Madrid"},
                ],
            },
            {
                "label": "Asian Cities",
                "color": "#ef4444",
                "points": [
                    {"x": 13.96, "y": 1920, "label": "Tokyo"},
                    {"x": 9.78, "y": 490, "label": "Seoul"},
                    {"x": 21.54, "y": 610, "label": "Mumbai"},
                    {"x": 24.28, "y": 520, "label": "Shanghai"},
                ],
            },
            {
                "label": "American Cities",
                "color": "#22c55e",
                "points": [
                    {"x": 8.34, "y": 1500, "label": "New York"},
                    {"x": 3.90, "y": 780, "label": "Los Angeles"},
                    {"x": 2.70, "y": 690, "label": "Chicago"},
                    {"x": 12.25, "y": 480, "label": "São Paulo"},
                ],
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Scatter: 13 cities across 3 regions. Tokyo leads in GDP; Shanghai in population."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 40. Boxplot ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["boxplot"], "viewUrl": CDN_URL["boxplot"]}},
    annotations=READ_ONLY,
)
async def show_boxplot() -> CallToolResult:
    """Show box plots for API response times across different services."""
    structured = {
        "type": "boxplot",
        "version": "1.0",
        "title": "API Response Times by Service",
        "yAxis": {"label": "Response Time (ms)"},
        "groups": [
            {"label": "Auth Service", "stats": {"min": 12, "q1": 28, "median": 45, "q3": 78, "max": 142, "outliers": [210, 345]}},
            {"label": "User API", "stats": {"min": 18, "q1": 42, "median": 65, "q3": 98, "max": 180, "outliers": [290]}},
            {"label": "Search API", "stats": {"min": 45, "q1": 120, "median": 195, "q3": 310, "max": 520, "outliers": [780, 1200]}},
            {"label": "Payment Gateway", "stats": {"min": 85, "q1": 150, "median": 230, "q3": 380, "max": 610, "outliers": [950]}},
            {"label": "CDN Edge", "stats": {"min": 2, "q1": 8, "median": 15, "q3": 28, "max": 52, "outliers": []}},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Boxplot: API response times across 5 services. CDN fastest (15ms median), Search slowest (195ms)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 41. Timeseries ────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["timeseries"], "viewUrl": CDN_URL["timeseries"]}},
    annotations=READ_ONLY,
)
async def show_timeseries() -> CallToolResult:
    """Show server CPU and memory usage over a 24-hour period."""
    import math

    cpu_data = []
    mem_data = []
    for i in range(48):
        hour = i / 2
        t = f"2026-02-20T{int(hour):02d}:{(i % 2) * 30:02d}:00Z"
        cpu_base = 25 + 40 * math.exp(-0.5 * ((hour - 14) / 4) ** 2)
        cpu_data.append({"t": t, "v": round(max(5, min(95, cpu_base + (i % 7) * 2 - 5)), 1)})
        mem_base = 45 + 25 * math.exp(-0.5 * ((hour - 15) / 5) ** 2)
        mem_data.append({"t": t, "v": round(max(30, min(90, mem_base + (i % 5) * 1.5)), 1)})

    structured = {
        "type": "timeseries",
        "version": "1.0",
        "title": "Server Metrics — 24h",
        "xAxis": {"label": "Time"},
        "yAxis": {"label": "Usage (%)", "min": 0, "max": 100},
        "series": [
            {"label": "CPU Usage", "color": "#3b82f6", "data": cpu_data},
            {"label": "Memory Usage", "color": "#ef4444", "data": mem_data},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Timeseries: CPU and memory over 24h (48 points each). CPU peaks ~65% at 14:00."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 42. Treemap ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["treemap"], "viewUrl": CDN_URL["treemap"]}},
    annotations=READ_ONLY,
)
async def show_treemap() -> CallToolResult:
    """Show a treemap of disk usage by directory."""
    structured = {
        "type": "treemap",
        "version": "1.0",
        "title": "Disk Usage — /home/user",
        "root": {
            "id": "root",
            "label": "/home/user",
            "children": [
                {"id": "media", "label": "Media", "value": 52000, "children": [
                    {"id": "photos", "label": "Photos", "value": 28000},
                    {"id": "videos", "label": "Videos", "value": 19000},
                    {"id": "music", "label": "Music", "value": 5000},
                ]},
                {"id": "docs", "label": "Documents", "value": 35000, "children": [
                    {"id": "projects", "label": "Projects", "value": 18000},
                    {"id": "reports", "label": "Reports", "value": 12000},
                    {"id": "misc", "label": "Misc", "value": 5000},
                ]},
                {"id": "code", "label": "Code", "value": 24000, "children": [
                    {"id": "repos", "label": "Repositories", "value": 15000},
                    {"id": "venvs", "label": "Virtual Envs", "value": 6000},
                    {"id": "cache", "label": "Build Cache", "value": 3000},
                ]},
                {"id": "downloads", "label": "Downloads", "value": 12000},
                {"id": "system", "label": "System/Config", "value": 5000},
            ],
        },
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Treemap: disk usage (128 GB). Media largest at 52 GB, then Documents 35 GB."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 43. Sunburst ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["sunburst"], "viewUrl": CDN_URL["sunburst"]}},
    annotations=READ_ONLY,
)
async def show_sunburst() -> CallToolResult:
    """Show a sunburst chart of heritage monuments by period then type."""
    structured = {
        "type": "sunburst",
        "version": "1.0",
        "title": "Heritage Monuments — Period > Type",
        "root": {
            "id": "all",
            "label": "All Monuments",
            "children": [
                {"id": "neolithic", "label": "Neolithic", "color": "#8b5cf6", "children": [
                    {"id": "neo-circle", "label": "Stone Circle", "value": 12},
                    {"id": "neo-settle", "label": "Settlement", "value": 4},
                    {"id": "neo-mound", "label": "Mound", "value": 7},
                    {"id": "neo-tomb", "label": "Chambered Tomb", "value": 9},
                ]},
                {"id": "iron-age", "label": "Iron Age", "color": "#f59e0b", "children": [
                    {"id": "ia-hillfort", "label": "Hillfort", "value": 23},
                    {"id": "ia-settle", "label": "Settlement", "value": 8},
                    {"id": "ia-broch", "label": "Broch", "value": 5},
                ]},
                {"id": "roman", "label": "Roman", "color": "#ef4444", "children": [
                    {"id": "rom-fort", "label": "Fort", "value": 14},
                    {"id": "rom-villa", "label": "Villa", "value": 11},
                    {"id": "rom-bath", "label": "Bath House", "value": 9},
                    {"id": "rom-road", "label": "Road", "value": 6},
                ]},
                {"id": "medieval", "label": "Medieval", "color": "#3b82f6", "children": [
                    {"id": "med-castle", "label": "Castle", "value": 47},
                    {"id": "med-church", "label": "Church", "value": 32},
                    {"id": "med-abbey", "label": "Abbey", "value": 18},
                    {"id": "med-settle", "label": "Settlement", "value": 15},
                ]},
            ],
        },
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Sunburst: monuments by period > type. Medieval dominates (112), castles largest (47)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 44. Pivot ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["pivot"], "viewUrl": CDN_URL["pivot"]}},
    annotations=READ_ONLY,
)
async def show_pivot() -> CallToolResult:
    """Show a pivot table summarising sales data by region and quarter."""
    structured = {
        "type": "pivot",
        "version": "1.0",
        "title": "Quarterly Sales Pivot",
        "data": [
            {"region": "North", "category": "Electronics", "quarter": "Q1", "revenue": 125000, "units": 320},
            {"region": "North", "category": "Electronics", "quarter": "Q2", "revenue": 142000, "units": 365},
            {"region": "North", "category": "Furniture", "quarter": "Q1", "revenue": 78000, "units": 145},
            {"region": "North", "category": "Furniture", "quarter": "Q2", "revenue": 83000, "units": 158},
            {"region": "South", "category": "Electronics", "quarter": "Q1", "revenue": 98000, "units": 250},
            {"region": "South", "category": "Electronics", "quarter": "Q2", "revenue": 115000, "units": 295},
            {"region": "South", "category": "Furniture", "quarter": "Q1", "revenue": 62000, "units": 118},
            {"region": "South", "category": "Furniture", "quarter": "Q2", "revenue": 71000, "units": 132},
            {"region": "West", "category": "Electronics", "quarter": "Q1", "revenue": 156000, "units": 410},
            {"region": "West", "category": "Electronics", "quarter": "Q2", "revenue": 178000, "units": 460},
            {"region": "West", "category": "Furniture", "quarter": "Q1", "revenue": 92000, "units": 175},
            {"region": "West", "category": "Furniture", "quarter": "Q2", "revenue": 101000, "units": 192},
        ],
        "rows": ["region"],
        "columns": ["quarter"],
        "values": [
            {"field": "revenue", "aggregate": "sum", "label": "Revenue ($)"},
            {"field": "units", "aggregate": "sum", "label": "Units Sold"},
        ],
        "showTotals": True,
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Pivot: quarterly sales by region. West leads with $527K revenue."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 45. Profile ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["profile"], "viewUrl": CDN_URL["profile"]}},
    annotations=READ_ONLY,
)
async def show_profile() -> CallToolResult:
    """Show an elevation profile along a hiking trail."""
    structured = {
        "type": "profile",
        "version": "1.0",
        "title": "Snowdon via Llanberis Path",
        "xLabel": "Distance (km)",
        "yLabel": "Elevation (m)",
        "fill": True,
        "points": [
            {"x": 0.0, "y": 420}, {"x": 0.5, "y": 445}, {"x": 1.0, "y": 478},
            {"x": 1.5, "y": 520}, {"x": 2.0, "y": 575}, {"x": 2.5, "y": 640},
            {"x": 3.0, "y": 710}, {"x": 3.5, "y": 765}, {"x": 4.0, "y": 830},
            {"x": 4.5, "y": 878}, {"x": 5.0, "y": 920}, {"x": 5.5, "y": 955},
            {"x": 6.0, "y": 1005}, {"x": 6.5, "y": 1042}, {"x": 7.0, "y": 1015},
            {"x": 7.5, "y": 972}, {"x": 8.0, "y": 935}, {"x": 8.5, "y": 880},
            {"x": 9.0, "y": 810}, {"x": 9.5, "y": 735}, {"x": 10.0, "y": 660},
            {"x": 10.5, "y": 590}, {"x": 11.0, "y": 510}, {"x": 11.5, "y": 455},
            {"x": 12.0, "y": 420},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Profile: Snowdon, 12 km round trip. Elevation gain 622m, summit 1042m."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 46. Audio ──────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["audio"], "viewUrl": CDN_URL["audio"]}},
    annotations=READ_ONLY,
)
async def show_audio() -> CallToolResult:
    """Play a public-domain audio sample (Bach Cello Suite No. 1)."""
    structured = {
        "type": "audio",
        "version": "1.0",
        "title": "Bach — Cello Suite No. 1 in G Major, Prelude",
        "url": "https://upload.wikimedia.org/wikipedia/commons/d/d1/Bach_Cello_Suite_No._1_in_G_-_Prelude.ogg",
        "autoplay": False,
        "loop": False,
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Audio: Bach Cello Suite No. 1 — Prelude. Public domain recording."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 47. Carousel ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["carousel"], "viewUrl": CDN_URL["carousel"]}},
    annotations=READ_ONLY,
)
async def show_carousel() -> CallToolResult:
    """Show an image carousel of heritage sites across Britain."""
    structured = {
        "type": "carousel",
        "version": "1.0",
        "title": "Heritage Sites of Britain",
        "items": [
            {
                "id": "stonehenge",
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/1280px-Stonehenge2007_07_30.jpg",
                "title": "Stonehenge",
                "description": "Prehistoric stone circle in Wiltshire, built in stages from around 3000 BCE.",
            },
            {
                "id": "hadrians-wall",
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Hadrians_Wall_from_Housesteads1_crop.jpg/1280px-Hadrians_Wall_from_Housesteads1_crop.jpg",
                "title": "Hadrian's Wall",
                "description": "Roman frontier stretching 73 miles across northern England, built AD 122.",
            },
            {
                "id": "bath",
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Roman_Baths_in_Bath_Spa%2C_England_-_July_2006.jpg/1280px-Roman_Baths_in_Bath_Spa%2C_England_-_July_2006.jpg",
                "title": "Roman Baths",
                "description": "Well-preserved Roman bathing complex fed by natural hot springs.",
            },
            {
                "id": "caernarfon",
                "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Caernarfon_castle_interior.jpg/1280px-Caernarfon_castle_interior.jpg",
                "title": "Caernarfon Castle",
                "description": "Medieval fortress built by Edward I, a UNESCO World Heritage Site.",
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Carousel: 4 heritage sites — Stonehenge, Hadrian's Wall, Roman Baths, Caernarfon Castle."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 48. Terminal ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["terminal"], "viewUrl": CDN_URL["terminal"]}},
    annotations=READ_ONLY,
)
async def show_terminal() -> CallToolResult:
    """Show terminal output from a deployment script."""
    structured = {
        "type": "terminal",
        "version": "1.0",
        "title": "Deployment — production",
        "lines": [
            {"text": "$ ./deploy.sh production", "type": "stdin"},
            {"text": "[deploy] Starting deployment to production...", "type": "stdout"},
            {"text": "[deploy] Building Docker image...", "type": "stdout"},
            {"text": "Step 1/6 : FROM node:20-slim", "type": "stdout"},
            {"text": "Step 2/6 : WORKDIR /app", "type": "stdout"},
            {"text": "Step 3/6 : COPY package*.json .", "type": "stdout"},
            {"text": "Step 4/6 : RUN npm ci --production", "type": "stdout"},
            {"text": "Step 5/6 : COPY dist/ dist/", "type": "stdout"},
            {"text": "Step 6/6 : CMD [\"node\", \"server.mjs\"]", "type": "stdout"},
            {"text": "Successfully built a1b2c3d4e5f6", "type": "stdout"},
            {"text": "[deploy] Pushing to registry.fly.io/chuk-mcp-ui-views:v2.4.1", "type": "stdout"},
            {"text": "WARNING: Migration 0042 skipped (already applied)", "type": "stderr"},
            {"text": "[deploy] Scaling to 3 instances...", "type": "stdout"},
            {"text": "[deploy] Instance 1/3: healthy", "type": "stdout"},
            {"text": "[deploy] Instance 2/3: healthy", "type": "stdout"},
            {"text": "[deploy] Instance 3/3: healthy", "type": "stdout"},
            {"text": "[deploy] Deployment complete! v2.4.1 is live.", "type": "stdout"},
            {"text": "$ ", "type": "stdin"},
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Terminal: deployment script — Docker build, push, scale to 3 instances."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 49. GIS Legend ─────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["gis-legend"], "viewUrl": CDN_URL["gis-legend"]}},
    annotations=READ_ONLY,
)
async def show_gis_legend() -> CallToolResult:
    """Show a map legend with point, line, polygon, and gradient symbols."""
    structured = {
        "type": "gis-legend",
        "version": "1.0",
        "title": "Heritage Survey Map Legend",
        "sections": [
            {
                "title": "Monument Types",
                "items": [
                    {"type": "point", "label": "Scheduled Monument", "color": "#ef4444"},
                    {"type": "point", "label": "Listed Building (Grade I)", "color": "#3b82f6"},
                    {"type": "point", "label": "Listed Building (Grade II)", "color": "#60a5fa"},
                    {"type": "point", "label": "Registered Park/Garden", "color": "#22c55e"},
                ],
            },
            {
                "title": "Linear Features",
                "items": [
                    {"type": "line", "label": "Roman Road", "color": "#ef4444"},
                    {"type": "line", "label": "Medieval Boundary", "color": "#f59e0b"},
                    {"type": "line", "label": "Historic Footpath", "color": "#8b5cf6"},
                ],
            },
            {
                "title": "Areas",
                "items": [
                    {"type": "polygon", "label": "Conservation Area", "fillColor": "#22c55e", "strokeColor": "#16a34a"},
                    {"type": "polygon", "label": "World Heritage Site", "fillColor": "#3b82f6", "strokeColor": "#2563eb"},
                ],
            },
            {
                "title": "Risk Assessment",
                "items": [
                    {"type": "gradient", "label": "Heritage at Risk", "gradientStops": [
                        {"color": "#22c55e", "label": "Low"},
                        {"color": "#f59e0b", "label": "Medium"},
                        {"color": "#ef4444", "label": "High"},
                    ]},
                ],
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="GIS Legend: 4 sections — monument types, linear features, areas, and risk gradient."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 50. Layers ─────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["layers"], "viewUrl": CDN_URL["layers"]}},
    annotations=READ_ONLY,
)
async def show_layers() -> CallToolResult:
    """Show a multi-layer map with toggleable heritage and geographic layers."""
    structured = {
        "type": "layers",
        "version": "1.0",
        "title": "Heritage Survey — Layered Map",
        "center": {"lat": 51.18, "lon": -1.83},
        "zoom": 11,
        "layers": [
            {
                "id": "monuments",
                "label": "Scheduled Monuments",
                "visible": True,
                "opacity": 1.0,
                "features": {
                    "type": "FeatureCollection",
                    "features": [
                        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8262, 51.1789]}, "properties": {"name": "Stonehenge"}},
                        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8544, 51.4288]}, "properties": {"name": "Avebury"}},
                        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8575, 51.4158]}, "properties": {"name": "Silbury Hill"}},
                        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8103, 51.0925]}, "properties": {"name": "Old Sarum"}},
                    ],
                },
            },
            {
                "id": "conservation",
                "label": "Conservation Areas",
                "visible": True,
                "opacity": 0.4,
                "features": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {"type": "Polygon", "coordinates": [[[-1.84, 51.17], [-1.81, 51.17], [-1.81, 51.19], [-1.84, 51.19], [-1.84, 51.17]]]},
                            "properties": {"name": "Stonehenge WHS Buffer"},
                        },
                    ],
                },
            },
            {
                "id": "paths",
                "label": "Historic Paths",
                "visible": False,
                "opacity": 0.8,
                "features": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {"type": "LineString", "coordinates": [[-1.8262, 51.1789], [-1.84, 51.25], [-1.85, 51.32], [-1.8544, 51.4288]]},
                            "properties": {"name": "Stonehenge to Avebury Path"},
                        },
                    ],
                },
            },
        ],
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Layers: 3 toggleable layers — Monuments (4 points), Conservation Areas (1 polygon), Historic Paths (1 line, hidden)."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 51. Minimap ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["minimap"], "viewUrl": CDN_URL["minimap"]}},
    annotations=READ_ONLY,
)
async def show_minimap() -> CallToolResult:
    """Show an overview + detail minimap for the Salisbury Plain heritage area."""
    monuments = {
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8262, 51.1789]}, "properties": {"name": "Stonehenge"}},
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8544, 51.4288]}, "properties": {"name": "Avebury"}},
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8103, 51.0925]}, "properties": {"name": "Old Sarum"}},
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.8575, 51.4158]}, "properties": {"name": "Silbury Hill"}},
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [-2.3590, 51.3811]}, "properties": {"name": "Roman Baths"}},
        ],
    }

    structured = {
        "type": "minimap",
        "version": "1.0",
        "title": "Salisbury Plain Heritage Area",
        "overview": {
            "center": {"lat": 51.28, "lon": -2.05},
            "zoom": 8,
            "layers": [{"id": "overview", "label": "All Sites", "features": monuments}],
        },
        "detail": {
            "center": {"lat": 51.178, "lon": -1.826},
            "zoom": 13,
            "layers": [{"id": "detail", "label": "Stonehenge Area", "features": {
                "type": "FeatureCollection",
                "features": [monuments["features"][0], monuments["features"][2]],
            }}],
        },
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text="Minimap: overview (5 sites) with detail view focused on Stonehenge area."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 52. Spectrogram ───────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["spectrogram"], "viewUrl": CDN_URL["spectrogram"]}},
    annotations=READ_ONLY,
)
async def show_spectrogram() -> CallToolResult:
    """Show a spectrogram visualization of a synthetic audio signal."""
    import math

    sample_rate = 16000
    fft_size = 512
    hop_size = 256
    num_bins = fft_size // 2
    num_frames = 64

    magnitudes = []
    for frame in range(num_frames):
        row = []
        envelope = math.sin(math.pi * frame / num_frames)
        for bin_idx in range(num_bins):
            val = 0.0
            for harmonic, amp in [(440, 1.0), (880, 0.6), (1320, 0.3), (554, 0.7), (1108, 0.35)]:
                center = harmonic * fft_size / sample_rate
                val += amp * math.exp(-0.5 * ((bin_idx - center) / 1.5) ** 2)
            row.append(round(min(val * envelope + 0.02, 1.0), 3))
        magnitudes.append(row)

    structured = {
        "type": "spectrogram",
        "version": "1.0",
        "title": "Audio Spectrogram — A Major Chord",
        "data": {
            "sampleRate": sample_rate,
            "fftSize": fft_size,
            "hopSize": hop_size,
            "magnitudes": magnitudes,
        },
    }

    return CallToolResult(
        content=[
            TextContent(type="text", text=f"Spectrogram: A major chord, {num_frames} frames x {num_bins} bins, {sample_rate} Hz sample rate."),
            TextContent(type="text", text=json.dumps(structured)),
        ],
        structuredContent=structured,
    )


# ── 53. Notebook ─────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["notebook"], "viewUrl": CDN_URL["notebook"]}},
    annotations=READ_ONLY,
)
async def show_notebook() -> CallToolResult:
    """Show a compound notebook with markdown, code, table, and counter cells."""
    structured = {
        "type": "notebook",
        "version": "1.0",
        "title": "Sales Analysis Q4 2024",
        "cells": [
            {"cellType": "markdown", "source": "# Sales Analysis Q4 2024\nThis notebook summarises quarterly sales data across regions."},
            {"cellType": "table", "columns": ["Region", "Q3 Revenue", "Q4 Revenue", "Growth"], "rows": [
                ["North", "$2.1M", "$2.6M", "+23%"], ["South", "$1.8M", "$1.7M", "-5%"],
                ["East", "$1.5M", "$1.7M", "+13%"], ["West", "$2.0M", "$2.3M", "+15%"],
            ]},
            {"cellType": "markdown", "source": "## Key Findings\n- North region grew by **23%** — strongest quarter yet\n- South region declined slightly, needs attention"},
            {"cellType": "counter", "value": 8300000, "label": "Total Q4 Revenue (USD)"},
            {"cellType": "code", "language": "python", "source": "import pandas as pd\ndf = pd.read_csv('sales_q4.csv')\ndf.groupby('region')['revenue'].sum()", "output": "Region\nEast     1700000\nNorth    2600000\nSouth    1700000\nWest     2300000"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing sales analysis notebook with 5 cells."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 54. Funnel ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["funnel"], "viewUrl": CDN_URL["funnel"]}},
    annotations=READ_ONLY,
)
async def show_funnel() -> CallToolResult:
    """Show a conversion funnel chart."""
    structured = {
        "type": "funnel",
        "version": "1.0",
        "title": "Marketing Conversion Funnel",
        "showConversion": True,
        "stages": [
            {"label": "Website Visitors", "value": 12000},
            {"label": "Leads", "value": 5200},
            {"label": "Qualified Leads", "value": 2100},
            {"label": "Proposals Sent", "value": 870},
            {"label": "Closed Deals", "value": 340},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing 5-stage marketing conversion funnel."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 55. Swimlane ─────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["swimlane"], "viewUrl": CDN_URL["swimlane"]}},
    annotations=READ_ONLY,
)
async def show_swimlane() -> CallToolResult:
    """Show a swimlane process diagram."""
    structured = {
        "type": "swimlane",
        "version": "1.0",
        "title": "Software Delivery Process",
        "lanes": [
            {"id": "design", "label": "Design", "color": "#8b5cf6"},
            {"id": "dev", "label": "Development", "color": "#3b82f6"},
            {"id": "qa", "label": "QA", "color": "#22c55e"},
        ],
        "columns": [
            {"id": "backlog", "label": "Backlog"},
            {"id": "active", "label": "In Progress"},
            {"id": "review", "label": "Review"},
            {"id": "done", "label": "Done"},
        ],
        "activities": [
            {"id": "a1", "laneId": "design", "columnId": "done", "label": "Wireframes", "status": "completed"},
            {"id": "a2", "laneId": "design", "columnId": "active", "label": "High-fi Mockups", "status": "active"},
            {"id": "a3", "laneId": "dev", "columnId": "active", "label": "API Endpoints", "status": "active"},
            {"id": "a4", "laneId": "dev", "columnId": "backlog", "label": "Frontend Integration", "status": "pending"},
            {"id": "a5", "laneId": "qa", "columnId": "backlog", "label": "Test Plan", "status": "pending"},
            {"id": "a6", "laneId": "qa", "columnId": "review", "label": "Unit Tests", "status": "active"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing software delivery swimlane with 3 lanes and 6 activities."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 56. Slides ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["slides"], "viewUrl": CDN_URL["slides"]}},
    annotations=READ_ONLY,
)
async def show_slides() -> CallToolResult:
    """Show a slide presentation."""
    structured = {
        "type": "slides",
        "version": "1.0",
        "title": "Quarterly Review",
        "transition": "fade",
        "slides": [
            {"title": "Q4 2024 Review", "content": "<h2>Team Performance</h2><p>Revenue up 18% year-over-year.</p>", "layout": "center"},
            {"title": "Key Metrics", "content": "<ul><li>Revenue: $8.3M (+18%)</li><li>New Customers: 340</li><li>Retention: 94%</li><li>NPS: 72</li></ul>"},
            {"title": "Challenges", "content": "<p>Supply chain delays impacted Q4 deliveries. South region declined 5%.</p>"},
            {"title": "2025 Roadmap", "content": "<ol><li>Expand to 3 new markets</li><li>Launch self-service portal</li><li>Achieve $40M ARR</li></ol>"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing 4-slide quarterly review presentation."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 57. Annotation ───────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["annotation"], "viewUrl": CDN_URL["annotation"]}},
    annotations=READ_ONLY,
)
async def show_annotation() -> CallToolResult:
    """Show an annotated image with overlays."""
    structured = {
        "type": "annotation",
        "version": "1.0",
        "title": "Site Survey — Region 4B",
        "imageUrl": "https://picsum.photos/seed/survey/800/600",
        "imageWidth": 800,
        "imageHeight": 600,
        "annotations": [
            {"kind": "circle", "id": "a1", "cx": 200, "cy": 180, "r": 40, "color": "#ef4444", "label": "Structure A"},
            {"kind": "rect", "id": "a2", "x": 450, "y": 300, "width": 120, "height": 80, "color": "#3b82f6", "label": "Excavation Zone"},
            {"kind": "arrow", "id": "a3", "x1": 240, "y1": 180, "x2": 450, "y2": 340, "color": "#22c55e", "label": "Access Path"},
            {"kind": "text", "id": "a4", "x": 650, "y": 50, "text": "N ↑", "fontSize": 18},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing annotated site survey image with 4 annotations."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 58. Neural ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["neural"], "viewUrl": CDN_URL["neural"]}},
    annotations=READ_ONLY,
)
async def show_neural() -> CallToolResult:
    """Show a neural network architecture diagram."""
    structured = {
        "type": "neural",
        "version": "1.0",
        "title": "Image Classifier",
        "layers": [
            {"name": "Input", "type": "input", "units": 784},
            {"name": "Conv1", "type": "conv", "units": 32, "activation": "relu"},
            {"name": "Pool1", "type": "pooling", "units": 16},
            {"name": "Dense1", "type": "dense", "units": 128, "activation": "relu"},
            {"name": "Dropout", "type": "dropout", "units": 128},
            {"name": "Output", "type": "output", "units": 10, "activation": "softmax"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing 6-layer image classifier neural network architecture."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 59. Sankey ───────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["sankey"], "viewUrl": CDN_URL["sankey"]}},
    annotations=READ_ONLY,
)
async def show_sankey() -> CallToolResult:
    """Show a Sankey flow diagram."""
    structured = {
        "type": "sankey",
        "version": "1.0",
        "title": "Energy Flow",
        "nodes": [
            {"id": "solar", "label": "Solar", "color": "#f59e0b"},
            {"id": "wind", "label": "Wind", "color": "#06b6d4"},
            {"id": "gas", "label": "Natural Gas", "color": "#ef4444"},
            {"id": "elec", "label": "Electricity", "color": "#3b82f6"},
            {"id": "heat", "label": "Heat", "color": "#f97316"},
            {"id": "res", "label": "Residential", "color": "#22c55e"},
            {"id": "com", "label": "Commercial", "color": "#8b5cf6"},
            {"id": "ind", "label": "Industrial", "color": "#64748b"},
        ],
        "links": [
            {"source": "solar", "target": "elec", "value": 120},
            {"source": "wind", "target": "elec", "value": 80},
            {"source": "gas", "target": "elec", "value": 200},
            {"source": "gas", "target": "heat", "value": 150},
            {"source": "elec", "target": "res", "value": 180},
            {"source": "elec", "target": "com", "value": 120},
            {"source": "elec", "target": "ind", "value": 100},
            {"source": "heat", "target": "res", "value": 80},
            {"source": "heat", "target": "ind", "value": 70},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing energy flow Sankey diagram with 8 nodes and 9 links."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 60. Geostory ─────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["geostory"], "viewUrl": CDN_URL["geostory"]}},
    annotations=READ_ONLY,
)
async def show_geostory() -> CallToolResult:
    """Show a scrollytelling geographic narrative."""
    structured = {
        "type": "geostory",
        "version": "1.0",
        "title": "The Silk Road",
        "steps": [
            {"id": "s1", "title": "Xi'an, China", "text": "The eastern terminus of the Silk Road, Xi'an served as the capital of multiple Chinese dynasties.", "location": {"lat": 34.26, "lon": 108.94}},
            {"id": "s2", "title": "Samarkand, Uzbekistan", "text": "A key trading hub where Chinese silk met Persian carpets and Indian spices.", "location": {"lat": 39.65, "lon": 66.96}},
            {"id": "s3", "title": "Baghdad, Iraq", "text": "The Abbasid capital was a centre of learning and trade during the Islamic Golden Age.", "location": {"lat": 33.31, "lon": 44.37}},
            {"id": "s4", "title": "Constantinople", "text": "The gateway between East and West, controlling trade between Asia and Europe.", "location": {"lat": 41.01, "lon": 28.98}},
            {"id": "s5", "title": "Venice, Italy", "text": "The western end of the Silk Road, where Eastern goods entered European markets.", "location": {"lat": 45.44, "lon": 12.32}},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing Silk Road geostory with 5 steps."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 61. Investigation ────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["investigation"], "viewUrl": CDN_URL["investigation"]}},
    annotations=READ_ONLY,
)
async def show_investigation() -> CallToolResult:
    """Show an investigation pinboard with evidence and connections."""
    structured = {
        "type": "investigation",
        "version": "1.0",
        "title": "Security Incident Analysis",
        "evidence": [
            {"id": "e1", "label": "Anomalous Login", "type": "event", "description": "Login from unknown IP at 03:14 UTC", "tags": ["critical"]},
            {"id": "e2", "label": "Server Log", "type": "document", "description": "Apache access log showing 500 errors", "tags": ["evidence"]},
            {"id": "e3", "label": "Admin Account", "type": "person", "description": "Compromised admin credentials used"},
            {"id": "e4", "label": "Data Centre", "type": "location", "description": "EU-West-1 region, Frankfurt"},
            {"id": "e5", "label": "USB Drive", "type": "object", "description": "Recovered from workstation B-14", "tags": ["physical"]},
        ],
        "connections": [
            {"from": "e1", "to": "e3", "label": "used credentials of", "strength": "strong"},
            {"from": "e1", "to": "e2", "label": "triggered", "strength": "strong"},
            {"from": "e3", "to": "e4", "label": "accessed from", "strength": "medium"},
            {"from": "e5", "to": "e3", "label": "contained backup of", "strength": "weak"},
        ],
        "notes": "Timeline suggests insider threat. USB drive contents under forensic analysis.",
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing security investigation with 5 evidence items and 4 connections."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 62. Gantt ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["gantt"], "viewUrl": CDN_URL["gantt"]}},
    annotations=READ_ONLY,
)
async def show_gantt() -> CallToolResult:
    """Show a Gantt chart project timeline."""
    structured = {
        "type": "gantt",
        "version": "1.0",
        "title": "Product Launch Plan",
        "tasks": [
            {"id": "t1", "label": "Requirements", "start": "2025-01-06", "end": "2025-01-17", "progress": 100, "group": "Planning"},
            {"id": "t2", "label": "Design", "start": "2025-01-20", "end": "2025-02-07", "progress": 100, "dependencies": ["t1"], "group": "Planning"},
            {"id": "t3", "label": "Backend API", "start": "2025-02-10", "end": "2025-03-14", "progress": 60, "dependencies": ["t2"], "group": "Development"},
            {"id": "t4", "label": "Frontend UI", "start": "2025-02-17", "end": "2025-03-21", "progress": 45, "dependencies": ["t2"], "group": "Development"},
            {"id": "t5", "label": "Integration Testing", "start": "2025-03-24", "end": "2025-04-04", "progress": 0, "dependencies": ["t3", "t4"], "group": "Testing"},
            {"id": "t6", "label": "Launch", "start": "2025-04-07", "end": "2025-04-11", "progress": 0, "dependencies": ["t5"], "group": "Release"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing product launch Gantt chart with 6 tasks."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 63. Calendar ─────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["calendar"], "viewUrl": CDN_URL["calendar"]}},
    annotations=READ_ONLY,
)
async def show_calendar() -> CallToolResult:
    """Show a monthly calendar with events."""
    structured = {
        "type": "calendar",
        "version": "1.0",
        "title": "Team Calendar — February 2025",
        "defaultDate": "2025-02-01",
        "events": [
            {"id": "ev1", "title": "Sprint Planning", "start": "2025-02-03", "color": "#3b82f6"},
            {"id": "ev2", "title": "Design Review", "start": "2025-02-05", "end": "2025-02-05", "color": "#8b5cf6"},
            {"id": "ev3", "title": "Team Offsite", "start": "2025-02-10", "end": "2025-02-12", "allDay": True, "color": "#22c55e"},
            {"id": "ev4", "title": "Release v2.1", "start": "2025-02-14", "color": "#ef4444"},
            {"id": "ev5", "title": "Retro", "start": "2025-02-14", "color": "#f59e0b"},
            {"id": "ev6", "title": "All-Hands", "start": "2025-02-19", "color": "#06b6d4"},
            {"id": "ev7", "title": "Sprint Planning", "start": "2025-02-17", "color": "#3b82f6"},
            {"id": "ev8", "title": "Board Meeting", "start": "2025-02-25", "color": "#ec4899", "description": "Q4 results presentation"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing February 2025 team calendar with 8 events."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 64. Graph ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["graph"], "viewUrl": CDN_URL["graph"]}},
    annotations=READ_ONLY,
)
async def show_graph() -> CallToolResult:
    """Show a force-directed network graph."""
    structured = {
        "type": "graph",
        "version": "1.0",
        "title": "Package Dependencies",
        "directed": True,
        "nodes": [
            {"id": "app", "label": "app", "color": "#ef4444", "size": 8, "group": "core"},
            {"id": "react", "label": "react", "color": "#3b82f6", "group": "framework"},
            {"id": "react-dom", "label": "react-dom", "color": "#3b82f6", "group": "framework"},
            {"id": "vite", "label": "vite", "color": "#8b5cf6", "group": "tooling"},
            {"id": "ts", "label": "typescript", "color": "#8b5cf6", "group": "tooling"},
            {"id": "zod", "label": "zod", "color": "#22c55e", "group": "validation"},
            {"id": "tailwind", "label": "tailwindcss", "color": "#06b6d4", "group": "styling"},
        ],
        "edges": [
            {"source": "app", "target": "react"}, {"source": "app", "target": "react-dom"},
            {"source": "app", "target": "vite"}, {"source": "app", "target": "ts"},
            {"source": "app", "target": "zod"}, {"source": "app", "target": "tailwind"},
            {"source": "react-dom", "target": "react"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing package dependency graph with 7 nodes."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 65. Flowchart ────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["flowchart"], "viewUrl": CDN_URL["flowchart"]}},
    annotations=READ_ONLY,
)
async def show_flowchart() -> CallToolResult:
    """Show a flowchart diagram."""
    structured = {
        "type": "flowchart",
        "version": "1.0",
        "title": "User Login Flow",
        "direction": "TB",
        "nodes": [
            {"id": "start", "label": "Start", "shape": "ellipse"},
            {"id": "input", "label": "Enter Credentials", "shape": "parallelogram"},
            {"id": "validate", "label": "Valid?", "shape": "diamond"},
            {"id": "mfa", "label": "MFA Check", "shape": "rect"},
            {"id": "mfa_ok", "label": "MFA Valid?", "shape": "diamond"},
            {"id": "grant", "label": "Grant Access", "shape": "rect", "color": "#22c55e"},
            {"id": "deny", "label": "Deny Access", "shape": "rect", "color": "#ef4444"},
        ],
        "edges": [
            {"source": "start", "target": "input"},
            {"source": "input", "target": "validate"},
            {"source": "validate", "target": "mfa", "label": "Yes"},
            {"source": "validate", "target": "deny", "label": "No", "style": "dashed"},
            {"source": "mfa", "target": "mfa_ok"},
            {"source": "mfa_ok", "target": "grant", "label": "Yes"},
            {"source": "mfa_ok", "target": "deny", "label": "No", "style": "dashed"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing user login flowchart with 7 nodes."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 66. Globe ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["globe"], "viewUrl": CDN_URL["globe"]}},
    annotations=READ_ONLY,
)
async def show_globe() -> CallToolResult:
    """Show points and arcs on a 3D globe."""
    structured = {
        "type": "globe",
        "version": "1.0",
        "title": "Global Office Locations",
        "rotation": {"lat": 30, "lon": -20},
        "points": [
            {"id": "nyc", "lat": 40.71, "lon": -74.01, "label": "New York", "color": "#ef4444", "size": 6},
            {"id": "ldn", "lat": 51.51, "lon": -0.13, "label": "London", "color": "#3b82f6", "size": 6},
            {"id": "tky", "lat": 35.68, "lon": 139.69, "label": "Tokyo", "color": "#22c55e", "size": 5},
            {"id": "syd", "lat": -33.87, "lon": 151.21, "label": "Sydney", "color": "#f59e0b", "size": 4},
            {"id": "sfo", "lat": 37.77, "lon": -122.42, "label": "San Francisco", "color": "#8b5cf6", "size": 5},
        ],
        "arcs": [
            {"from": "nyc", "to": "ldn", "color": "#94a3b8"},
            {"from": "ldn", "to": "tky", "color": "#94a3b8"},
            {"from": "tky", "to": "syd", "color": "#94a3b8"},
            {"from": "sfo", "to": "nyc", "color": "#94a3b8"},
            {"from": "sfo", "to": "tky", "color": "#94a3b8"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing 5 global offices on a 3D globe with flight arcs."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── 67. 3D Scene ─────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["threed"], "viewUrl": CDN_URL["threed"]}},
    annotations=READ_ONLY,
)
async def show_3d() -> CallToolResult:
    """Show a 3D scene with geometric objects."""
    structured = {
        "type": "threed",
        "version": "1.0",
        "title": "Geometric Scene",
        "background": "#1a1a2e",
        "objects": [
            {"id": "floor", "geometry": "box", "position": [0, -1, 0], "scale": [8, 0.2, 8], "color": "#334155"},
            {"id": "cube", "geometry": "box", "position": [-2, 0.5, 0], "color": "#3b82f6", "label": "Cube"},
            {"id": "sphere", "geometry": "sphere", "position": [0, 1, 1], "color": "#ef4444", "label": "Sphere"},
            {"id": "cylinder", "geometry": "cylinder", "position": [2, 0.5, -1], "color": "#22c55e", "label": "Cylinder"},
            {"id": "cone", "geometry": "cone", "position": [-1, 0.5, 2], "scale": [1, 1.5, 1], "color": "#f59e0b", "label": "Cone"},
            {"id": "torus", "geometry": "torus", "position": [1.5, 1.2, 2], "color": "#8b5cf6", "label": "Torus"},
        ],
    }
    return CallToolResult(
        content=[TextContent(type="text", text="Showing 3D scene with 6 geometric objects."), TextContent(type="text", text=json.dumps(structured))],
        structuredContent=structured,
    )


# ── Handler tools (receive form submissions and row actions) ─────────────

# Handler tools for poll, quiz, chat, settings submissions

@mcp.tool(annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False))
async def handle_poll_vote(question_id: str, selected: str) -> CallToolResult:
    """Handle a poll vote submission."""
    return CallToolResult(content=[TextContent(type="text", text=f"Vote recorded: {selected} for question {question_id}.")])


@mcp.tool(annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False))
async def handle_quiz_answer(question_id: str, answer: str) -> CallToolResult:
    """Validate a quiz answer."""
    correct = {"q1": "b", "q2": "b", "q3": "b"}
    is_correct = correct.get(question_id) == answer
    return CallToolResult(content=[TextContent(type="text", text=f"{'Correct!' if is_correct else 'Incorrect.'} (Question {question_id})")])


@mcp.tool(annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False))
async def handle_chat_message(message: str) -> CallToolResult:
    """Handle a chat message (demo echo response)."""
    return CallToolResult(content=[TextContent(type="text", text=f"You said: {message}\n\n(This is a demo — in production this would call the LLM.)")])


@mcp.tool(annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False))
async def handle_save_settings(
    theme: str = "system",
    font_size: int = 14,
    animations: bool = True,
    analytics: bool = False,
    cache_ttl: int = 15,
    export_format: str = "json",
    email_alerts: bool = True,
    alert_threshold: str = "warning",
) -> CallToolResult:
    """Save application settings."""
    settings = {
        "theme": theme, "font_size": font_size, "animations": animations,
        "analytics": analytics, "cache_ttl": cache_ttl, "export_format": export_format,
        "email_alerts": email_alerts, "alert_threshold": alert_threshold,
    }
    return CallToolResult(content=[TextContent(type="text", text=f"Settings saved: {json.dumps(settings, indent=2)}")])


@mcp.tool(annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False))
async def delete_dataset(dataset_id: str) -> CallToolResult:
    """Delete a dataset (demo — no actual deletion)."""
    return CallToolResult(content=[TextContent(type="text", text=f"Dataset '{dataset_id}' deleted (demo only).")])


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False),
)
async def handle_registration(
    name: str,
    email: str = "",
    password: str = "",
    ticket_type: str = "general",
    track: str = "",
    workshop_date: str = "",
    experience: int = 0,
    newsletter: bool = False,
    badge_color: str = "",
    dietary: str = "",
    referral_code: str = "",
) -> CallToolResult:
    """Handle event registration form submission."""
    return CallToolResult(
        content=[
            TextContent(
                type="text",
                text=(
                    f"Registration confirmed for {name}!\n"
                    f"Email: {email}\n"
                    f"Ticket: {ticket_type}\n"
                    f"Track: {track or 'Not selected'}\n"
                    f"Workshop: {workshop_date or 'None'}\n"
                    f"Experience: {experience} years\n"
                    f"Newsletter: {'Yes' if newsletter else 'No'}\n"
                    f"Referral: {referral_code or 'None'}"
                ),
            )
        ]
    )


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False),
)
async def handle_feedback(
    name: str, message: str, city: str = "", visited: bool = False, rating: int = 0
) -> CallToolResult:
    """Handle feedback form submission."""
    return CallToolResult(
        content=[
            TextContent(
                type="text",
                text=(
                    f"Feedback received from {name}.\n"
                    f"City: {city or 'Not specified'}\n"
                    f"Visited: {'Yes' if visited else 'No'}\n"
                    f"Rating: {rating}/10\n"
                    f"Comments: {message}"
                ),
            )
        ]
    )


@mcp.tool(annotations=READ_ONLY)
async def show_country_detail(country: str) -> CallToolResult:
    """Show details about a country (triggered from table row action)."""
    details = {
        "Japan": "Japan is an island country in East Asia, known for its ancient temples, imperial palaces, and cutting-edge technology.",
        "Brazil": "Brazil is the largest country in South America, famous for the Amazon rainforest, Carnival, and football.",
        "Germany": "Germany is a Western European country known for its engineering, cultural history, and the Berlin Wall.",
        "Nigeria": "Nigeria is the most populous country in Africa, with a diverse cultural heritage and a growing tech sector.",
        "Australia": "Australia is a continent-country known for its unique wildlife, coral reefs, and vast outback.",
        "Canada": "Canada is the second-largest country by area, known for its natural beauty, multiculturalism, and maple syrup.",
        "India": "India is the world's most populous country, known for its ancient civilisations, diverse cultures, and IT industry.",
        "France": "France is a Western European country known for its art, fashion, cuisine, and the Eiffel Tower.",
    }
    desc = details.get(country, f"{country} — no additional details available.")
    return CallToolResult(
        content=[TextContent(type="text", text=f"{country}: {desc}")]
    )


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False),
)
async def remove_country(country: str) -> CallToolResult:
    """Remove a country from the table (demo — no actual deletion)."""
    return CallToolResult(
        content=[
            TextContent(type="text", text=f"{country} has been removed from the display (demo only — data is static).")
        ]
    )


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
