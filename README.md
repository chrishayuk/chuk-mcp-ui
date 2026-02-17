# chuk-mcp-ui

Composable UI Views for [MCP Apps](https://modelcontextprotocol.io/specification/2025-03-26/client/apps) — independently developed, dual-distributed.

10 reusable View packages that render `structuredContent` from any MCP server. One Vite build produces a single self-contained HTML file, shipped via **npm** (Node/TS servers read inline) or **Fly.io** (Python/Go servers reference by URL).

## Quick Start

### Python (hosted Views — zero frontend code)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

MAP_VIEW = "https://chuk-mcp-ui-views.fly.dev/map/v1"

@mcp.tool(meta={"ui": {"resourceUri": MAP_VIEW}})
async def show_locations() -> dict:
    return {
        "content": [{"type": "text", "text": "Showing 3 locations."}],
        "structuredContent": {
            "type": "map",
            "version": "1.0",
            "center": {"lat": 51.5, "lon": -0.1},
            "zoom": 10,
            "layers": [{
                "id": "places",
                "label": "Places",
                "features": {
                    "type": "FeatureCollection",
                    "features": [...]
                }
            }]
        }
    }
```

### TypeScript (inline from npm)

```typescript
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";

const require = createRequire(import.meta.url);
const viewHtml = readFileSync(require.resolve("@chuk/view-map"), "utf-8");

const resourceUri = "ui://my-server/map";
registerAppResource(server, "map", resourceUri, { mimeType: RESOURCE_MIME_TYPE },
  async () => ({ contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: viewHtml }] })
);
```

Same View, same `structuredContent`, two distribution paths.

## Available Views

| View | Package | URL | Description |
|------|---------|-----|-------------|
| Map | `@chuk/view-map` | [`/map/v1`](https://chuk-mcp-ui-views.fly.dev/map/v1) | Interactive Leaflet map with GeoJSON, clustering, popups |
| Chart | `@chuk/view-chart` | [`/chart/v1`](https://chuk-mcp-ui-views.fly.dev/chart/v1) | Bar, line, pie, scatter, doughnut, area, radar, bubble |
| DataTable | `@chuk/view-datatable` | [`/datatable/v1`](https://chuk-mcp-ui-views.fly.dev/datatable/v1) | Sortable, filterable table with badges and CSV export |
| Form | `@chuk/view-form` | [`/form/v1`](https://chuk-mcp-ui-views.fly.dev/form/v1) | Dynamic forms from JSON Schema |
| Markdown | `@chuk/view-markdown` | [`/markdown/v1`](https://chuk-mcp-ui-views.fly.dev/markdown/v1) | Rich markdown with code blocks, tables, links |
| Video | `@chuk/view-video` | [`/video/v1`](https://chuk-mcp-ui-views.fly.dev/video/v1) | HTML5 video player with poster and start time |
| PDF | `@chuk/view-pdf` | [`/pdf/v1`](https://chuk-mcp-ui-views.fly.dev/pdf/v1) | PDF.js viewer with page navigation and zoom |
| Dashboard | `@chuk/view-dashboard` | [`/dashboard/v1`](https://chuk-mcp-ui-views.fly.dev/dashboard/v1) | Multi-panel composition with cross-View communication |
| Split | `@chuk/view-split` | [`/split/v1`](https://chuk-mcp-ui-views.fly.dev/split/v1) | Two-panel side-by-side layout |
| Tabs | `@chuk/view-tabs` | [`/tabs/v1`](https://chuk-mcp-ui-views.fly.dev/tabs/v1) | Tabbed panel switching |

All Views are hosted at `https://chuk-mcp-ui-views.fly.dev`.

## Demo MCP Server

A live demo server showcases all 10 Views via streamable HTTP:

```
https://mcp-view-demo.fly.dev/mcp
```

Connect from any MCP client:

```json
{
  "mcpServers": {
    "view-demo": {
      "type": "streamable-http",
      "url": "https://mcp-view-demo.fly.dev/mcp"
    }
  }
}
```

11 tools available: `show_map`, `show_chart`, `show_table`, `show_markdown`, `show_video`, `show_pdf`, `show_form`, `show_dashboard`, `show_split`, `show_tabs`, `handle_feedback`.

## Schema Exports

Every View publishes its schema in four formats:

| Format | Export | Consumer |
|--------|--------|----------|
| HTML | `@chuk/view-map` (main) | MCP hosts — the View itself |
| JSON Schema | `@chuk/view-map/schema` | Any language, runtime validation |
| TypeScript | `@chuk/view-map/types` | TS servers, compile-time |
| Zod | `@chuk/view-map/zod` | TS servers, runtime + compile-time |

Python servers use the Pydantic package:

```bash
pip install chuk-view-schemas
```

```python
from chuk_view_schemas import MapContent

data = MapContent(
    center={"lat": 51.5, "lon": -0.1},
    zoom=12,
    layers=[...]
)
payload = data.model_dump(by_alias=True)  # camelCase output
```

## Composition

Dashboard, split, and tabs Views embed other Views by URL:

```python
DASHBOARD_VIEW = "https://chuk-mcp-ui-views.fly.dev/dashboard/v1"
MAP_VIEW = "https://chuk-mcp-ui-views.fly.dev/map/v1"
TABLE_VIEW = "https://chuk-mcp-ui-views.fly.dev/datatable/v1"

@mcp.tool(meta={"ui": {"resourceUri": DASHBOARD_VIEW}})
async def overview() -> dict:
    return {
        "structuredContent": {
            "type": "dashboard", "version": "1.0",
            "layout": "grid",
            "panels": [
                {"id": "map", "viewUrl": MAP_VIEW, "width": "60%",
                 "structuredContent": {"type": "map", "version": "1.0", ...}},
                {"id": "table", "viewUrl": TABLE_VIEW, "width": "40%",
                 "structuredContent": {"type": "datatable", "version": "1.0", ...}},
            ]
        }
    }
```

Cross-View communication is built in — click a map marker, the table highlights the row.

## Development

```bash
pnpm install
pnpm build        # Build all 10 Views (Turbo parallel)
pnpm test         # Run all tests
pnpm type-check   # TypeScript strict checking
pnpm dev          # Dev servers with hot reload
```

### Monorepo Structure

```
chuk-mcp-ui/
  apps/
    map/            @chuk/view-map
    chart/          @chuk/view-chart
    datatable/      @chuk/view-datatable
    form/           @chuk/view-form
    markdown/       @chuk/view-markdown
    video/          @chuk/view-video
    pdf/            @chuk/view-pdf
    dashboard/      @chuk/view-dashboard
    split/          @chuk/view-split
    tabs/           @chuk/view-tabs
  packages/
    shared/         Shared utilities (lifecycle, theme, actions, fallback)
  examples/
    demo-server/    Python MCP server (all 10 Views, hosted on Fly.io)
    python-heritage/ Python heritage exploration example
    ts-inline/      TypeScript inline distribution example
  chuk-view-schemas/  Python Pydantic models (PyPI)
```

## Architecture

See [architecture.md](./architecture.md) for the full design — dual distribution model, structuredContent contract, composition, theming, and interaction protocol.

## Roadmap

See [roadmap.md](./roadmap.md) for the phased development plan.
