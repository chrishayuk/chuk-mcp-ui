# chuk-mcp-ui Roadmap

---

## Phase 1 — Prove the Pattern ✓

**Goal:** Ship two Views with dual distribution. Prove both paths work:
npm inline for Node/TS servers, CDN hosted for Python servers.

**Status: Complete.** All deliverables shipped. Hosted on Fly.io at
`chuk-mcp-ui-views.fly.dev` (npm publish pending).

### Deliverables

- [x] Monorepo setup (Turborepo + pnpm workspaces)
- [x] `packages/shared` — lifecycle, theme, action resolver, fallback
- [x] Vite build pipeline with `vite-plugin-singlefile`
  - Each View builds to a single `dist/mcp-app.html`
  - Same artifact publishes to npm and deploys to Fly.io
- [x] `view-datatable` — sortable, filterable, badges, CSV export
- [x] `view-map` — Leaflet, GeoJSON layers, clustering, popups, actions
- [x] Deploy to Fly.io
  - `chuk-mcp-ui-views.fly.dev/datatable/v1`
  - `chuk-mcp-ui-views.fly.dev/map/v1`
- [x] TypeScript example: MCP server using npm inline path
- [x] Python example: heritage exploration using hosted path
- [x] Python schema package: `chuk-view-schemas` (Pydantic v2)
- [ ] Publish to npm (`@chuk/view-map`, `@chuk/view-datatable`)
- [ ] Publish to PyPI (`chuk-view-schemas`)

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

## Phase 3 — Core Library (in progress)

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
  Quick build: highlight.js or Shiki.
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
- [ ] `view-gallery` — card grid with thumbnails. Products, people,
  search results, portfolio items. The second most common list display
  after tables.

### Developer Views

- [x] `view-markdown` — rich markdown with code blocks, tables, links
- [x] Design system — Tailwind CSS v4, shadcn/ui (15 components), Framer Motion animations
- [x] `packages/ui` — shared component library with theme bridge
- [x] Storybook — 101 stories (15 component + 17 View + 6 hook), theme toggle, static build
- [ ] `view-timeline` — events on lanes with zoom/pan
- [ ] `view-tree` — hierarchical explorer with lazy loading
- [ ] `view-diff` — unified and split diff rendering
- [ ] `view-log` — streaming log with level filtering
- [ ] `view-kanban` — card board with drag-and-drop

### Status & Monitoring Views

- [ ] `view-alert` — notification/alert cards with severity levels.
  Heritage at risk alerts, system warnings, threshold breaches.
- [ ] `view-stepper` — multi-step progress indicator with current state.
  Tool execution progress, pipeline stages, guided workflows.

### Interactive Input Views

- [ ] `view-filter` — standalone filter bar that broadcasts to sibling
  Views. Shared filters across a dashboard — date range, category, search.
- [ ] `view-settings` — configuration panel for View preferences.
  User-adjustable parameters — units, projections, display modes.
- [ ] `view-embed` — generic iframe wrapper for external URLs. Embed any
  existing web content — external dashboards, documentation pages.
- [ ] `view-ranked` — ranked/prioritised list with scores. Search results
  with relevance scores, recommendations, sorted comparisons.

### Deliverables

- [ ] Publish all to npm + deploy to Fly.io
- [ ] Updated schema packages on npm and PyPI

### Success Criteria

Every CHUK MCP server has at least one View it can use. The Python schema
package covers all published Views.

---

## Phase 4 — Media and Specialist (in progress)

**Goal:** Cover media types and domain-specialist visualisations.

### Media Views

- [x] `view-video` — HTML5 player with poster and start time
- [x] `view-pdf` — PDF.js viewer with page navigation and zoom
- [ ] `view-image` — zoomable with pan, annotation overlays, IIIF support
- [ ] `view-compare` — before/after image slider
- [ ] `view-audio` — waveform, regions, playback
- [ ] `view-carousel` — image/content carousel with captions and
  navigation. Site photo galleries, before/after sequences, multi-view
  comparisons.

### Data-Dense Visualisation

- [ ] `view-heatmap` — grid heatmap (confusion matrices, retention)
- [ ] `view-gauge` — single-value metric display
- [ ] `view-treemap` — nested rectangles showing hierarchical proportion.
  Disk usage, budget breakdown, model parameter distribution, code
  coverage.
- [ ] `view-sunburst` — radial hierarchical chart (treemap in polar
  coordinates). Taxonomy browsing, layer-by-layer model structure,
  heritage classification hierarchies.
- [ ] `view-scatter` — dedicated scatter/bubble plot with zoom, selection,
  tooltips. Embedding spaces, feature correlations, site distribution by
  risk/period — interpretability outputs.
- [ ] `view-boxplot` — distribution summaries with quartiles, outliers.
  Model performance comparison, statistical analysis results.
