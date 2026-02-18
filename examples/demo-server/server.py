"""
Demo MCP server showcasing all 10 chuk-mcp-ui Views.

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
from mcp.types import ToolAnnotations

mcp = FastMCP(
    "view-demo",
    host="0.0.0.0",
    port=int(os.getenv("PORT", "8000")),
)

# ── CDN + Resource URI constants ────────────────────────────────────────────

CDN_BASE = "https://chuk-mcp-ui-views.fly.dev"

VIEWS = {
    "map":       "/map/v1",
    "chart":     "/chart/v1",
    "datatable": "/datatable/v1",
    "markdown":  "/markdown/v1",
    "video":     "/video/v1",
    "pdf":       "/pdf/v1",
    "form":      "/form/v1",
    "dashboard": "/dashboard/v1",
    "split":     "/split/v1",
    "tabs":      "/tabs/v1",
}

# ui:// URIs for tool metadata (host fetches HTML via resources/read)
UI_URI = {name: f"ui://view-demo/{name}" for name in VIEWS}

# https:// URLs for composition Views (iframe loads child Views directly)
CDN_URL = {name: f"{CDN_BASE}{path}" for name, path in VIEWS.items()}

# Annotation shared by all read-only show_* tools
READ_ONLY = ToolAnnotations(readOnlyHint=True)

# ── HTML cache + fetcher ────────────────────────────────────────────────────

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


# ── ui:// resource registration ─────────────────────────────────────────────
# The host calls resources/read with these URIs to get the View HTML.


@mcp.resource(UI_URI["map"], name="Map View", mime_type="text/html",
              description="Interactive Leaflet map with GeoJSON layers")
async def map_resource() -> str:
    return await _fetch_view_html("map")


@mcp.resource(UI_URI["chart"], name="Chart View", mime_type="text/html",
              description="Bar, line, pie, scatter, radar charts")
async def chart_resource() -> str:
    return await _fetch_view_html("chart")


@mcp.resource(UI_URI["datatable"], name="DataTable View", mime_type="text/html",
              description="Sortable, filterable data table with CSV export")
async def datatable_resource() -> str:
    return await _fetch_view_html("datatable")


@mcp.resource(UI_URI["markdown"], name="Markdown View", mime_type="text/html",
              description="Rich markdown with code blocks and tables")
async def markdown_resource() -> str:
    return await _fetch_view_html("markdown")


@mcp.resource(UI_URI["video"], name="Video View", mime_type="text/html",
              description="HTML5 video player with poster and controls")
async def video_resource() -> str:
    return await _fetch_view_html("video")


@mcp.resource(UI_URI["pdf"], name="PDF View", mime_type="text/html",
              description="PDF.js viewer with page navigation and zoom")
async def pdf_resource() -> str:
    return await _fetch_view_html("pdf")


@mcp.resource(UI_URI["form"], name="Form View", mime_type="text/html",
              description="JSON Schema driven form with validation")
async def form_resource() -> str:
    return await _fetch_view_html("form")


@mcp.resource(UI_URI["dashboard"], name="Dashboard View", mime_type="text/html",
              description="Multi-panel grid layout embedding child Views")
async def dashboard_resource() -> str:
    return await _fetch_view_html("dashboard")


@mcp.resource(UI_URI["split"], name="Split View", mime_type="text/html",
              description="Two-panel side-by-side layout")
async def split_resource() -> str:
    return await _fetch_view_html("split")


@mcp.resource(UI_URI["tabs"], name="Tabs View", mime_type="text/html",
              description="Tabbed panel switching between child Views")
async def tabs_resource() -> str:
    return await _fetch_view_html("tabs")


# ── 1. Map ──────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["map"]}},
    annotations=READ_ONLY,
)
async def show_map() -> dict:
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

    return {
        "content": [
            {"type": "text", "text": f"Showing {len(landmarks)} world landmarks."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 2. Chart ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["chart"]}},
    annotations=READ_ONLY,
)
async def show_chart(chart_type: str = "bar") -> dict:
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

    return {
        "content": [
            {"type": "text", "text": f"Programming language popularity ({chart_type} chart)."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 3. DataTable ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["datatable"]}},
    annotations=READ_ONLY,
)
async def show_table() -> dict:
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

    return {
        "content": [
            {"type": "text", "text": f"Showing {len(countries)} countries with all column types."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 4. Markdown ─────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["markdown"]}},
    annotations=READ_ONLY,
)
async def show_markdown() -> dict:
    """Show a rich markdown document with headings, code, tables, and lists."""
    md = """\
# MCP Views Demo

