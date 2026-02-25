# chuk-mcp-ui Roadmap

---

## Phase 1 — Prove the Pattern ✓

**Goal:** Ship two Views with dual distribution. Prove both paths work:
npm inline for Node/TS servers, CDN hosted for Python servers.

**Status: Complete.** All deliverables shipped. Hosted on Fly.io at
`mcp-views.chukai.io` (npm publish pending).

### Deliverables

- [x] Monorepo setup (Turborepo + pnpm workspaces)
- [x] `packages/shared` — lifecycle, theme, action resolver, fallback
- [x] Vite build pipeline with `vite-plugin-singlefile`
  - Each View builds to a single `dist/mcp-app.html`
  - Same artifact publishes to npm and deploys to Fly.io
- [x] `view-datatable` — sortable, filterable, badges, CSV export
- [x] `view-map` — Leaflet, GeoJSON layers, clustering, popups, actions
- [x] Deploy to Fly.io
  - `mcp-views.chukai.io/datatable/v1`
  - `mcp-views.chukai.io/map/v1`
- [x] TypeScript example: MCP server using npm inline path
- [x] Python example: heritage exploration using hosted path
- [x] Python schema package: `chuk-view-schemas` (Pydantic v2)
- [ ] Publish to npm (`@chuk/view-map`, `@chuk/view-datatable`)
- [x] Publish to PyPI (`chuk-view-schemas`) — v0.1.0 on PyPI

---

## Phase 2 — Composition ✓

**Goal:** Views can contain other Views. A Python server produces a
multi-panel dashboard from pure JSON.

**Status: Complete.** All 5 Views shipped with cross-View communication.

### Deliverables

- [x] `view-chart` — bar, line, scatter, pie, doughnut, area, radar, bubble
- [x] `view-form` — JSON Schema driven, widget hints, submit via callServerTool
- [x] `view-dashboard` — grid/split layouts, embeds child Views by URL
- [x] `view-split` — two-panel side-by-side layout
- [x] `view-tabs` — tabbed panel switching
- [x] Deploy all to Fly.io
- [x] Python heritage dashboard example (map + table)
- [x] Cross-View communication (click marker -> highlight row)
- [ ] Publish all to npm

---

## Phase 3 — Core Library ✓

**Goal:** Fill out the most broadly useful Views. Cover the output types
of every CHUK MCP server.

### MCP-Essential Views

These fill the most common MCP tool output patterns that currently
have no View. Ordered by how frequently MCP servers produce this shape.

- [x] `view-detail` — single record display. Name, image, key-value
  fields, action buttons. The most common MCP tool pattern — every
  "get single record" tool needs this. Quick build: shadcn Card + layout.
- [x] `view-counter` — big number display with sparkline and comparison
  delta. Every "count", "total", "estimate" tool. KPI cards —
  "42 sites at risk, ↑12% from last year." The simplest possible View
  but the most used dashboard widget on earth.
- [x] `view-code` — syntax-highlighted, copyable code/config. Every
  code-generating MCP tool (codegen, SQL, config) needs this.
  Powered by Shiki with 9 core language grammars and alias mapping.
- [x] `view-progress` — progress bars, single or multi-track with labels.
  Long-running MCP tools need to show progress. Pairs with
  `ontoolinputpartial` streaming.
- [x] `view-confirm` — pre-action confirmation with summary. "You're
  about to delete 3 records." Safety pattern — should ship with every
  destructive MCP tool.
- [x] `view-json` — collapsible JSON tree viewer. Debug/inspect any MCP
  tool output.
- [x] `view-status` — traffic-light status board with labels. Multi-service
  health checks, MCP server availability, pipeline stage status.
- [x] `view-gallery` — card grid with thumbnails. Products, people,
  search results, portfolio items. The second most common list display
  after tables.

### Developer Views

- [x] `view-markdown` — rich markdown with code blocks, tables, links
- [x] Design system — Tailwind CSS v4, shadcn/ui (15 components), Framer Motion animations
- [x] `packages/ui` — shared component library with theme bridge
- [x] Storybook — 253 stories (15 component + 51 View + 12 hook groups), theme toggle, static build
- [x] `view-timeline` — events on a timeline with groups and severity
- [x] `view-tree` — hierarchical explorer with lazy loading and search
- [x] `view-diff` — unified and split diff rendering
- [x] `view-log` — streaming log with level filtering and search
- [x] `view-kanban` — card board with drag-and-drop

### Status & Monitoring Views

- [x] `view-alert` — notification/alert cards with severity levels.
  Heritage at risk alerts, system warnings, threshold breaches.
- [x] `view-stepper` — multi-step progress indicator with current state.
  Tool execution progress, pipeline stages, guided workflows.

### Interactive Input Views

- [x] `view-filter` — standalone filter bar that broadcasts to sibling
  Views. Shared filters across a dashboard — date range, category, search.
- [x] `view-settings` — configuration panel for View preferences.
  User-adjustable parameters — units, projections, display modes.
- [x] `view-embed` — generic iframe wrapper for external URLs. Embed any
  existing web content — external dashboards, documentation pages.
- [x] `view-ranked` — ranked/prioritised list with scores. Search results
  with relevance scores, recommendations, sorted comparisons.

### Deliverables

- [ ] Publish all to npm + deploy to Fly.io
- [x] Updated schema packages on PyPI (`chuk-view-schemas` v0.1.3)
- [ ] Updated schema packages on npm

### Success Criteria

Every CHUK MCP server has at least one View it can use. The Python schema
package covers all published Views.

---

## Phase 4 — Media and Specialist ✓

**Goal:** Cover media types and domain-specialist visualisations.

### Media Views

- [x] `view-video` — HTML5 player with poster and start time
- [x] `view-pdf` — PDF.js viewer with page navigation and zoom
- [x] `view-image` — zoomable with pan, annotation overlays, multi-image thumbnails
- [x] `view-compare` — before/after image slider with horizontal/vertical orientation
- [x] `view-audio` — waveform, regions, playback
- [x] `view-carousel` — image/content carousel with captions and
  navigation. Site photo galleries, before/after sequences, multi-view
  comparisons.

### Data-Dense Visualisation

- [x] `view-heatmap` — grid heatmap (confusion matrices, retention)
- [x] `view-gauge` — single-value metric display
- [x] `view-treemap` — nested rectangles showing hierarchical proportion.
  Disk usage, budget breakdown, model parameter distribution, code
  coverage.
- [x] `view-sunburst` — radial hierarchical chart (treemap in polar
  coordinates). Taxonomy browsing, layer-by-layer model structure,
  heritage classification hierarchies.
- [x] `view-scatter` — dedicated scatter/bubble plot with zoom, selection,
  tooltips. Embedding spaces, feature correlations, site distribution by
  risk/period — interpretability outputs.
- [x] `view-boxplot` — distribution summaries with quartiles, outliers.
  Model performance comparison, statistical analysis results.
- [x] `view-pivot` — pivot table with row/column grouping, aggregation,
  drill-down. The spreadsheet power-user's View — summarise any tabular
  data dynamically.
- [x] `view-crosstab` — matrix of values with conditional formatting.
  Confusion matrices, correlation tables, period × monument-type counts.

### Geo-Specialist

- [x] `view-layers` — multi-layer map with legend, temporal filtering
- [x] `view-timeseries` — time-axis optimised chart with zoom/pan
- [x] `view-profile` — elevation/cross-section line chart
- [x] `view-minimap` — small overview map + detail map linked together.
  Large-area heritage surveys — overview of Essex coast with detail panel
  for specific sites.
- [x] `view-gis-legend` — standalone cartographic legend with symbology.
  Paired with view-layers for proper cartographic output.

