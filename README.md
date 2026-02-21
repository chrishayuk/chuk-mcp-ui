# chuk-mcp-ui

A monorepo of **52 standalone MCP (Model Context Protocol) UI views**, each built as a single-file HTML app with Vite + vite-plugin-singlefile. Views communicate with LLMs through the MCP ext-apps protocol and with each other through the ViewBus cross-view message bus.

## Getting Started

**Prerequisites:** Node.js 18+ and pnpm 9.15.4

```bash
# Install dependencies
pnpm install

# Build all packages and apps
pnpm build

# Launch Storybook dev server
pnpm storybook

# Run tests
pnpm test

# TypeScript type-check
pnpm type-check
```

## Project Structure

```
chuk-mcp-ui/
├── apps/
│   ├── dashboard/     # Composable dashboard + runtime engine
│   ├── map/           # Leaflet map view
│   ├── datatable/     # Data table view
│   ├── chart/         # Chart.js chart view
│   ├── form/          # Dynamic form view
│   ├── ...            # 47 more view apps
│   └── playground/    # Dev playground
├── packages/
│   ├── shared/        # @chuk/view-shared — hooks, ViewBus, theme
│   └── ui/            # @chuk/view-ui — design system components
├── .storybook/        # Storybook v8.5 config
├── turbo.json
└── package.json
```

## Architecture

### Single-File Views

Every app produces a self-contained HTML file. Each view calls `useView<T>()` from `@chuk/view-shared` to connect to the MCP ext-apps protocol.

### ext-apps Protocol

Views interact with the LLM runtime through three channels:

- **`app.updateModelContext()`** — push UI state into the model context
- **`app.sendMessage()`** — send high-priority events to the host
- **`app.oncalltool`** — expose state that the LLM can query on demand

### ViewBus

A cross-view message bus enabling panels to communicate through `select`, `filter`, `highlight`, and `navigate` events. This is the backbone of multi-view coordination inside the dashboard.

### Dashboard Runtime

The dashboard view is a composable layout engine with three capability tiers:

| Tier | Capability |
|------|------------|
| **v1.0** | Static grid/split layout with explicit `viewUrls` |
| **v2.0** | Composable panels with `viewType` resolution, auto layout, cross-view links, conditional panels |
| **v3.0** | Conversation-driven UI runtime: UIStateStore, EventQueue, PatchEngine, StateEmitter |

### Packages

| Package | npm Name | Description |
|---------|----------|-------------|
| `packages/shared` | `@chuk/view-shared` | `useView` hook, ViewBus, theme utilities |
| `packages/ui` | `@chuk/view-ui` | Design system (button, badge, card, checkbox, input, label, radio-group, scroll-area, select, separator, slider, table, tabs, textarea, tooltip) built with Tailwind CSS v4 |

## Available Views

### Core (17)
`map` `datatable` `chart` `form` `markdown` `video` `pdf` `dashboard` `split` `tabs` `detail` `counter` `code` `progress` `confirm` `json` `status`

### Interactive (10)
`compare` `gallery` `ranked` `poll` `quiz` `chat` `image` `log` `timeline` `tree`

### Developer (7)
`alert` `diff` `embed` `filter` `kanban` `settings` `stepper`

### Data Visualization (10)
`gauge` `heatmap` `crosstab` `scatter` `boxplot` `timeseries` `treemap` `sunburst` `pivot` `profile`

### Specialist (7)
`audio` `carousel` `terminal` `gis-legend` `layers` `minimap` `spectrogram`

## Demo MCP Server

A fully working 52-tool MCP server is included at `examples/demo-server/`. It registers all views as tools and serves them over streamable-HTTP.

```bash
cd examples/demo-server
uv run server.py
```

Deployed at `mcp-view-demo.fly.dev/mcp`. See [examples/demo-server/FINDINGS.md](examples/demo-server/FINDINGS.md) for lessons learned shipping ext-apps views over MCP.

### Key Patterns for MCP Server Authors

1. **Return `CallToolResult`**, not a plain dict — FastMCP silently drops `structuredContent` from dicts
2. **Hide resources from `list_resources()`** — hosts pre-fetch all resources at connect time, hitting size limits
3. **Use `resourceUri`** in tool metadata — `viewUrl` is not in the ext-apps spec

```python
from mcp.types import CallToolResult, TextContent

@mcp.tool(meta={"ui": {"resourceUri": "ui://my-server/chart"}})
async def show_chart(chart_type: str = "bar") -> CallToolResult:
    structured = {"type": "chart", "version": "1.0", "chartType": chart_type, ...}
    return CallToolResult(
        content=[TextContent(type="text", text="Chart data.")],
        structuredContent=structured,
    )
```

## Server-Side Helpers

### Python (FastMCP Decorators)

The `chuk-view-schemas` package provides 17 per-view decorators:

```python
from chuk_view_schemas.fastmcp import map_tool

@map_tool(mcp, "show_sites")
async def show_sites() -> MapContent:
    return MapContent(center={"lat": 51.5, "lon": -0.1}, layers=[...])
```

### TypeScript

```typescript
import { getViewUrl, buildViewMeta, wrapViewResult } from "@chuk/view-shared/server";

const url = getViewUrl("map");           // https://chuk-mcp-ui-views.fly.dev/map/v1
const meta = buildViewMeta("map");       // { ui: { resourceUri: "..." } }
const result = wrapViewResult("map", { structuredContent: mapData });
```

## CDN URLs

All views are deployed to Fly.io at versioned URLs:

```
https://chuk-mcp-ui-views.fly.dev/{view-name}/v1
```

Examples: `.../map/v1`, `.../chart/v1`, `.../dashboard/v1`

## Hooks

`@chuk/view-shared` provides 12 purpose-built hooks beyond the core `useView`:

| Hook | Purpose |
|------|---------|
| `useViewStream` | Progressive rendering from `ontoolinputpartial` |
| `useViewSelection` | Shared selection state across composed views |
| `useViewFilter` | Cross-view filtering with predicate composition |
| `useViewUndo` | Undo/redo state management with history stack |
| `useViewExport` | CSV generation and clipboard export |
| `useViewResize` | Responsive breakpoint detection inside iframes |
| `useViewToast` | Toast notification queue with auto-dismiss |
| `useViewNavigation` | Navigation breadcrumb state for hierarchical views |
| `useViewAuth` | Auth credential handling for protected resources |
| `useViewLiveData` | Polling and SSE live data subscriptions |
| `useViewDrag` | Cross-view drag and drop via ViewBus |
| `useViewEvents` | Typed event emission (`select`, `filter-change`, `submit`, `action`, `draw`) |

## Development

```bash
# Dev mode (all apps + packages in watch mode)
pnpm dev

# Build everything via Turborepo
pnpm build

# Run all tests
pnpm test

# TypeScript strict checking
pnpm type-check

# Storybook dev server on port 6006
pnpm storybook

# Static Storybook build
pnpm build-storybook

# Clean all build artifacts
pnpm clean
```

Each app under `apps/` is an independent Vite project. To work on a single view, run `pnpm dev` from within that app directory.