Welcome to the **chuk-mcp-ui** View system. This document is rendered using the
Markdown View, powered by [marked](https://github.com/markedjs/marked).

## Design System

All 10 Views share a unified design system built with:

- **Tailwind CSS v4** — utility-first styling via the `@tailwindcss/vite` plugin
- **shadcn/ui + Radix UI** — 15 accessible component primitives (Button, Table, Badge, Input, Select, Checkbox, RadioGroup, Slider, Tabs, etc.)
- **Framer Motion** — declarative enter/exit animations (opt-in per View)

The theme bridge maps runtime `--chuk-*` CSS variables to Tailwind tokens, so Views
automatically adapt to host light/dark themes.

## Features

- **10 View types**: map, chart, datatable, form, markdown, video, pdf, dashboard, split, tabs
- **Dual distribution**: npm packages (inline) + Fly.io CDN (URL reference)
- **Triple schema**: JSON Schema + Zod (TypeScript) + Pydantic (Python)
- **Themeable**: All Views respect the host client's color scheme via CSS variable bridge

## Code Example

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool(meta={"ui": {"resourceUri": "ui://my-server/map"}})
async def show_map() -> dict:
    return {
        "content": [{"type": "text", "text": "Here's a map!"}],
        "structuredContent": {
            "type": "map", "version": "1.0",
            "center": {"lat": 51.5, "lon": -0.1}, "zoom": 12,
            "layers": [...]
        }
    }
```

## View Types

| View | Description | Components Used |
|------|-------------|-----------------|
| Map | Leaflet interactive map | GeoJSON layers, clustering, popups |
| Chart | Bar, line, pie charts | Canvas rendering, responsive |
| DataTable | Sortable/filterable table | Table, Badge, Button, ScrollArea |
| Markdown | Rich text rendering | Code highlighting, tables |
| Video | HTML5 video player | Autoplay, poster, start time |
| PDF | PDF.js document viewer | Button, page navigation, zoom |
| Form | Dynamic forms | Input, Select, RadioGroup, Checkbox, Slider, Textarea |
| Dashboard | Multi-panel composition | Grid layout, cross-View communication |
| Split | Two-panel layout | Horizontal/vertical split |
| Tabs | Tabbed panels | Tabs, TabsList, TabsTrigger, TabsContent |

> All Views are self-contained single HTML files that communicate via `postMessage`.
"""
    structured = {
        "type": "markdown",
        "version": "1.0",
        "title": "MCP Views Documentation",
        "content": md,
    }

    return {
        "content": [
            {"type": "text", "text": "Showing MCP Views documentation."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 5. Video ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["video"]}},
    annotations=READ_ONLY,
)
async def show_video() -> dict:
    """Play a sample video (Big Buck Bunny — public domain)."""
    structured = {
        "type": "video",
        "version": "1.0",
        "title": "Big Buck Bunny",
        "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "poster": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
        "autoplay": False,
        "muted": False,
        "loop": False,
    }

    return {
        "content": [
            {"type": "text", "text": "Playing Big Buck Bunny sample video."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 6. PDF ──────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["pdf"]}},
    annotations=READ_ONLY,
)
async def show_pdf() -> dict:
    """Display a sample PDF document."""
    structured = {
        "type": "pdf",
        "version": "1.0",
        "title": "Sample PDF",
        "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf",
        "initialPage": 1,
    }

    return {
        "content": [
            {"type": "text", "text": "Showing sample PDF document."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 7. Form ─────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["form"]}},
    annotations=READ_ONLY,
)
async def show_form() -> dict:
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

    return {
        "content": [
            {"type": "text", "text": "Showing event registration form with 10 widget types."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 8. Dashboard ────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["dashboard"]}},
    annotations=READ_ONLY,
)
async def show_dashboard() -> dict:
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

    return {
        "content": [
            {
                "type": "text",
                "text": f"Dashboard: {len(landmarks)} landmarks across {len(continent_counts)} continents in 4 panels.",
            },
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 9. Split ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["split"]}},
    annotations=READ_ONLY,
)
async def show_split() -> dict:
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

    return {
        "content": [
            {"type": "text", "text": "Split view: documentation + chart."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── 10. Tabs ────────────────────────────────────────────────────────────────


@mcp.tool(
    meta={"ui": {"resourceUri": UI_URI["tabs"]}},
    annotations=READ_ONLY,
)
async def show_tabs() -> dict:
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

    return {
        "content": [
            {"type": "text", "text": "Tabbed view: 4 tabs (map, table, chart, form)."},
            {"type": "text", "text": json.dumps(structured)},
        ],
        "structuredContent": structured,
    }


# ── Handler tools (receive form submissions and row actions) ─────────────


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
) -> dict:
    """Handle event registration form submission."""
    return {
        "content": [
            {
                "type": "text",
                "text": (
                    f"Registration confirmed for {name}!\n"
                    f"Email: {email}\n"
                    f"Ticket: {ticket_type}\n"
                    f"Track: {track or 'Not selected'}\n"
                    f"Workshop: {workshop_date or 'None'}\n"
                    f"Experience: {experience} years\n"
                    f"Newsletter: {'Yes' if newsletter else 'No'}\n"
                    f"Referral: {referral_code or 'None'}"
                ),
            }
        ]
    }


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False),
)
async def handle_feedback(
    name: str, message: str, city: str = "", visited: bool = False, rating: int = 0
) -> dict:
    """Handle feedback form submission."""
    return {
        "content": [
            {
                "type": "text",
                "text": (
                    f"Feedback received from {name}.\n"
                    f"City: {city or 'Not specified'}\n"
                    f"Visited: {'Yes' if visited else 'No'}\n"
                    f"Rating: {rating}/10\n"
                    f"Comments: {message}"
                ),
            }
        ]
    }


@mcp.tool(annotations=READ_ONLY)
async def show_country_detail(country: str) -> dict:
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
    return {
        "content": [{"type": "text", "text": f"{country}: {desc}"}]
    }


@mcp.tool(
    annotations=ToolAnnotations(readOnlyHint=False, idempotentHint=False),
)
async def remove_country(country: str) -> dict:
    """Remove a country from the table (demo — no actual deletion)."""
    return {
        "content": [
            {
                "type": "text",
                "text": f"{country} has been removed from the display (demo only — data is static).",
            }
        ]
    }


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