### Specialist

- [x] `view-terminal` — terminal emulator display with ANSI colour
  support. Tool execution output, mcp-cli integration, live logs.
- [x] `view-spectrogram` — audio frequency visualisation over time.
  Audio analysis from Remotion/audacity MCP servers.

### Deliverables

- [ ] Publish all to npm + deploy to Fly.io

### Success Criteria

Full coverage for CHUK MCP ecosystem including media servers
(remotion, audacity, pptx) and geo-specialist use cases (DEM profiles,
STAC imagery comparison, multi-layer investigations).

---

## Phase 5 — Developer Experience & Infrastructure (in progress)

**Goal:** The tools and infrastructure that make chuk-mcp-ui sticky.
Views win on capability; DX wins on adoption. This phase is what turns
"useful library" into "the thing everyone reaches for."

### 5.1 `create-chuk-view` CLI Scaffolder ✓

**Sprint 2: shipped.** Implemented at `packages/create-chuk-view/`.

```bash
npx create-chuk-view my-custom-view
```

Generates full boilerplate: `COMPONENT.md` template, `vite.config.ts`,
`mcp-app.html`, `App.tsx` with `useView` wired up, Storybook story, Zod
schema, test stubs. A developer goes from zero to a working custom View
in under a minute. This is what shadcn's `npx shadcn-ui add` did for
adoption — remove the setup friction entirely.

### 5.2 `useView` Hook Family ✓

**Sprint 2: shipped (6 hooks). Sprint 3: expanded to 11 hooks.** Implemented at `packages/shared/src/hooks/` — 11 purpose-built hooks with 127 tests and interactive Storybook stories.

| Hook | Purpose | Sprint |
|------|---------|--------|
| `useViewStream` | Progressive rendering from `ontoolinputpartial` — show data as it arrives | 2 |
| `useViewSelection` | Shared selection state across composed Views (click map → highlight table row) | 2 |
| `useViewFilter` | Cross-View filtering (filter in datatable → map updates, chart updates) | 2 |
| `useViewUndo` | Undo/redo stack for interactive Views (form edits, drawing on map) | 2 |
| `useViewExport` | Standardised export (PNG screenshot, CSV data, JSON payload) from any View | 2 |
| `useViewResize` | Responsive breakpoint detection inside the iframe | 2 |
| `useViewToast` | In-View feedback notifications with severity levels and auto-dismiss | 3 |
| `useViewNavigation` | In-View navigation stack with push/replace/back/forward | 3 |
| `useViewAuth` | Credential gating for tool calls with validation flow | 3 |
| `useViewLiveData` | Server-pushed continuous updates with streaming and polling modes | 3 |
| `useViewDrag` | Cross-View drag and drop with bus-based coordination | 3 |

These hooks are the real lock-in. Once people build Views using the hook
ecosystem, they don't switch.

### 5.3 Cross-View Message Bus ✓

**Sprint 2: shipped.** Implemented at `packages/shared/src/bus/` — `useViewBus` hook, `ViewBusProvider`, and typed `ViewMessage` protocol. Container Views (dashboard, split, tabs) migrated to `ViewBusProvider`.

Formalise the existing cross-View communication (click marker → highlight
row) into a typed message protocol that any View can participate in:

```typescript
type ViewMessage =
  | { type: "select"; source: string; ids: string[] }
  | { type: "filter"; source: string; field: string; value: unknown }
  | { type: "highlight"; source: string; id: string }
  | { type: "navigate"; source: string; target: string; params: Record<string, unknown> }
  | { type: "export-request"; source: string; format: "png" | "csv" | "json" }
```

This becomes a spec within a spec — the View-to-View interaction
protocol. Document it, publish it, let third-party Views plug in.

### 5.4 Server-Side Helpers ✓

**Sprint 2: shipped.** Python FastMCP decorators at `chuk-view-schemas/chuk_view_schemas/fastmcp.py` (17 per-view decorators). TypeScript server helpers at `packages/shared/src/server/` (`getViewUrl`, `buildViewMeta`, `wrapViewResult`).

Wrap the `meta={"ui": {"resourceUri": ...}}` boilerplate in
framework-specific decorators:

**Python (FastMCP):**

```python
from chuk_view_schemas.fastmcp import map_tool

@map_tool(mcp, "show_sites")
async def show_sites() -> MapContent:
    return MapContent(
        center={"lat": 51.5, "lon": -0.1},
        layers=[...]
    )
```

**TypeScript:**

```typescript
import { getViewUrl, buildViewMeta, wrapViewResult } from "@chuk/shared/server";

const url = getViewUrl("map");
const meta = buildViewMeta(url);
const result = wrapViewResult(meta, mapData, "Map of heritage sites");
```

The decorators handle `_meta.ui` wiring, `structuredContent` envelope,
and text fallback. One decorator (Python) or three helper calls (TypeScript), done.

### 5.5 Theme Presets

Named theme presets beyond light/dark:

```python
MAP_VIEW = "https://mcp-views.chukai.io/map/v1?theme=discovery"
```

Presets: `default`, `dark`, `discovery` (Discovery Channel branding),
`ibm` (IBM Carbon feel), `academic` (clean scholarly), `terminal`
(green-on-black). Same data, different looks, zero code changes.

### 5.6 Live Playground MVP ✓

**Sprint 2: shipped.** Implemented at `apps/playground/`. Deployed at
`mcp-views.chukai.io/playground/`. Storybook deployed at
`mcp-views.chukai.io/storybook/`.

A stripped-down early version of the Phase 9 catalogue: dropdown of all 66 Views
+ JSON editor + live iframe preview. Uses URL hash for synchronous initial
data delivery to iframes, with postMessage for subsequent updates.
The JSON editor where a Python developer pastes their data and sees it
render instantly — that's the conversion moment.

### 5.7 `structuredContent` Inference Helper

A Python/TypeScript utility that looks at data and suggests which View
to use:

```python
from chuk_view_schemas import infer_view

data = [{"lat": 51.5, "lon": -0.1, "name": "London"}, ...]
suggestion = infer_view(data)
# -> ViewSuggestion(view="map", confidence=0.95, schema=MapContent(...))
```

GeoJSON → map. Tabular with numeric columns → datatable + chart.
Time-indexed → timeseries. This is the "zero decisions" path — the
precursor to Phase 8 SSR runtime but available as a simple function today.

### 5.8 Snapshot Testing CLI

```bash
npx chuk-view-test --view map --data sample.json --output screenshot.png
```

Renders any View with given data in headless Chromium, takes a screenshot.
Integrates with Playwright for visual regression. MCP server developers
can verify their `structuredContent` renders correctly without running a
full host. Also powers Phase 9 catalogue thumbnails.

### Deliverables

- [x] `create-chuk-view` CLI scaffolder (npm package)
- [x] `useViewStream` — progressive rendering hook
- [x] `useViewSelection` — shared selection state hook
- [x] `useViewFilter` — cross-View filtering hook
- [x] `useViewUndo` — undo/redo stack hook
- [x] `useViewExport` — standardised export hook
- [x] `useViewResize` — responsive breakpoint hook
- [x] Typed cross-View message bus protocol
- [x] Python FastMCP decorators (`@map_tool`, `@chart_tool`, etc.)
- [x] TypeScript server helpers (`getViewUrl`, `buildViewMeta`, `wrapViewResult`)
- [x] Theme presets (default, dark, ocean, forest, terminal, academic, discovery, ibm)
- [x] Live playground MVP at `apps/playground/`
- [ ] `infer_view()` inference helper (Python + TypeScript)
- [ ] `chuk-view-test` snapshot testing CLI
- [x] Publish Python schemas to PyPI (`chuk-view-schemas` v0.1.3)
- [ ] Publish all to npm

