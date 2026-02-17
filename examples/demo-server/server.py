"""
Demo MCP server showcasing all 10 chuk-mcp-ui Views from Fly.io.

Run:
    pip install "mcp[cli]>=1.0.0"
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

import os

from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "view-demo",
    host="0.0.0.0",
    port=int(os.getenv("PORT", "8000")),
)

# All Views are hosted on Fly.io
BASE = "https://chuk-mcp-ui-views.fly.dev"
MAP_VIEW = f"{BASE}/map/v1"
CHART_VIEW = f"{BASE}/chart/v1"
TABLE_VIEW = f"{BASE}/datatable/v1"
MARKDOWN_VIEW = f"{BASE}/markdown/v1"
VIDEO_VIEW = f"{BASE}/video/v1"
PDF_VIEW = f"{BASE}/pdf/v1"
FORM_VIEW = f"{BASE}/form/v1"
DASHBOARD_VIEW = f"{BASE}/dashboard/v1"
SPLIT_VIEW = f"{BASE}/split/v1"
TABS_VIEW = f"{BASE}/tabs/v1"


# ── 1. Map ──────────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": MAP_VIEW}})
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

    return {
        "content": [
            {"type": "text", "text": f"Showing {len(landmarks)} world landmarks."}
        ],
        "structuredContent": {
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
        },
    }


# ── 2. Chart ────────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": CHART_VIEW}})
async def show_chart(chart_type: str = "bar") -> dict:
    """Show programming language popularity as a chart. chart_type: bar, pie, or line."""
    return {
        "content": [
            {
                "type": "text",
                "text": f"Programming language popularity ({chart_type} chart).",
            }
        ],
        "structuredContent": {
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
        },
    }


# ── 3. DataTable ────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": TABLE_VIEW}})
async def show_table() -> dict:
    """Show country data in a sortable, filterable table."""
    countries = [
        ("Japan", "Asia", 125.7, 4940.88, "High income"),
        ("Brazil", "South America", 214.3, 1920.10, "Upper middle"),
        ("Germany", "Europe", 83.2, 4259.93, "High income"),
        ("Nigeria", "Africa", 223.8, 477.39, "Lower middle"),
        ("Australia", "Oceania", 26.4, 1724.79, "High income"),
        ("Canada", "North America", 39.6, 2139.84, "High income"),
        ("India", "Asia", 1428.6, 3732.22, "Lower middle"),
        ("France", "Europe", 67.8, 2923.49, "High income"),
    ]

    income_colors = {
        "High income": "#2a9d8f",
        "Upper middle": "#e9c46a",
        "Lower middle": "#e76f51",
    }

    return {
        "content": [
            {"type": "text", "text": f"Showing {len(countries)} countries."}
        ],
        "structuredContent": {
            "type": "datatable",
            "version": "1.0",
            "title": "World Countries",
            "sortable": True,
            "filterable": True,
            "exportable": True,
            "columns": [
                {"key": "name", "label": "Country", "sortable": True},
                {"key": "continent", "label": "Continent", "sortable": True},
                {
                    "key": "population",
                    "label": "Population (M)",
                    "type": "number",
                    "sortable": True,
                },
                {
                    "key": "gdp",
                    "label": "GDP ($B)",
                    "type": "number",
                    "sortable": True,
                },
                {
                    "key": "income",
                    "label": "Income Level",
                    "type": "badge",
                    "badgeColors": income_colors,
                },
            ],
            "rows": [
                {
                    "name": name,
                    "continent": cont,
                    "population": pop,
                    "gdp": gdp,
                    "income": inc,
                }
                for name, cont, pop, gdp, inc in countries
            ],
        },
    }


# ── 4. Markdown ─────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": MARKDOWN_VIEW}})
async def show_markdown() -> dict:
    """Show a rich markdown document with headings, code, tables, and lists."""
    content = """\
# MCP Views Demo

