# chuk-view-schemas

Pydantic v2 schemas and FastMCP decorators for [chuk-mcp-ui](https://github.com/chrishayuk/chuk-mcp-ui) Views.

Build MCP Apps with interactive UI — charts, maps, tables, dashboards — from Python, with zero JavaScript.

## Install

```bash
# Schemas only
pip install chuk-view-schemas

# With FastMCP decorator support
pip install chuk-view-schemas[fastmcp]
```

## Quick Start

```python
from mcp.server.fastmcp import FastMCP
from chuk_view_schemas.fastmcp import chart_tool
from chuk_view_schemas.chart import ChartContent, ChartDataset

mcp = FastMCP("my-server")

@chart_tool(mcp, "show_popularity")
async def show_popularity(chart_type: str = "bar") -> ChartContent:
    """Show programming language popularity as an interactive chart."""
    return ChartContent(
        chartType=chart_type,
        title="Language Popularity",
        data=[
            ChartDataset(
                label="Usage %",
                values=[
                    {"label": "Python", "value": 31.0},
                    {"label": "JavaScript", "value": 25.2},
                    {"label": "Rust", "value": 18.1},
                ],
            )
        ],
    )
```

The `@chart_tool` decorator handles:
- Registering the `ui://` resource URI pointing to the hosted chart view
- Wrapping the return in a `CallToolResult` with `content` + `structuredContent`
- Generating a text fallback for the LLM

## Available Decorators

```python
from chuk_view_schemas.fastmcp import (
    map_tool,        # Interactive Leaflet map
    chart_tool,      # Bar, line, pie, scatter, etc.
    datatable_tool,  # Sortable, filterable table
    form_tool,       # JSON Schema driven form
    markdown_tool,   # Rich markdown rendering
    video_tool,      # HTML5 video player
    pdf_tool,        # PDF viewer
    dashboard_tool,  # Multi-panel layout
    split_tool,      # Two-panel side-by-side
    tabs_tool,       # Tabbed panels
    detail_tool,     # Single record display
    counter_tool,    # Big number with delta
    code_tool,       # Syntax highlighted code
    progress_tool,   # Progress bars
    confirm_tool,    # Confirmation dialog
    json_tool,       # JSON tree viewer
    status_tool,     # Traffic light status
    view_tool,       # Generic (any view type)
)
```

## Schemas

All schemas are Pydantic v2 models with camelCase aliases for JSON serialization:

```python
from chuk_view_schemas import (
    ChartContent, ChartDataset,
    MapContent, MapLayer,
    DataTableContent, Column,
    FormContent,
    DashboardContent, Panel,
    SplitContent, SplitPanel,
    TabsContent, Tab,
    MarkdownContent,
    VideoContent,
    PdfContent,
)
```

## View Inference

Automatically suggest the best view for your data:

```python
from chuk_view_schemas import infer_view

suggestion = infer_view([{"lat": 51.5, "lon": -0.1, "name": "London"}])
# ViewSuggestion(view="map", confidence=0.80, reason="Objects contain lat/lon fields")
```

## Hosted Views

All views are pre-built and hosted at versioned URLs on Fly.io:

```
https://chuk-mcp-ui-views.fly.dev/chart/v1
https://chuk-mcp-ui-views.fly.dev/map/v1
https://chuk-mcp-ui-views.fly.dev/datatable/v1
...
```

The decorators point at these URLs automatically. Your Python server never serves HTML.

## Links

- [chuk-mcp-ui repo](https://github.com/chrishayuk/chuk-mcp-ui) — 66 pre-built views
- [Demo server](https://mcp-view-demo.fly.dev/mcp) — 88-tool live demo
- [Storybook](https://chuk-mcp-ui-views.fly.dev/storybook/) — Browse all views
- [Playground](https://chuk-mcp-ui-views.fly.dev/playground/) — Try views with your data