### Success Criteria

A developer can scaffold a custom View in under a minute, use typed hooks
for streaming and cross-View state, and test their `structuredContent`
output without running a host. The live playground converts browsers into
users.

---

## Phase 6 — Compound & Novel Views ✓

**Goal:** Views that no one else in the MCP ecosystem will build.
These demonstrate what composition actually means and create genuinely
novel experiences.

**Status: Complete.** All 15 compound views shipped and deployed to Fly.io.
Total catalogue now at 69 views.

### Novel Compound Views

- [x] `view-notebook` — Markdown cells + chart cells + map cells + table
  cells, inline and scrollable. Every MCP server becomes a rich
  interactive report generator. Genuinely novel — nobody in the MCP
  ecosystem has anything like it.
- [x] `view-investigation` — Spatial investigation workspace. Draw a
  region on the map, everything else auto-populates from multiple MCP
  server calls. The Discovery Channel demo, the YouTube viral clip,
  the thing that makes people understand what composition actually means.
- [x] `view-chat` — Lightweight embedded chat within a View. The MCP
  server handles AI responses via `callServerTool`. Turns any View into
  a conversational interface — "ask questions about this data" right in
  the dashboard.
- [x] `view-annotation` — Overlay annotations on any child View (map,
  image, PDF, video). Draw circles, arrows, text labels. Annotations sent
  back via `callServerTool`. Heritage: circle an area on aerial imagery
  and write "possible enclosure." Code review: highlight and comment.

### Flow & Process Visualisation

- [x] `view-sankey` — flow diagrams showing quantities moving between
  stages. User journeys, energy flows, budget allocation, expert routing
  in MoE models. Visually stunning, huge breadth of use cases, nobody
  has this in MCP.
- [x] `view-funnel` — progressive reduction through stages with
  conversion rates. Sales pipelines, data processing pipelines, tool
  execution chains.
- [x] `view-gantt` — task bars on a time axis with dependencies. Project
  timelines, excavation schedules, video production pipeline.
- [x] `view-swimlane` — horizontal lanes with activities per actor/system.
  Multi-agent workflows, MCP server orchestration, process mapping.
  Extremely timely given MCP's multi-server model.
- [x] `view-flowchart` — node-and-edge process diagrams with decision
  points. Decision trees, approval workflows, diagnostic paths.

### Content & Narrative

- [x] `view-geostory` — scrollytelling map. Scroll through narrative and
  map animates between locations. Heritage investigations as a narrative,
  maritime voyage stories, YouTube content companion. Scrollytelling maps
  are viral content.
- [x] `view-slides` — presentation mode, full-screen sequential content.
  Conference demos, Discovery Channel presentations, YouTube content.
- [x] `view-neural` — neural network layer visualisation. Activations,
  weights, attention patterns. Interpretability work rendered live —
  attention heads, expert routing, layer activations. Personal showcase,
  nobody else has the data or expertise.

### Advanced Views

- [x] `view-globe` — CesiumJS 3D globe
- [x] `view-3d` — Three.js scene renderer (orbit, bloom, streaming)
- [x] `view-graph` — force-directed network graph
- [x] `view-calendar` — date-grid with event density
- [x] `view-wizard` — multi-step conditional forms
- [x] `view-transcript` — timestamped speaker-labelled text
- [x] `view-shader` — GLSL playground
- [ ] Publish all to npm + deploy to Fly.io

### Success Criteria

The catalogue includes genuinely novel compound Views that demonstrate
capabilities no other MCP UI library offers. `view-notebook` is the
flagship — a rich interactive report from pure JSON.

---

## Phase 7 — AppRenderer Compatibility ✓

**Goal:** Ensure every View works seamlessly with the `@mcp-ui/client`
AppRenderer used by hosts like ChatGPT and Goose.

**Status: Complete.** 166 Playwright tests verify all 66 views across
ext-apps protocol, postMessage, theme bridging, callTool, resize, and
incremental updates. Compatibility matrix published at `docs/compat-matrix.md`.

### Deliverables

- [x] Test all Views against `@mcp-ui/client` AppRenderer
- [x] Document any quirks or required workarounds
- [x] Compatibility matrix (View × Host) published in docs
- [ ] Adapter layer if needed for host-specific differences

### Success Criteria

If a host supports MCP Apps at all, chuk Views just work. Zero
host-specific code in any View.

---

## Phase 7.5 — ext-apps Protocol Alignment & Python Server Support

**Goal:** Full alignment with the official `@modelcontextprotocol/ext-apps` SDK
protocol (`2026-01-26`). Views speak the postMessage protocol natively. Python
MCP servers (via chuk-mcp-server) get first-class MCP Apps support. The
`chuk-view-schemas` decorators leverage chuk-mcp-server's `@view_tool` for
permissions, CSP, visibility, and auto resource registration.

**Status: Complete.** Server infrastructure, view protocol completeness, and
bidirectional interactions all done. Full ext-apps SDK alignment achieved.

### Context

The ext-apps protocol is a JSON-RPC 2.0 dialect over `window.postMessage`
between the host (AppBridge) and the view iframe (App). It defines:

- **Extension ID**: `io.modelcontextprotocol/ui`
- **Resource MIME type**: `text/html;profile=mcp-app`
- **Initialization handshake**: `ui/initialize` → response → `ui/notifications/initialized`
- **Tool lifecycle**: `ontoolinputpartial` (streaming) → `ontoolinput` (complete args) → `ontoolresult` (result)
- **Bidirectional calls**: View calls `tools/call` (proxied through host to server)
- **Size reporting**: `ui/notifications/size-changed` via ResizeObserver
- **Host context**: theme, styles (85+ CSS variables), containerDimensions, safeAreaInsets, locale, displayMode
- **Display modes**: inline, fullscreen, pip
- **Model context**: `ui/update-model-context` (view pushes state to LLM)
- **Chat integration**: `ui/message` (view injects messages into conversation)
- **Teardown**: `ui/resource-teardown` (graceful shutdown)
- **Tool visibility**: `["model"]`, `["app"]`, `["model", "app"]`
- **CSP**: `_meta.ui.csp` on resources (connectDomains, resourceDomains, frameDomains)
- **Permissions**: `_meta.ui.permissions` (camera, microphone, geolocation, clipboardWrite)

### Current State vs Protocol