- [ ] `view-pivot` — pivot table with row/column grouping, aggregation,
  drill-down. The spreadsheet power-user's View — summarise any tabular
  data dynamically.
- [ ] `view-crosstab` — matrix of values with conditional formatting.
  Confusion matrices, correlation tables, period × monument-type counts.

### Geo-Specialist

- [ ] `view-layers` — multi-layer map with legend, temporal filtering
- [ ] `view-timeseries` — time-axis optimised chart with zoom/pan
- [ ] `view-profile` — elevation/cross-section line chart
- [ ] `view-minimap` — small overview map + detail map linked together.
  Large-area heritage surveys — overview of Essex coast with detail panel
  for specific sites.
- [ ] `view-gis-legend` — standalone cartographic legend with symbology.
  Paired with view-layers for proper cartographic output.

### Specialist

- [ ] `view-terminal` — terminal emulator display with ANSI colour
  support. Tool execution output, mcp-cli integration, live logs.
- [ ] `view-spectrogram` — audio frequency visualisation over time.
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

**Sprint 2: shipped.** Implemented at `packages/shared/src/hooks/` — 6 purpose-built hooks with 46 tests and 18 interactive Storybook stories.

| Hook | Purpose |
|------|---------|
| `useViewStream` | Progressive rendering from `ontoolinputpartial` — show data as it arrives |
| `useViewSelection` | Shared selection state across composed Views (click map → highlight table row) |
| `useViewFilter` | Cross-View filtering (filter in datatable → map updates, chart updates) |
| `useViewUndo` | Undo/redo stack for interactive Views (form edits, drawing on map) |
| `useViewExport` | Standardised export (PNG screenshot, CSV data, JSON payload) from any View |
| `useViewResize` | Responsive breakpoint detection inside the iframe |

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
MAP_VIEW = "https://chuk-mcp-ui-views.fly.dev/map/v1?theme=discovery"
```

Presets: `default`, `dark`, `discovery` (Discovery Channel branding),
`ibm` (IBM Carbon feel), `academic` (clean scholarly), `terminal`
(green-on-black). Same data, different looks, zero code changes.

### 5.6 Live Playground MVP ✓

**Sprint 2: shipped.** Implemented at `apps/playground/`.

A stripped-down early version of the Phase 9 catalogue: dropdown of Views
+ JSON editor + live iframe preview. Ship this before more Views.
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
- [ ] Theme presets (default, dark, discovery, ibm, academic, terminal)
- [x] Live playground MVP at `apps/playground/`
- [ ] `infer_view()` inference helper (Python + TypeScript)
- [ ] `chuk-view-test` snapshot testing CLI
- [ ] Publish all to npm + PyPI

### Success Criteria

A developer can scaffold a custom View in under a minute, use typed hooks
for streaming and cross-View state, and test their `structuredContent`
output without running a host. The live playground converts browsers into
users.

---

## Phase 6 — Compound & Novel Views

**Goal:** Views that no one else in the MCP ecosystem will build.
These demonstrate what composition actually means and create genuinely
novel experiences.

### Novel Compound Views

- [ ] `view-notebook` — Markdown cells + chart cells + map cells + table
  cells, inline and scrollable. Every MCP server becomes a rich
  interactive report generator. Genuinely novel — nobody in the MCP
  ecosystem has anything like it.
- [ ] `view-investigation` — Spatial investigation workspace. Draw a
  region on the map, everything else auto-populates from multiple MCP
  server calls. The Discovery Channel demo, the YouTube viral clip,
  the thing that makes people understand what composition actually means.
- [ ] `view-chat` — Lightweight embedded chat within a View. The MCP
  server handles AI responses via `callServerTool`. Turns any View into
  a conversational interface — "ask questions about this data" right in
  the dashboard.
- [ ] `view-annotation` — Overlay annotations on any child View (map,
  image, PDF, video). Draw circles, arrows, text labels. Annotations sent
  back via `callServerTool`. Heritage: circle an area on aerial imagery
  and write "possible enclosure." Code review: highlight and comment.

### Flow & Process Visualisation

- [ ] `view-sankey` — flow diagrams showing quantities moving between
  stages. User journeys, energy flows, budget allocation, expert routing
  in MoE models. Visually stunning, huge breadth of use cases, nobody
  has this in MCP.
- [ ] `view-funnel` — progressive reduction through stages with
  conversion rates. Sales pipelines, data processing pipelines, tool
  execution chains.
- [ ] `view-gantt` — task bars on a time axis with dependencies. Project
  timelines, excavation schedules, video production pipeline.
- [ ] `view-swimlane` — horizontal lanes with activities per actor/system.
  Multi-agent workflows, MCP server orchestration, process mapping.
  Extremely timely given MCP's multi-server model.
- [ ] `view-flowchart` — node-and-edge process diagrams with decision
  points. Decision trees, approval workflows, diagnostic paths.

### Content & Narrative

- [ ] `view-geostory` — scrollytelling map. Scroll through narrative and
  map animates between locations. Heritage investigations as a narrative,
  maritime voyage stories, YouTube content companion. Scrollytelling maps
  are viral content.
- [ ] `view-slides` — presentation mode, full-screen sequential content.
  Conference demos, Discovery Channel presentations, YouTube content.
- [ ] `view-neural` — neural network layer visualisation. Activations,
  weights, attention patterns. Interpretability work rendered live —
  attention heads, expert routing, layer activations. Personal showcase,
  nobody else has the data or expertise.

### Advanced Views

- [ ] `view-globe` — CesiumJS 3D globe
- [ ] `view-3d` — Three.js scene renderer (orbit, bloom, streaming)
- [ ] `view-graph` — force-directed network graph
- [ ] `view-calendar` — date-grid with event density
- [ ] `view-wizard` — multi-step conditional forms
- [ ] `view-transcript` — timestamped speaker-labelled text
- [ ] `view-shader` — GLSL playground
- [ ] Publish all to npm + deploy to Fly.io

### Success Criteria

The catalogue includes genuinely novel compound Views that demonstrate
capabilities no other MCP UI library offers. `view-notebook` is the
flagship — a rich interactive report from pure JSON.

---

## Phase 7 — AppRenderer Compatibility

**Goal:** Ensure every View works seamlessly with the `@mcp-ui/client`
AppRenderer used by hosts like ChatGPT and Goose.

### Deliverables

- [ ] Test all Views against `@mcp-ui/client` AppRenderer
- [ ] Document any quirks or required workarounds
- [ ] Adapter layer if needed for host-specific differences
- [ ] Compatibility matrix (View × Host) published in docs

### Success Criteria

If a host supports MCP Apps at all, chuk Views just work. Zero
host-specific code in any View.

---

## Phase 8 — View Runtime (SSR)

**Goal:** Server-side rendering engine that dynamically composes Views
from data descriptions. The "Next.js of MCP."

### Deliverables

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

---

## Phase 9 — View Catalogue & Viewer

**Goal:** A purpose-built Storybook for MCP Views. The landing page at
`chuk-mcp-ui-views.fly.dev`, the development tool, the demo platform,
and the test harness — all in one. Evolves from the Phase 5 live
playground MVP.

### URL Structure

```
chuk-mcp-ui-views.fly.dev/                 -> Catalogue / viewer
chuk-mcp-ui-views.fly.dev/map/v1           -> The actual View (served to hosts)
chuk-mcp-ui-views.fly.dev/datatable/v1     -> The actual View
chuk-mcp-ui-views.fly.dev/chart/v1         -> The actual View
```

The root is the viewer. Each View's versioned path serves the raw
`mcp-app.html` to MCP hosts. Same domain, two purposes.

### Deliverables

- [ ] Catalogue app at `chuk-mcp-ui-views.fly.dev/`
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

A Python developer visits `chuk-mcp-ui-views.fly.dev`, picks `view-map`, sees it
rendered with sample heritage data, pastes in their own GeoJSON in the
live editor, sees it work, copies the Python snippet, done. They never
cloned a repo. They never ran `npm install`. They went from "I have data"
to "I have a working MCP App" in minutes.

### Success Criteria

The root of `chuk-mcp-ui-views.fly.dev` is a polished catalogue showing every
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
| First View on Fly.io | 1 | ✓ Done — 17 Views at `chuk-mcp-ui-views.fly.dev` |
| TS server using npm inline | 1 | ✓ Done — `examples/ts-inline` |
| Python server using hosted Views | 1 | ✓ Done — `examples/python-heritage` |
| Demo MCP server (streamable HTTP) | 1-2 | ✓ Done — `mcp-view-demo.fly.dev/mcp` |
| Composed dashboard | 2 | ✓ Done — dashboard, split, tabs Views |
| Cross-View interaction | 2 | ✓ Done — click marker -> highlight row |
| GitHub Actions CI | — | ✓ Done — build, test, type-check |
| Zod schemas + tests | — | ✓ Done — 17 schemas, 343 total tests |
| Design system (Tailwind + shadcn + Framer Motion) | 3 | ✓ Done — packages/ui, all 17 Views migrated, dark mode compliant |
| Storybook (101 stories, theme toggle) | 3 | ✓ Done — component + View + hook stories, static build |
| First View on npm | 1 | Pending |
| PyPI publish | 1 | Pending |
| Full MCP coverage (10 → 17 Views) | 3 | ✓ Done — Sprint 1 |
| Full MCP coverage (17 → 26 Views) | 3-4 | Not started — Sprint 3 |
| `create-chuk-view` CLI | 5 | ✅ Done — Sprint 2 |
| Live playground MVP | 5 | ✅ Done — Sprint 2 |
| Hook family (`useViewStream`, etc.) | 5 | ✅ Done — Sprint 2 |
| Cross-View message bus | 5 | ✅ Done — Sprint 2 |
| Server-side decorators (Python + TS) | 5 | ✅ Done — Sprint 2 |
| `view-notebook` | 6 | Not started — Sprint 4 |
| `view-sankey` | 6 | Not started — Sprint 4 |
| `view-geostory` | 6 | Not started — Sprint 4 |
| AppRenderer compatibility | 7 | Not started |
| SSR runtime | 8 | Not started |
| View catalogue | 9 | Not started |
| 67 Views in catalogue | 3-6 | Not started |
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

### Completed (17 Views)

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

### Sprint 3 — Complete Coverage (17 → 26 Views)

23. **view-gallery** — returns card collections (second most common list display)
24. **view-tree** — returns a tree of options/entities
25. **view-timeline** — returns a sequence of events
26. **view-log** — returns streaming output
27. **view-image** — returns images with annotations
28. **view-compare** — returns before/after comparison
29. **view-chat** — embeds a conversation
30. **view-ranked** — returns ranked/scored list

### Sprint 4 — Wow Factor & Differentiation

31. **view-notebook** — the genuinely novel thing nobody else has
32. **view-sankey** — visually stunning, nobody has this in MCP
33. **view-geostory** — scrollytelling maps, viral content
34. **view-swimlane** — agent orchestration, timely with MCP multi-server
35. **view-treemap** — universal demand, every dashboard tool has one
36. **view-neural** — personal showcase, nobody else has the data

### Views — By Demand

37. **view-layers** — Discovery Channel killer demo
38. **view-investigation** — spatial investigation workspace
39. **view-annotation** — collaborative investigation tool
40. **view-scatter** — embedding spaces, feature correlations
41. **view-pivot** — spreadsheet power-user's View
42. **view-funnel** — conversion rates through stages
43. **view-gantt** — task bars with dependencies
44. **view-flowchart** — node-and-edge process diagrams
45. Everything else by demand

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
| Returns card collections | `view-gallery` | Sprint 3 |
| Returns a tree of options/entities | `view-tree` | Sprint 3 |
| Returns events/timeline | `view-timeline` | Sprint 3 |
| Returns streaming output | `view-log` | Sprint 3 |
| Returns images with annotations | `view-image` | Sprint 3 |
| Returns before/after comparison | `view-compare` | Sprint 3 |
| Embeds a conversation | `view-chat` | Sprint 3 |
| Returns ranked/scored list | `view-ranked` | Sprint 3 |
| Returns flow data | `view-sankey` | Sprint 4 |
| Returns hierarchical proportion | `view-treemap` | Sprint 4 |

Sprint 1 shipped, taking the catalogue from **10 → 17 Views** and covering
every common MCP tool output pattern. Sprint 3 reaches **26 Views** for
complete coverage.

---

## View Catalogue Summary

Total Views: **67** (17 shipped, 50 planned)

| Category | Views | Phase |
|----------|-------|-------|
| **Shipped** (17) | datatable, map, chart, form, markdown, video, pdf, dashboard, split, tabs, detail, counter, code, progress, confirm, json, status | 1-3 |
| **MCP-Essential** (1) | gallery | 3 |
| **Developer** (5) | timeline, tree, diff, log, kanban | 3 |
| **Status & Monitoring** (2) | alert, stepper | 3 |
| **Interactive Input** (4) | filter, settings, embed, ranked | 3 |
| **Media** (4) | image, compare, audio, carousel | 4 |
| **Data-Dense** (8) | heatmap, gauge, treemap, sunburst, scatter, boxplot, pivot, crosstab | 4 |
| **Geo-Specialist** (5) | layers, timeseries, profile, minimap, gis-legend | 4 |
| **Specialist** (2) | terminal, spectrogram | 4 |
| **Novel Compound** (4) | notebook, investigation, chat, annotation | 6 |
| **Flow & Process** (5) | sankey, funnel, gantt, swimlane, flowchart | 6 |
| **Content & Narrative** (3) | geostory, slides, neural | 6 |
| **Advanced** (7) | globe, 3d, graph, calendar, wizard, transcript, shader | 6 |

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
| CDN domain | `chuk-mcp-ui-views.fly.dev` | Fly.io, versioned URL paths |
| Schema validation | Ajv + Zod (JS) / Pydantic (Py) | Triple schema: JSON Schema, Zod, Pydantic |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first CSS, accessible Radix primitives, theme bridge to --chuk-* vars |
| Animation | Framer Motion (opt-in) | Declarative enter/exit, zero cost for Views that skip it |
| Component development | Storybook 8 | 101 stories, theme toggle, colocated with source |