Welcome to the **chuk-mcp-ui** View system. This document is rendered using the
Markdown View, powered by [marked](https://github.com/markedjs/marked).

## Features

- **10 View types**: map, chart, datatable, form, markdown, video, pdf, dashboard, split, tabs
- **Dual distribution**: npm packages (inline) + Fly.io CDN (URL reference)
- **Triple schema**: JSON Schema + Zod (TypeScript) + Pydantic (Python)
- **Themeable**: All Views respect the host client's color scheme

## Code Example

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool(meta={"ui": {"resourceUri": "https://chuk-mcp-ui-views.fly.dev/map/v1"}})
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

| View | Description | Key Feature |
|------|-------------|-------------|
| Map | Leaflet interactive map | GeoJSON layers, clustering, popups |
| Chart | Bar, line, pie charts | Canvas rendering, responsive |
| DataTable | Sortable/filterable table | CSV export, badges, actions |
| Markdown | Rich text rendering | Code highlighting, tables |
| Video | HTML5 video player | Autoplay, poster, start time |
| PDF | PDF.js document viewer | Page navigation, zoom |
| Form | Dynamic forms | JSON Schema fields, validation |
| Dashboard | Multi-panel composition | Grid layout, cross-View comms |
| Split | Two-panel layout | Horizontal/vertical split |
| Tabs | Tabbed panels | Switchable Views |

> All Views are self-contained single HTML files that communicate via `postMessage`.
"""
    return {
        "content": [{"type": "text", "text": "Showing MCP Views documentation."}],
        "structuredContent": {
            "type": "markdown",
            "version": "1.0",
            "title": "MCP Views Documentation",
            "content": content,
        },
    }


# ── 5. Video ────────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": VIDEO_VIEW}})
async def show_video() -> dict:
    """Play a sample video (Big Buck Bunny — public domain)."""
    return {
        "content": [{"type": "text", "text": "Playing Big Buck Bunny sample video."}],
        "structuredContent": {
            "type": "video",
            "version": "1.0",
            "title": "Big Buck Bunny",
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "poster": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
            "autoplay": False,
            "muted": False,
            "loop": False,
        },
    }


# ── 6. PDF ──────────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": PDF_VIEW}})
async def show_pdf() -> dict:
    """Display a sample PDF document."""
    return {
        "content": [{"type": "text", "text": "Showing sample PDF document."}],
        "structuredContent": {
            "type": "pdf",
            "version": "1.0",
            "title": "Sample PDF",
            "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf",
            "initialPage": 1,
        },
    }


# ── 7. Form ─────────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": FORM_VIEW}})
async def show_form() -> dict:
    """Show a contact/feedback form."""
    return {
        "content": [{"type": "text", "text": "Showing feedback form."}],
        "structuredContent": {
            "type": "form",
            "version": "1.0",
            "title": "Send Feedback",
            "submitLabel": "Submit Feedback",
            "submitTool": "handle_feedback",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "title": "Your Name"},
                    "email": {
                        "type": "string",
                        "title": "Email",
                        "format": "email",
                    },
                    "category": {
                        "type": "string",
                        "title": "Category",
                        "enum": ["Bug Report", "Feature Request", "General"],
                    },
                    "message": {"type": "string", "title": "Message"},
                    "rating": {
                        "type": "number",
                        "title": "Rating (1-5)",
                        "minimum": 1,
                        "maximum": 5,
                    },
                },
                "required": ["name", "message"],
            },
            "uiSchema": {
                "message": {"ui:widget": "textarea", "ui:rows": 4},
            },
        },
    }


# ── 8. Dashboard ────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": DASHBOARD_VIEW}})
async def show_dashboard() -> dict:
    """Show a composed dashboard with map, chart, and table panels."""
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

    return {
        "content": [
            {
                "type": "text",
                "text": f"Dashboard: {len(landmarks)} landmarks across {len(continent_counts)} continents.",
            }
        ],
        "structuredContent": {
            "type": "dashboard",
            "version": "1.0",
            "title": "World Landmarks Dashboard",
            "layout": "grid",
            "gap": "6px",
            "panels": [
                {
                    "id": "map-panel",
                    "label": "Map",
                    "viewUrl": MAP_VIEW,
                    "width": "60%",
                    "height": "60%",
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
                    "viewUrl": CHART_VIEW,
                    "width": "40%",
                    "height": "60%",
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
                    "viewUrl": TABLE_VIEW,
                    "width": "100%",
                    "height": "40%",
                    "structuredContent": {
                        "type": "datatable",
                        "version": "1.0",
                        "title": "Landmarks",
                        "sortable": True,
                        "filterable": True,
                        "columns": [
                            {"key": "name", "label": "Name"},
                            {"key": "continent", "label": "Continent"},
                        ],
                        "rows": [
                            {"name": name, "continent": cont}
                            for name, _, _, cont in landmarks
                        ],
                    },
                },
            ],
        },
    }


# ── 9. Split ────────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": SPLIT_VIEW}})
async def show_split() -> dict:
    """Show a side-by-side split view: markdown on the left, chart on the right."""
    return {
        "content": [
            {"type": "text", "text": "Split view: documentation + chart."}
        ],
        "structuredContent": {
            "type": "split",
            "version": "1.0",
            "direction": "horizontal",
            "ratio": 50,
            "left": {
                "viewUrl": MARKDOWN_VIEW,
                "structuredContent": {
                    "type": "markdown",
                    "version": "1.0",
                    "content": "# Language Stats\n\nThis panel shows a **markdown** document alongside a chart.\n\n- Python leads with **28.1%**\n- JavaScript follows at **21.3%**\n- TypeScript is rising at **12.7%**\n\n> Use split views to show related content side by side.",
                },
            },
            "right": {
                "viewUrl": CHART_VIEW,
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
        },
    }


# ── 10. Tabs ────────────────────────────────────────────────────────────────


@mcp.tool(meta={"ui": {"resourceUri": TABS_VIEW}})
async def show_tabs() -> dict:
    """Show a tabbed view with map, table, and chart tabs."""
    return {
        "content": [{"type": "text", "text": "Tabbed view: 3 tabs."}],
        "structuredContent": {
            "type": "tabs",
            "version": "1.0",
            "activeTab": "map-tab",
            "tabs": [
                {
                    "id": "map-tab",
                    "label": "Map",
                    "viewUrl": MAP_VIEW,
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
                    "viewUrl": TABLE_VIEW,
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
                    "viewUrl": CHART_VIEW,
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
            ],
        },
    }


# ── Form handler (receives form submissions) ───────────────────────────────


@mcp.tool()
async def handle_feedback(
    name: str, message: str, email: str = "", category: str = "", rating: int = 0
) -> dict:
    """Handle feedback form submission."""
    return {
        "content": [
            {
                "type": "text",
                "text": (
                    f"Feedback received from {name}.\n"
                    f"Category: {category or 'General'}\n"
                    f"Rating: {rating}/5\n"
                    f"Message: {message}"
                ),
            }
        ]
    }


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