| Feature | Status | Where |
|---------|--------|-------|
| `_meta.ui.resourceUri` (ui://) | ✅ Done | chuk-mcp-server |
| `_meta.ui.viewUrl` | ✅ Done | chuk-mcp-server |
| Resource serves HTML (`text/html;profile=mcp-app`) | ✅ Done | chuk-mcp-server |
| `structuredContent` in tool results | ✅ Done | chuk-mcp-server |
| Extension ID `io.modelcontextprotocol/ui` in capabilities | ✅ Done | chuk-mcp-server |
| Client capability detection | ✅ Done | chuk-mcp-server |
| Tool visibility (`["model"]`, `["app"]`, `["model", "app"]`) | ✅ Done | chuk-mcp-server |
| CSP on resources (`_meta.ui.csp`) | ✅ Done | chuk-mcp-server |
| Permissions on resources (`_meta.ui.permissions`) | ✅ Done | chuk-mcp-server |
| Legacy meta key normalization | ✅ Done | chuk-mcp-server |
| Defensive `ui/*` method handling | ✅ Done | chuk-mcp-server |
| Ext-apps protocol constants (13 methods, 3 display modes) | ✅ Done | chuk-mcp-server |
| Views use ext-apps `App` class (postMessage) | ✅ Done | chuk-mcp-ui (useView) |
| `ontoolresult` callback | ✅ Done | chuk-mcp-ui (useView) |
| Auto-resize (ResizeObserver) | ✅ Done | chuk-mcp-ui (useView) |
| Host theming (CSS variables, `color-scheme`) | ✅ Done | chuk-mcp-ui (useView) |
| `callServerTool()` (bidirectional) | ✅ Done | chuk-mcp-ui (useView) |
| `exclude_none=True` on model_dump | ✅ Done | chuk-view-schemas |
| chuk-view-schemas uses `@view_tool` | ✅ Done | chuk-view-schemas |
| chuk-view-schemas permissions/csp/visibility | ✅ Done | chuk-view-schemas |
| VIEW_PATHS covers all 66 views | ✅ Done | chuk-view-schemas |
| `ontoolinputpartial` in useView | ✅ Done | chuk-mcp-ui (via `useViewStream`, `useViewLiveData`) |
| `sendMessage` / `updateModelContext` in useView | ✅ Done | chuk-mcp-ui (`use-view.ts`) |
| `requestDisplayMode` (fullscreen/pip) | ✅ Done | chuk-mcp-ui (`use-view.ts`) |
| `containerDimensions` / `safeAreaInsets` | ✅ Done | chuk-mcp-ui (`use-view.ts`) |
| Server-side pagination/drill-down in views | ✅ Done | chuk-mcp-ui (datatable `paginationTool`) |

### 7.5a — Server Infrastructure ✓ (chuk-mcp-server v0.24.0)

All server-side MCP Apps features are complete in `chuk-mcp-server`:

| Feature | Status | Description |
|---------|--------|-------------|
| Extension ID in capabilities | **Done** | `io.modelcontextprotocol/ui` in `capabilities.extensions` (with `experimental: {}` for backward compat) |
| Client capability detection | **Done** | `_client_supports_ui()` checks `client_capabilities.extensions["io.modelcontextprotocol/ui"]` |
| Legacy meta key normalization | **Done** | Sync `_meta.ui.resourceUri` ↔ `_meta["ui/resourceUri"]` on tool registration |
| `@view_tool` decorator | **Done** | Standalone (`@view_tool(...)`) and instance (`@mcp.view_tool(...)`) with auto `readOnlyHint=True` |
| CSP metadata | **Done** | `_meta.ui.csp` with `connectDomains`, `resourceDomains`, `frameDomains` |
| Tool visibility | **Done** | `["model"]`, `["app"]`, `["model", "app"]`; app-only tools hidden from `tools/list` |
| Permissions metadata | **Done** | `_meta.ui.permissions` (camera, microphone, geolocation, clipboard-write) |
| Auto view resource registration | **Done** | `ui://` URI → auto-fetch HTML from `viewUrl`, cache 1hr, `text/html;profile=mcp-app` |
| `prefersBorder` on resources | **Done** | Propagated from tool meta to auto-registered resource `_meta` |
| Ext-apps protocol constants | **Done** | 13 `MCP_APPS_METHOD_UI_*` method names, 3 `MCP_APPS_DISPLAY_*` constants |
| Defensive `ui/*` handling | **Done** | `ui/*` requests → `METHOD_NOT_FOUND`; `ui/*` notifications → silent ignore |
| Documentation + examples | **Done** | `docs/guides/mcp-apps.md`, `examples/mcp_apps_view_example.py` |

### 7.5b — chuk-view-schemas Alignment

The Python schema package (`chuk-view-schemas`) decorators need updating to
leverage chuk-mcp-server's `@view_tool`. Currently they bypass it and manually
construct `meta={"ui": {...}}`, missing key features.

#### `chuk_mcp.py` (ChukMCPServer target)

| Feature | Status | Description |
|---------|--------|-------------|
| Use `mcp.view_tool()` | **Done** | `_has_view_tool()` detects ChukMCPServer >= 0.24; uses `mcp.view_tool(resource_uri=..., view_url=...)` |
| `permissions` parameter | **Done** | Pass through to `mcp.view_tool(permissions={...})` |
| `csp` parameter | **Done** | Pass through to `mcp.view_tool(csp={...})` |
| `visibility` parameter | **Done** | Pass through to `mcp.view_tool(visibility=[...])` |
| `prefers_border` parameter | **Done** | Pass through to `mcp.view_tool(prefers_border=True)` |
| Auto resource registration | **Done** | Handled by chuk-mcp-server — remove manual wiring |

#### `fastmcp.py` (FastMCP target)

| Feature | Status | Description |
|---------|--------|-------------|
| Keep `mcp.tool(meta={...})` | **Done** | FastMCP doesn't have `view_tool` — keeps existing pattern |
| Add `permissions` to meta | **Done** | Serializes `permissions` into `meta["ui"]["permissions"]` |
| Add `csp` to meta | **Done** | Serializes `csp` into `meta["ui"]["csp"]` |
| Add `visibility` to meta | **Done** | Serializes `visibility` into `meta["ui"]["visibility"]` |

#### VIEW_PATHS Registry

| Feature | Status | Description |
|---------|--------|-------------|
| Complete 66-view registry | **Done** | All 66 views registered in `VIEW_PATHS` |
| 66 per-view decorators | **Done** | All convenience decorators in both `fastmcp.py` and `chuk_mcp.py` |
| `__init__.py` exports | **Done** | All 66 decorators exported from package |

#### Pydantic Schemas

| Feature | Status | Description |
|---------|--------|-------------|
| 66 Content schemas | ✅ Done | All 66 views have typed Pydantic v2 Content models with camelCase aliases |
| No text fallbacks | ✅ Done | Decorators return `{"structuredContent": ...}` only — no `"content"` text fallback (clients struggle with sizing) |

### 7.5c — View Protocol Completeness ✓

The `useView<T>` hook (`packages/shared/src/use-view.ts`) already uses the
official ext-apps SDK via `useApp`, `useHostStyles`, and `useDocumentTheme`
from `@modelcontextprotocol/ext-apps/react`.

#### Done

| Feature | Implementation |
|---------|---------------|
| `useApp` + ext-apps handshake | `use-view.ts:58` — via `@modelcontextprotocol/ext-apps/react` |
| `ontoolresult` → typed data | `use-view.ts:65` — validates `structuredContent.type` matches expected |
| `onhostcontextchanged` → theme | `use-view.ts:83` — applies theme via `applyTheme()` |
| `useHostStyles` (CSS variables) | `use-view.ts:159` — applies host style variables |
| `useDocumentTheme` (color-scheme) | `use-view.ts:160` — reactive theme string |
| `callServerTool` | `use-view.ts:164` — via `app.callServerTool()` with error handling |
| Auto-resize | Via `useApp` defaults — ResizeObserver enabled automatically |
| Dashboard `update-structured-content` | `use-view.ts:117` — incremental updates from patch engine |
| Dashboard `updateModelContext` | `use-dashboard-runtime.ts` — pushes `<ui_state>` + `<ui_events>` |
| Dashboard `sendMessage` | `use-dashboard-runtime.ts` — for high-priority events (draw, submit) |
| Dashboard `ontoolinputpartial` | `use-dashboard-runtime.ts` — progressive panel rendering |
| URL hash data injection | `use-view.ts:37` — synchronous initial data for playground |
| `mcp-app:view-ready` signal | `use-view.ts:141` — signal to parent that listener is ready |

#### `useView` Return Value — Extend Hook ✓

| Feature | Status | Description |
|---------|--------|-------------|
| `ontoolinputpartial` | **Done** | Available via `useViewStream` and `useViewLiveData` hooks (by design, not in core `useView`) |
| `ontoolcancelled` | **Done** | `use-view.ts:132` — sets `isCancelled` state |
| `onteardown` | **Done** | `use-view.ts` — registered via `registerTeardown()`, invoked on `ui/resource-teardown` |
| `sendMessage()` | **Done** | `use-view.ts:243` — wraps `app.sendMessage()`. Used by form, confirm, poll, chat views |
| `updateModelContext()` | **Done** | `use-view.ts:260` — wraps `app.updateModelContext()`. Used by map, chart, datatable, gallery views |
| `requestDisplayMode()` | **Done** | `use-view.ts:275` — wraps `app.requestDisplayMode()`. Used by map, globe, threed, slides, geostory |
| `openLink()` | **Done** | `use-view.ts:289` — wraps `app.openLink()`, fallback `window.open()`. Used by datatable, detail views |
| `sendLog()` | **Done** | `use-view.ts:301` — wraps `app.sendLog()` |
| `containerDimensions` | **Done** | `use-view.ts:97` — synced from host context via `onhostcontextchanged` |
| `safeAreaInsets` | **Done** | `use-view.ts` — synced from host context via `onhostcontextchanged` + initial read |

### 7.5d — Bidirectional Interaction

Interactive views should use `callServerTool` for server-side operations.

#### Done

| View | Interaction | Implementation |
|------|------------|---------------|
| form | Submit → `callServerTool` | Working (compat test: PASS) |
| confirm | Confirm → `callServerTool` | Working (compat test: PASS) |
| poll | Vote → `callServerTool` | Working (compat test: PASS) |
| dashboard | Patches via `ontoolresult` + `get_ui_state` via `oncalltool` | Working |

#### Completed

| View | Interaction | Status |
|------|------------|--------|
| map | Popup actions → `callServerTool`, viewport → `updateModelContext`, fullscreen toggle | **Done** |
| chart | `onClickTool` → `callServerTool`, click label → `updateModelContext` | **Done** |
| datatable | Pagination → `callServerTool`, row actions, selection + filter/sort/page → `updateModelContext`, link columns → `openLink` | **Done** |
| gallery | Item actions → `callServerTool`, selection → `updateModelContext` | **Done** |
| `updateModelContext` | Map: viewport bounds; Chart: clicked label; DataTable: selected rows + filter/sort/page; Gallery: selected item | **Done** |
| `sendMessage` | Form: submit summary; Confirm: confirmed/cancelled; Poll: vote; Chat: user messages → LLM conversation | **Done** |
| `requestDisplayMode` | Map, Globe, Threed, Slides, Geostory — fullscreen toggle buttons | **Done** |
| `openLink` | DataTable: link columns; Detail: link fields — host-controlled URL opening with `<a>` fallback | **Done** |

#### Remaining

| View | Interaction | Status |
|------|------------|--------|
| App-only tools | `visibility: ["app"]` — `refreshTool` in datatable/gallery, `exportTool` in datatable | **Done** |

### Deliverables

- [x] chuk-mcp-server: `@view_tool` decorator with permissions, CSP, visibility, prefersBorder
- [x] chuk-mcp-server: Extension ID in capabilities, client capability detection
- [x] chuk-mcp-server: Tool visibility filtering in `tools/list`
- [x] chuk-mcp-server: Auto view resource registration with permissions passthrough
- [x] chuk-mcp-server: Ext-apps constants, defensive `ui/*` handling
- [x] chuk-mcp-server: Documentation (`docs/guides/mcp-apps.md`) + examples
- [x] chuk-mcp-ui: All 66 views using ext-apps SDK via `useView<T>` hook
- [x] chuk-mcp-ui: Host theming with CSS variables via `useHostStyles`
- [x] chuk-mcp-ui: Auto-resize for all views via `useApp` defaults
- [x] chuk-mcp-ui: `callServerTool` in interactive views (form, confirm, poll)
- [x] chuk-mcp-ui: 166 Playwright tests (compat harness)
- [x] chuk-view-schemas: Update `chuk_mcp.py` to use `mcp.view_tool()` with `_has_view_tool()` detection
- [x] chuk-view-schemas: Add permissions/CSP/visibility params to both `fastmcp.py` and `chuk_mcp.py`
- [x] chuk-view-schemas: Complete VIEW_PATHS registry (17 → 66 views) + 66 per-view decorators
- [x] chuk-view-schemas: All 66 Pydantic Content schemas (no text fallbacks)
- [x] chuk-mcp-ui: `useView` exposes sendMessage, updateModelContext, requestDisplayMode, openLink, sendLog, displayMode, containerDimensions, isCancelled
- [x] chuk-mcp-ui: `callServerTool` in map, chart, datatable, gallery (popup actions, click tools, pagination, item actions)
- [x] chuk-mcp-ui: Fullscreen in map, globe, threed, slides, geostory
- [x] chuk-mcp-ui: `sendMessage` in form, confirm, poll, chat (discrete event notifications to LLM)
- [x] chuk-mcp-ui: `openLink` in datatable (link columns), detail (link fields)
- [x] chuk-mcp-ui: Enhanced `updateModelContext` in datatable (filter/sort/page state, debounced 500ms)
- [x] chuk-mcp-ui: `onteardown` via `registerTeardown()` — graceful shutdown on `ui/resource-teardown`
- [x] chuk-mcp-ui: `safeAreaInsets` synced from host context
- [x] chuk-mcp-ui: App-only tool patterns — `refreshTool` in datatable/gallery, `exportTool` in datatable
- [x] Tests: Bidirectional tool call tests (`bidirectional.spec.ts`) + streaming update tests (`streaming.spec.ts`)

### Success Criteria

A Python developer using `@chart_tool(mcp, "show_data", permissions={"camera": {}})` gets:
1. Tool with `_meta.ui` including permissions, CSP, viewUrl
2. Auto-registered resource with permissions metadata
3. View initializes via `ui/initialize` handshake
4. View receives data via `ontoolresult`
5. View reports size via `ui/notifications/size-changed`
6. View applies host theme (matches Claude.ai's look)
7. `callServerTool` works for drill-down and refresh
8. Fullscreen mode where appropriate

### Priority

1. **7.5b first** — chuk-view-schemas alignment. Unblocks Python developers wanting permissions/CSP.
2. **7.5c gaps** — extend `useView` hook with streaming, sendMessage, updateModelContext.
3. **7.5d** — bidirectional interaction in more views. Largest scope, highest impact.

---

## Phase 8 — View Runtime (SSR)

**Goal:** Server-side rendering engine that dynamically composes Views
from data descriptions. The "Next.js of MCP."

### SSR Memory Consolidation ✓

**Status: Complete.** Single universal SSR module at `packages/ssr/`.

**Problem solved:** 65 per-view SSR bundles (101 MB total, each bundling its
own React copy) caused OOM on 256MB Fly.io instances.

**Solution:** Single Vite SSR build importing all 57 SSR-safe renderers
directly, with placeholder rendering for 8 browser-dependent views (Leaflet:
map, minimap, layers; Chart.js: chart, profile, scatter, timeseries; pdf.js:
pdf). React externalized — installed as runtime dep in Docker.

| Metric | Before | After |
|--------|--------|-------|
| SSR bundle size | 101 MB (65 bundles) | 2.2 MB (1 bundle) |
| Docker image | 81 MB | 65 MB |
| Memory at startup | OOM risk | ~5 MB for SSR |
| Dockerfile COPY lines | 66 | 1 |
| Views with full SSR | 65 | 57 (+ 8 placeholders) |

### Deliverables

- [x] **Single universal SSR module** (replaces 65 per-view SSR bundles)
- [ ] SSR engine that takes a layout description and renders composed Views
- [ ] Data shape inference — GeoJSON -> map, tabular -> table, time-series -> chart
  (builds on Phase 5 `infer_view()` helper)
- [ ] Server-side cross-View state (no iframe-to-iframe postMessage)
- [ ] Hydration for client-side interactivity
- [ ] API: MCP server sends sections with data, runtime decides Views

### Success Criteria

A Python MCP server returns raw data sections without specifying View
types. The runtime infers the right visualisations, composes a dashboard,
and returns a single rendered page. Zero UI decisions in the MCP server.
SSR runs within 256MB memory on Fly.io without OOM.

---

## Phase 9 — View Catalogue & Viewer

**Goal:** A purpose-built Storybook for MCP Views. The landing page at
`mcp-views.chukai.io`, the development tool, the demo platform,
and the test harness — all in one. Evolves from the Phase 5 live
playground MVP.

### URL Structure

```
mcp-views.chukai.io/                 -> Catalogue / viewer
mcp-views.chukai.io/map/v1           -> The actual View (served to hosts)
mcp-views.chukai.io/datatable/v1     -> The actual View
mcp-views.chukai.io/chart/v1         -> The actual View
```

The root is the viewer. Each View's versioned path serves the raw
`mcp-app.html` to MCP hosts. Same domain, two purposes.

### Deliverables

- [ ] Catalogue app at `mcp-views.chukai.io/`
  - Lists all Views with live preview thumbnails
  - Each View rendered in an iframe exactly as a host would
  - Feeds sample `structuredContent` from COMPONENT.md test cases
- [ ] Theme toggling — light/dark, custom theme editor, presets from Phase 5
- [ ] Dataset switcher per View — heritage data, restaurant data,
  earthquake data, proving server-agnosticism
- [ ] Live JSON editor — edit the `structuredContent` being passed in,
  see the View update in real time
- [ ] Schema inspector — JSON Schema and TypeScript types side by side
- [ ] Integration snippets — "Copy for Python" / "Copy for TypeScript"
  buttons with ready-to-paste MCP server code
- [ ] Metadata panel — bundle size, CSP requirements, accessibility status
- [ ] Playwright visual regression — runs against the viewer, screenshots
  each View with each sample dataset, compares against baselines
  (powered by Phase 5 snapshot testing CLI)
- [ ] CI preview deploys — PRs for new Views deploy to the viewer

### What It Replaces

The viewer serves four roles from a single app:

| Role | How |
|------|-----|
| **Documentation site** | Schema docs, integration snippets, live examples |
| **Development tool** | Live JSON editor, theme toggle, instant feedback |
| **Demo platform** | Discovery Channel, YouTube, conference demos |
| **Test harness** | Playwright screenshots against the viewer |

### The Killer DX Feature

A Python developer visits `mcp-views.chukai.io`, picks `view-map`, sees it
rendered with sample heritage data, pastes in their own GeoJSON in the
live editor, sees it work, copies the Python snippet, done. They never
cloned a repo. They never ran `npm install`. They went from "I have data"
to "I have a working MCP App" in minutes.

### Success Criteria

The root of `mcp-views.chukai.io` is a polished catalogue showing every
published View. A developer can browse, try, and integrate any View
without installing anything locally.

---

## Phase 10 — Ecosystem

**Goal:** Community adoption, registry, and ecosystem tools.

### Deliverables

- [ ] Community contribution guidelines
- [ ] `create-chuk-view` templates for common patterns (list, detail, wizard)
- [ ] mcp-cli integration (auto-open browser for Views)
- [ ] ext-apps spec proposal for hosted View discovery protocol
- [ ] Third-party View submissions to the catalogue

### Success Criteria

External developers are building and publishing their own Views using the
scaffolder, hook ecosystem, and message bus. The catalogue includes
community-contributed Views.

---

## Key Milestones

| Milestone | Phase | Status |
|-----------|-------|--------|
| First View on Fly.io | 1 | ✓ Done — 66 Views at `mcp-views.chukai.io` |
| TS server using npm inline | 1 | ✓ Done — `examples/ts-inline` |
| Python server using hosted Views | 1 | ✓ Done — `examples/python-heritage` |
| Demo MCP server (streamable HTTP) | 1-2 | ✓ Done — `mcp-view-demo.fly.dev/mcp` |
| Composed dashboard | 2 | ✓ Done — dashboard, split, tabs Views |
| Cross-View interaction | 2 | ✓ Done — click marker -> highlight row |
| GitHub Actions CI | — | ✓ Done — build, test, type-check |
| Zod schemas + tests | — | ✓ Done — 66 schemas, 385+ tests |
| Design system (Tailwind + shadcn + Framer Motion) | 3 | ✓ Done — packages/ui, all 66 Views migrated, dark mode compliant |
| Storybook (253+ stories, theme toggle) | 3 | ✓ Done — component + View + hook stories, deployed at `/storybook` |
| First View on npm | 1 | Pending |
| PyPI publish | 1 | ✅ Done — `chuk-view-schemas` v0.1.3 (66 schemas) |
| Full MCP coverage (10 → 17 Views) | 3 | ✓ Done — Sprint 1 |
| Full MCP coverage (17 → 27 Views) | 3-4 | ✅ Done — Sprint 3 |
| Full catalogue (27 → 52 Views) | 3-4 | ✅ Done — Sprint 4 |
| Compound views (52 → 66 Views) | 6 | ✅ Done — Phase 6 |
| `create-chuk-view` CLI | 5 | ✅ Done — Sprint 2 |
| Live playground MVP | 5 | ✅ Done — deployed at `/playground` |
| Hook family (`useViewStream`, etc.) | 5 | ✅ Done — Sprint 2 |
| Cross-View message bus | 5 | ✅ Done — Sprint 2 |
| Server-side decorators (Python + TS) | 5 | ✅ Done — Sprint 2 |
| `view-notebook` | 6 | ✅ Done |
| `view-sankey` | 6 | ✅ Done |
| `view-geostory` | 6 | ✅ Done |
| AppRenderer compatibility | 7 | ✅ Done — 166 Playwright tests |
| 66 Pydantic Content schemas (no fallbacks) | 7.5 | ✅ Done |
| SSR per-view modules (65) | 8 | ✅ Replaced by universal module |
| SSR universal module (single bundle) | 8 | ✅ Done — 2.2 MB, 65 views, deployed |
| View catalogue | 9 | Not started |
| 66 Views in catalogue | 3-6 | ✅ Done — all 66 shipped |
| Discovery Channel demo | 4-6 | Pending |
| YouTube video | 1-2 | Pending |

---

## Content Milestones

| Video | Phase | Angle |
|-------|-------|-------|
| "MCP Apps got UI wrong" | 1 | The separation insight, dual distribution demo |
| "Zero frontend MCP server" | 1 | Python server, 20 lines, rich map |
| "Composable MCP dashboards" | 2 | Dashboard from pure JSON |
| "AI Heritage Investigation" | 4-6 | Discovery Channel preview |
| "The Next.js of MCP" | 8 | SSR runtime, data-driven rendering |

---

## Priority Order

Two tracks running in parallel: **MCP-essential Views** that cover every
common tool output pattern, and **infrastructure** that drives adoption.
The goal is "whatever your MCP tool returns, there's a View for it."

### Completed (66 Views)

1. ~~**view-datatable**~~ ✓ — returns a list
2. ~~**view-map**~~ ✓ — returns spatial data
3. ~~**view-chart**~~ ✓ — returns a chart of values
4. ~~**view-dashboard**~~ ✓ — returns multiple things at once
5. ~~**view-form**~~ ✓ — needs user input
6. ~~**view-markdown**~~ ✓ — returns formatted text
7. ~~**view-video**~~ ✓ — returns media playback
8. ~~**view-pdf**~~ ✓ — returns a document
9. ~~**view-split**~~ ✓ — two-panel composition
10. ~~**view-tabs**~~ ✓ — tabbed composition
11. ~~**view-detail**~~ ✓ — returns a single record
12. ~~**view-counter**~~ ✓ — returns a number with context
13. ~~**view-code**~~ ✓ — returns code or config
14. ~~**view-progress**~~ ✓ — long-running tool, shows progress
15. ~~**view-confirm**~~ ✓ — needs confirmation before action
16. ~~**view-json**~~ ✓ — returns structured data for inspection
17. ~~**view-status**~~ ✓ — returns health/status of multiple systems
18. ~~**view-gallery**~~ ✓ — returns card collections
19. ~~**view-tree**~~ ✓ — returns a tree of options/entities
20. ~~**view-timeline**~~ ✓ — returns events on a timeline
21. ~~**view-log**~~ ✓ — returns streaming output with level filtering
22. ~~**view-image**~~ ✓ — returns images with annotations
23. ~~**view-compare**~~ ✓ — returns before/after comparison
24. ~~**view-chat**~~ ✓ — embeds a conversation
25. ~~**view-ranked**~~ ✓ — returns ranked/scored list
26. ~~**view-quiz**~~ ✓ — interactive quiz with timer and validation
27. ~~**view-poll**~~ ✓ — live polling/voting with results
28. ~~**view-alert**~~ ✓ — notification cards with severity
29. ~~**view-stepper**~~ ✓ — multi-step progress indicator
30. ~~**view-settings**~~ ✓ — configuration panel
31. ~~**view-embed**~~ ✓ — generic iframe wrapper
32. ~~**view-gauge**~~ ✓ — single-value arc metric
33. ~~**view-crosstab**~~ ✓ — matrix with conditional formatting
34. ~~**view-gis-legend**~~ ✓ — cartographic legend
35. ~~**view-profile**~~ ✓ — elevation/cross-section line chart
36. ~~**view-carousel**~~ ✓ — image/content carousel
37. ~~**view-terminal**~~ ✓ — terminal with ANSI colours
38. ~~**view-diff**~~ ✓ — unified and split diff rendering
39. ~~**view-filter**~~ ✓ — standalone filter bar with bus
40. ~~**view-heatmap**~~ ✓ — grid heatmap
41. ~~**view-scatter**~~ ✓ — scatter/bubble plot
42. ~~**view-boxplot**~~ ✓ — box-and-whisker chart
43. ~~**view-audio**~~ ✓ — audio player with waveform
44. ~~**view-timeseries**~~ ✓ — time-axis chart
45. ~~**view-kanban**~~ ✓ — card board with drag-and-drop
46. ~~**view-treemap**~~ ✓ — nested rectangles
47. ~~**view-sunburst**~~ ✓ — radial hierarchical chart
48. ~~**view-layers**~~ ✓ — multi-layer map with controls
49. ~~**view-minimap**~~ ✓ — overview + detail map
50. ~~**view-pivot**~~ ✓ — pivot table with aggregation
51. ~~**view-spectrogram**~~ ✓ — audio frequency visualization
52. ~~**view-annotation**~~ ✓ — overlay annotations on child views
53. ~~**view-calendar**~~ ✓ — date-grid with event density
54. ~~**view-flowchart**~~ ✓ — node-and-edge process diagrams
55. ~~**view-funnel**~~ ✓ — progressive reduction through stages
56. ~~**view-gantt**~~ ✓ — task bars on a time axis with dependencies
57. ~~**view-geostory**~~ ✓ — scrollytelling map
58. ~~**view-globe**~~ ✓ — CesiumJS 3D globe
59. ~~**view-graph**~~ ✓ — force-directed network graph
60. ~~**view-investigation**~~ ✓ — spatial investigation workspace
61. ~~**view-neural**~~ ✓ — neural network layer visualisation
62. ~~**view-notebook**~~ ✓ — rich interactive report from JSON
63. ~~**view-sankey**~~ ✓ — flow diagrams
64. ~~**view-slides**~~ ✓ — presentation mode
65. ~~**view-swimlane**~~ ✓ — horizontal lanes with activities
66. ~~**view-threed**~~ ✓ — Three.js scene renderer

### Sprint 1 — MCP Coverage Essentials (10 → 17 Views) ✓

Sprint 1 is complete. 7 new Views shipped, taking the catalogue from 10
to 17 Views. Every common MCP tool output pattern is now covered.

11. **npm publish** — all 10 packages
12. ~~**view-detail**~~ ✓ — returns a single record (the most common missing pattern)
13. ~~**view-counter**~~ ✓ — returns a number with context
14. ~~**view-code**~~ ✓ — returns code or config
15. ~~**view-progress**~~ ✓ — long-running tool, shows progress
16. ~~**view-confirm**~~ ✓ — needs confirmation before action
17. ~~**view-json**~~ ✓ — returns structured data for inspection
18. ~~**view-status**~~ ✓ — returns health/status of multiple systems

### Sprint 2 — Infrastructure + DX

19. **Live playground MVP** — the conversion tool (stripped-down Phase 9)
20. **`create-chuk-view` CLI** — the adoption accelerator
21. **Server-side decorators** (Python + TS) — the "20 lines to a working MCP App" story
22. **Cross-View message bus** — the thing that makes composition a platform

### Sprint 3 — Complete Coverage (17 → 27 Views) ✓

23. ~~**view-gallery**~~ ✓ — returns card collections (second most common list display)
24. ~~**view-tree**~~ ✓ — returns a tree of options/entities
25. ~~**view-timeline**~~ ✓ — returns a sequence of events
26. ~~**view-log**~~ ✓ — returns streaming output
27. ~~**view-image**~~ ✓ — returns images with annotations
28. ~~**view-compare**~~ ✓ — returns before/after comparison
29. ~~**view-chat**~~ ✓ — embeds a conversation
30. ~~**view-ranked**~~ ✓ — returns ranked/scored list
31. ~~**view-quiz**~~ ✓ — interactive quiz with timer and server validation
32. ~~**view-poll**~~ ✓ — live polling/voting with results visualization

### Sprint 4 — Wow Factor & Differentiation ✓

31. ~~**view-notebook**~~ ✓ — the genuinely novel thing nobody else has
32. ~~**view-sankey**~~ ✓ — visually stunning, nobody has this in MCP
33. ~~**view-geostory**~~ ✓ — scrollytelling maps, viral content
34. ~~**view-swimlane**~~ ✓ — agent orchestration, timely with MCP multi-server
35. ~~**view-treemap**~~ ✓ — universal demand, every dashboard tool has one
36. ~~**view-neural**~~ ✓ — personal showcase, nobody else has the data

### Phase 6 Compound Views ✓

37. ~~**view-annotation**~~ ✓ — collaborative investigation tool
38. ~~**view-investigation**~~ ✓ — spatial investigation workspace
39. ~~**view-funnel**~~ ✓ — conversion rates through stages
40. ~~**view-gantt**~~ ✓ — task bars with dependencies
41. ~~**view-flowchart**~~ ✓ — node-and-edge process diagrams
42. ~~**view-slides**~~ ✓ — presentation mode
43. ~~**view-globe**~~ ✓ — CesiumJS 3D globe
44. ~~**view-threed**~~ ✓ — Three.js scene renderer
45. ~~**view-graph**~~ ✓ — force-directed network graph
46. ~~**view-calendar**~~ ✓ — date-grid with event density

---

## MCP Coverage Matrix

The pitch: "Whatever your MCP tool returns, there's a View for it."

| MCP tool pattern | View | Status |
|---|---|---|
| Returns a list of records | `view-datatable` | ✅ Shipped |
| Returns spatial data | `view-map` | ✅ Shipped |
| Returns a chart of values | `view-chart` | ✅ Shipped |
| Needs user input | `view-form` | ✅ Shipped |
| Returns formatted text | `view-markdown` | ✅ Shipped |
| Returns a document | `view-pdf` | ✅ Shipped |
| Returns media playback | `view-video` | ✅ Shipped |
| Returns multiple panels | `view-dashboard` / `split` / `tabs` | ✅ Shipped |
| Returns a single record | `view-detail` | ✅ Shipped |
| Returns a number with context | `view-counter` | ✅ Shipped |
| Returns code or config | `view-code` | ✅ Shipped |
| Is long-running | `view-progress` | ✅ Shipped |
| Needs confirmation before action | `view-confirm` | ✅ Shipped |
| Returns structured data for inspection | `view-json` | ✅ Shipped |
| Returns status/health of systems | `view-status` | ✅ Shipped |
| Returns card collections | `view-gallery` | ✅ Shipped |
| Returns a tree of options/entities | `view-tree` | ✅ Shipped |
| Returns events/timeline | `view-timeline` | ✅ Shipped |
| Returns streaming output | `view-log` | ✅ Shipped |
| Returns images with annotations | `view-image` | ✅ Shipped |
| Returns before/after comparison | `view-compare` | ✅ Shipped |
| Embeds a conversation | `view-chat` | ✅ Shipped |
| Returns ranked/scored list | `view-ranked` | ✅ Shipped |
| Interactive quiz | `view-quiz` | ✅ Shipped |
| Live polling/voting | `view-poll` | ✅ Shipped |
| Returns waveform/audio | `view-audio` | ✅ Shipped |
| Returns grid/matrix data | `view-heatmap` / `view-crosstab` | ✅ Shipped |
| Returns metric/KPI | `view-gauge` | ✅ Shipped |
| Returns hierarchical proportion | `view-treemap` / `view-sunburst` | ✅ Shipped |
| Returns scatter/correlation data | `view-scatter` | ✅ Shipped |
| Returns distribution stats | `view-boxplot` | ✅ Shipped |
| Returns pivot/aggregation | `view-pivot` | ✅ Shipped |
| Returns time-series data | `view-timeseries` | ✅ Shipped |
| Returns multi-layer spatial | `view-layers` / `view-minimap` | ✅ Shipped |
| Returns elevation profile | `view-profile` | ✅ Shipped |
| Returns cartographic legend | `view-gis-legend` | ✅ Shipped |
| Returns frequency data | `view-spectrogram` | ✅ Shipped |
| Returns terminal output | `view-terminal` | ✅ Shipped |
| Returns code diff | `view-diff` | ✅ Shipped |
| Returns task board | `view-kanban` | ✅ Shipped |
| Returns image carousel | `view-carousel` | ✅ Shipped |
| Returns notification/alerts | `view-alert` | ✅ Shipped |
| Returns step progress | `view-stepper` | ✅ Shipped |
| Returns filter controls | `view-filter` | ✅ Shipped |
| Returns configuration | `view-settings` | ✅ Shipped |
| Returns external content | `view-embed` | ✅ Shipped |
| Returns flow data | `view-sankey` | ✅ Shipped |
| Returns funnel/pipeline | `view-funnel` | ✅ Shipped |
| Returns project timeline | `view-gantt` | ✅ Shipped |
| Returns process lanes | `view-swimlane` | ✅ Shipped |
| Returns process diagram | `view-flowchart` | ✅ Shipped |
| Returns scrolly narrative | `view-geostory` | ✅ Shipped |
| Returns presentation | `view-slides` | ✅ Shipped |
| Returns neural network viz | `view-neural` | ✅ Shipped |
| Returns notebook/report | `view-notebook` | ✅ Shipped |
| Returns investigation workspace | `view-investigation` | ✅ Shipped |
| Returns annotation overlay | `view-annotation` | ✅ Shipped |
| Returns network graph | `view-graph` | ✅ Shipped |
| Returns calendar events | `view-calendar` | ✅ Shipped |
| Returns 3D globe | `view-globe` | ✅ Shipped |
| Returns 3D scene | `view-threed` | ✅ Shipped |

Sprint 1 shipped, taking the catalogue from **10 → 17 Views**. Sprint 3 reached
**27 Views** with 10 new Views and 5 new hooks (11 total). Sprint 4 completed
Phases 3 and 4, reaching **52 Views** with 25 new Views and 385 tests. Phase 6
added 15 compound views, bringing the total to **66 Views**.

---

## View Catalogue Summary

Total Views: **69 shipped**

| Category | Views | Phase | Status |
|----------|-------|-------|--------|
| **Core** (27) | datatable, map, chart, form, markdown, video, pdf, dashboard, split, tabs, detail, counter, code, progress, confirm, json, status, gallery, tree, timeline, log, image, compare, chat, ranked, quiz, poll | 1-3 | ✅ Shipped |
| **Developer** (2) | diff, kanban | 3 | ✅ Shipped |
| **Status & Monitoring** (2) | alert, stepper | 3 | ✅ Shipped |
| **Interactive Input** (3) | filter, settings, embed | 3 | ✅ Shipped |
| **Media** (2) | audio, carousel | 4 | ✅ Shipped |
| **Data-Dense** (8) | heatmap, gauge, treemap, sunburst, scatter, boxplot, pivot, crosstab | 4 | ✅ Shipped |
| **Geo-Specialist** (5) | layers, timeseries, profile, minimap, gis-legend | 4 | ✅ Shipped |
| **Specialist** (2) | terminal, spectrogram | 4 | ✅ Shipped |
| **Novel Compound** (4) | notebook, investigation, annotation, chat | 6 | ✅ Shipped |
| **Flow & Process** (5) | sankey, funnel, gantt, swimlane, flowchart | 6 | ✅ Shipped |
| **Content & Narrative** (3) | geostory, slides, neural | 6 | ✅ Shipped |
| **Advanced** (4) | globe, threed, graph, calendar | 6 | ✅ Shipped |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo tool | Turborepo + pnpm | Fast, proven, good for parallel builds |
| UI framework | React | ext-apps SDK has React bindings, largest ecosystem |
| Bundler | Vite + vite-plugin-singlefile | Matches Anthropic's ext-apps build pattern exactly |
| Build output | Single `dist/mcp-app.html` per View | npm publishes it, CDN serves it — same file |
| Map library | Leaflet | Lighter than CesiumJS, covers 90% of spatial needs |
| Chart library | Chart.js | Lightweight, covers all common chart types |
| CDN hosting | Fly.io | Docker-based, auto-stop/start, Node.js static server |
| npm scope | `@chuk/view-*` | Clean namespace, discoverable |
| CDN domain | `mcp-views.chukai.io` | Fly.io, versioned URL paths |
| Schema validation | Ajv + Zod (JS) / Pydantic (Py) | Triple schema: JSON Schema, Zod, Pydantic |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first CSS, accessible Radix primitives, theme bridge to --chuk-* vars |
| Animation | Framer Motion (opt-in) | Declarative enter/exit, all views use fadeIn; map is the only exception (interactive canvas) |
| Component development | Storybook 8 | 253+ stories, theme toggle, colocated with source |
