# chuk-mcp-ui

Composable UI Views for [MCP Apps](https://modelcontextprotocol.io/specification/2025-03-26/client/apps) — independently developed, dual-distributed.

51 reusable View packages that render `structuredContent` from any MCP server. One Vite build produces a single self-contained HTML file, shipped via **npm** (Node/TS servers read inline) or **Fly.io** (Python/Go servers reference by URL).

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

### Core (17)

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
| Detail | `@chuk/view-detail` | [`/detail/v1`](https://chuk-mcp-ui-views.fly.dev/detail/v1) | Key-value detail display with sections |
| Counter | `@chuk/view-counter` | [`/counter/v1`](https://chuk-mcp-ui-views.fly.dev/counter/v1) | Interactive counter with increment/decrement |
| Code | `@chuk/view-code` | [`/code/v1`](https://chuk-mcp-ui-views.fly.dev/code/v1) | Syntax-highlighted code viewer (Shiki) |
| Progress | `@chuk/view-progress` | [`/progress/v1`](https://chuk-mcp-ui-views.fly.dev/progress/v1) | Progress bars and step indicators |
| Confirm | `@chuk/view-confirm` | [`/confirm/v1`](https://chuk-mcp-ui-views.fly.dev/confirm/v1) | Confirmation dialog with actions |
| Json | `@chuk/view-json` | [`/json/v1`](https://chuk-mcp-ui-views.fly.dev/json/v1) | Interactive JSON tree viewer |
| Status | `@chuk/view-status` | [`/status/v1`](https://chuk-mcp-ui-views.fly.dev/status/v1) | Status indicators and health checks |

### Interactive (10)

| View | Package | URL | Description |
|------|---------|-----|-------------|
| Compare | `@chuk/view-compare` | [`/compare/v1`](https://chuk-mcp-ui-views.fly.dev/compare/v1) | Side-by-side comparison with slider |
| Gallery | `@chuk/view-gallery` | [`/gallery/v1`](https://chuk-mcp-ui-views.fly.dev/gallery/v1) | Image gallery with lightbox and grid layout |
| Ranked | `@chuk/view-ranked` | [`/ranked/v1`](https://chuk-mcp-ui-views.fly.dev/ranked/v1) | Ranked list with scores, badges, and movement indicators |
| Poll | `@chuk/view-poll` | [`/poll/v1`](https://chuk-mcp-ui-views.fly.dev/poll/v1) | Interactive poll with live results |
| Quiz | `@chuk/view-quiz` | [`/quiz/v1`](https://chuk-mcp-ui-views.fly.dev/quiz/v1) | Multi-question quiz with scoring |
| Chat | `@chuk/view-chat` | [`/chat/v1`](https://chuk-mcp-ui-views.fly.dev/chat/v1) | Chat message thread with avatars |
| Image | `@chuk/view-image` | [`/image/v1`](https://chuk-mcp-ui-views.fly.dev/image/v1) | Image viewer with annotations and zoom |
| Log | `@chuk/view-log` | [`/log/v1`](https://chuk-mcp-ui-views.fly.dev/log/v1) | Log viewer with severity filtering |
| Timeline | `@chuk/view-timeline` | [`/timeline/v1`](https://chuk-mcp-ui-views.fly.dev/timeline/v1) | Chronological event timeline |
| Tree | `@chuk/view-tree` | [`/tree/v1`](https://chuk-mcp-ui-views.fly.dev/tree/v1) | Expandable tree with icons and search |

### Developer & Config (7)

| View | Package | URL | Description |
|------|---------|-----|-------------|
| Alert | `@chuk/view-alert` | [`/alert/v1`](https://chuk-mcp-ui-views.fly.dev/alert/v1) | Notification cards with severity levels |
| Diff | `@chuk/view-diff` | [`/diff/v1`](https://chuk-mcp-ui-views.fly.dev/diff/v1) | Unified and split diff rendering |
| Embed | `@chuk/view-embed` | [`/embed/v1`](https://chuk-mcp-ui-views.fly.dev/embed/v1) | Generic iframe wrapper with toolbar |
| Filter | `@chuk/view-filter` | [`/filter/v1`](https://chuk-mcp-ui-views.fly.dev/filter/v1) | Standalone filter bar with bus integration |
| Kanban | `@chuk/view-kanban` | [`/kanban/v1`](https://chuk-mcp-ui-views.fly.dev/kanban/v1) | Card board with drag-and-drop |
| Settings | `@chuk/view-settings` | [`/settings/v1`](https://chuk-mcp-ui-views.fly.dev/settings/v1) | Configuration panel with sections |
| Stepper | `@chuk/view-stepper` | [`/stepper/v1`](https://chuk-mcp-ui-views.fly.dev/stepper/v1) | Multi-step progress indicator |

### Data Visualization (10)

| View | Package | URL | Description |
|------|---------|-----|-------------|
| Gauge | `@chuk/view-gauge` | [`/gauge/v1`](https://chuk-mcp-ui-views.fly.dev/gauge/v1) | Single-value arc metric with thresholds |
| Heatmap | `@chuk/view-heatmap` | [`/heatmap/v1`](https://chuk-mcp-ui-views.fly.dev/heatmap/v1) | Grid heatmap with color scales |
| Crosstab | `@chuk/view-crosstab` | [`/crosstab/v1`](https://chuk-mcp-ui-views.fly.dev/crosstab/v1) | Matrix with conditional formatting |
| Scatter | `@chuk/view-scatter` | [`/scatter/v1`](https://chuk-mcp-ui-views.fly.dev/scatter/v1) | Scatter/bubble plot (Chart.js) |
| Boxplot | `@chuk/view-boxplot` | [`/boxplot/v1`](https://chuk-mcp-ui-views.fly.dev/boxplot/v1) | Box-and-whisker diagrams (SVG) |
| Timeseries | `@chuk/view-timeseries` | [`/timeseries/v1`](https://chuk-mcp-ui-views.fly.dev/timeseries/v1) | Time-axis chart with annotations (Chart.js) |
| Treemap | `@chuk/view-treemap` | [`/treemap/v1`](https://chuk-mcp-ui-views.fly.dev/treemap/v1) | Nested rectangles with drill-down (Canvas) |
| Sunburst | `@chuk/view-sunburst` | [`/sunburst/v1`](https://chuk-mcp-ui-views.fly.dev/sunburst/v1) | Radial hierarchical chart (SVG) |
| Pivot | `@chuk/view-pivot` | [`/pivot/v1`](https://chuk-mcp-ui-views.fly.dev/pivot/v1) | Pivot table with aggregation engine |
| Profile | `@chuk/view-profile` | [`/profile/v1`](https://chuk-mcp-ui-views.fly.dev/profile/v1) | Elevation/cross-section line (Chart.js) |

### Specialist (7)

| View | Package | URL | Description |
|------|---------|-----|-------------|
| Audio | `@chuk/view-audio` | [`/audio/v1`](https://chuk-mcp-ui-views.fly.dev/audio/v1) | Audio player with canvas waveform |
| Carousel | `@chuk/view-carousel` | [`/carousel/v1`](https://chuk-mcp-ui-views.fly.dev/carousel/v1) | Image/content carousel with auto-play |
| Terminal | `@chuk/view-terminal` | [`/terminal/v1`](https://chuk-mcp-ui-views.fly.dev/terminal/v1) | Terminal with ANSI color support |
| GIS Legend | `@chuk/view-gis-legend` | [`/gis-legend/v1`](https://chuk-mcp-ui-views.fly.dev/gis-legend/v1) | Cartographic legend with symbology |
| Layers | `@chuk/view-layers` | [`/layers/v1`](https://chuk-mcp-ui-views.fly.dev/layers/v1) | Multi-layer map with legend (Leaflet) |
| Minimap | `@chuk/view-minimap` | [`/minimap/v1`](https://chuk-mcp-ui-views.fly.dev/minimap/v1) | Overview-detail dual map (Leaflet) |
| Spectrogram | `@chuk/view-spectrogram` | [`/spectrogram/v1`](https://chuk-mcp-ui-views.fly.dev/spectrogram/v1) | Audio frequency visualization (Canvas) |

All Views are hosted at `https://chuk-mcp-ui-views.fly.dev`.

## Demo MCP Server

A live demo server showcases Views via streamable HTTP:

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

## Developer Experience

### Playground

Browse and test every View interactively at [`/playground`](https://chuk-mcp-ui-views.fly.dev/playground). Source lives in `apps/playground/`.

### CLI Scaffolder

```bash
pnpm create chuk-view my-widget
```

Generates a ready-to-develop View workspace with schema, tests, and Storybook story. Source lives in `packages/create-chuk-view/`.

### Server-Side Helpers

**Python** — decorate any FastMCP tool to auto-attach View metadata:

```python
from chuk_view_schemas.fastmcp import map_tool

@map_tool(mcp)
async def show_locations() -> dict:
    ...
```

**TypeScript** — build View metadata in one call:

```typescript
import { buildViewMeta } from "@chuk/view-shared/server";

const meta = buildViewMeta("map", { version: "1.0" });
```

### Cross-View Message Bus

Views can publish and subscribe to a shared event bus for inter-panel coordination:

```typescript
import { useViewBus, ViewBusProvider } from "@chuk/view-shared";
```

Wrap a composition in `<ViewBusProvider>`, then call `useViewBus()` inside any child View to send or receive messages.

### View Hook Family

Eleven purpose-built hooks for common View patterns, all exported from `@chuk/view-shared`:

| Hook | Purpose |
|------|---------|
| `useViewStream` | Progressive rendering from `ontoolinputpartial` — show data as it arrives |
| `useViewSelection` | Shared selection state across composed Views (click map -> highlight table row) |
| `useViewFilter` | Cross-View filtering (filter in datatable -> map updates, chart updates) |
| `useViewUndo` | Undo/redo stack for interactive Views (form edits, drawing on map) |
| `useViewExport` | Standardised export (PNG screenshot, CSV data, JSON payload) from any View |
| `useViewResize` | Responsive breakpoint detection inside the iframe |
| `useViewToast` | Toast notifications with severity levels |
| `useViewNavigation` | Navigation history and breadcrumb tracking |
| `useViewAuth` | Authentication state and credential management |
| `useViewLiveData` | Real-time data subscriptions and live updates |
| `useViewDrag` | Drag-and-drop handling for interactive Views |

```typescript
import { useViewSelection, useViewResize } from "@chuk/view-shared";

// Shared selection across composed Views
const { selectedIds, highlightedId, select, highlight } = useViewSelection();

// Responsive layout inside an iframe
const { width, breakpoint } = useViewResize({ ref: containerRef });
```

## Development

```bash
pnpm install
pnpm build            # Build all 51 Views (Turbo parallel)
pnpm test             # Run all tests (1000+ tests)
pnpm type-check       # TypeScript strict checking
pnpm dev              # Dev servers with hot reload
pnpm storybook        # Storybook dev server on port 6006
pnpm build-storybook  # Static Storybook build
```

### Storybook

231 stories across 77 groups cover every component, View, and hook:

- **15 component stories** — Button, Card, Badge, Input, Select, Checkbox, RadioGroup, Slider, Textarea, Label, Table, Tabs, ScrollArea, Separator, Tooltip
- **51 View stories** — Map, Chart, DataTable, Form, Markdown, Video, PDF, Dashboard, Split, Tabs, Detail, Counter, Code, Progress, Confirm, Json, Status, Compare, Gallery, Ranked, Poll, Quiz, Chat, Image, Log, Timeline, Tree, Alert, Diff, Embed, Filter, Kanban, Settings, Stepper, Gauge, Heatmap, Crosstab, Scatter, Boxplot, Timeseries, Treemap, Sunburst, Pivot, Profile, Audio, Carousel, Terminal, GIS Legend, Layers, Minimap, Spectrogram
- **11 hook stories** — useViewResize, useViewUndo, useViewStream, useViewSelection, useViewFilter, useViewExport, useViewToast, useViewNavigation, useViewAuth, useViewLiveData, useViewDrag

Theme toggle (light/dark) in the toolbar via `applyTheme()`. Run `pnpm storybook` to browse.

### Monorepo Structure

```
chuk-mcp-ui/
  apps/                     51 View packages + playground
    # Core (17)
    map/                    @chuk/view-map
    chart/                  @chuk/view-chart
    datatable/              @chuk/view-datatable
    form/                   @chuk/view-form
    markdown/               @chuk/view-markdown
    video/                  @chuk/view-video
    pdf/                    @chuk/view-pdf
    dashboard/              @chuk/view-dashboard
    split/                  @chuk/view-split
    tabs/                   @chuk/view-tabs
    detail/                 @chuk/view-detail
    counter/                @chuk/view-counter
    code/                   @chuk/view-code
    progress/               @chuk/view-progress
    confirm/                @chuk/view-confirm
    json/                   @chuk/view-json
    status/                 @chuk/view-status
    # Interactive (10)
    compare/                @chuk/view-compare
    gallery/                @chuk/view-gallery
    ranked/                 @chuk/view-ranked
    poll/                   @chuk/view-poll
    quiz/                   @chuk/view-quiz
    chat/                   @chuk/view-chat
    image/                  @chuk/view-image
    log/                    @chuk/view-log
    timeline/               @chuk/view-timeline
    tree/                   @chuk/view-tree
    # Developer & Config (7)
    alert/                  @chuk/view-alert
    diff/                   @chuk/view-diff
    embed/                  @chuk/view-embed
    filter/                 @chuk/view-filter
    kanban/                 @chuk/view-kanban
    settings/               @chuk/view-settings
    stepper/                @chuk/view-stepper
    # Data Visualization (10)
    gauge/                  @chuk/view-gauge
    heatmap/                @chuk/view-heatmap
    crosstab/               @chuk/view-crosstab
    scatter/                @chuk/view-scatter
    boxplot/                @chuk/view-boxplot
    timeseries/             @chuk/view-timeseries
    treemap/                @chuk/view-treemap
    sunburst/               @chuk/view-sunburst
    pivot/                  @chuk/view-pivot
    profile/                @chuk/view-profile
    # Specialist (7)
    audio/                  @chuk/view-audio
    carousel/               @chuk/view-carousel
    terminal/               @chuk/view-terminal
    gis-legend/             @chuk/view-gis-legend
    layers/                 @chuk/view-layers
    minimap/                @chuk/view-minimap
    spectrogram/            @chuk/view-spectrogram
    # Other
    playground/             Developer playground (deployed at /playground)
  packages/
    shared/                 Hooks, message bus, theme, actions, fallback
    ui/                     Design system (Tailwind v4 + shadcn/ui + Framer Motion)
    create-chuk-view/       CLI scaffolder for new Views
  .storybook/               Storybook config (main, preview, theme decorator)
  examples/
    demo-server/            Python MCP server (hosted on Fly.io)
    python-heritage/        Python heritage exploration example
    ts-inline/              TypeScript inline distribution example
  chuk-view-schemas/        Python Pydantic models (PyPI)
```

## Architecture

See [architecture.md](./architecture.md) for the full design — dual distribution model, structuredContent contract, composition, theming, and interaction protocol.

## Roadmap

See [roadmap.md](./roadmap.md) for the phased development plan.
