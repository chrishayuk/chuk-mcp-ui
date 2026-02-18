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

### Deliverables

- [x] `view-markdown` — rich markdown with code blocks, tables, links
- [x] Design system — Tailwind CSS v4, shadcn/ui (15 components), Framer Motion animations
- [x] `packages/ui` — shared component library with theme bridge
- [x] Storybook — 72 stories (15 component + 10 View), theme toggle, static build
- [ ] `view-timeline` — events on lanes with zoom/pan
- [ ] `view-tree` — hierarchical explorer with lazy loading
- [ ] `view-code` — syntax highlighting, optional editing
- [ ] `view-diff` — unified and split diff rendering
- [ ] `view-json` — collapsible JSON tree viewer
- [ ] `view-log` — streaming log with level filtering
- [ ] `view-kanban` — card board with drag-and-drop
- [ ] Publish all to npm + deploy to Fly.io
- [ ] Updated schema packages on npm and PyPI

### Success Criteria

Every CHUK MCP server has at least one View it can use. The Python schema
package covers all published Views.

---

## Phase 4 — Media and Specialist (in progress)

**Goal:** Cover media types and domain-specialist visualisations.

### Deliverables

- [x] `view-video` — HTML5 player with poster and start time
- [x] `view-pdf` — PDF.js viewer with page navigation and zoom
- [ ] `view-compare` — before/after image slider
- [ ] `view-audio` — waveform, regions, playback
- [ ] `view-image` — zoomable with annotation overlays
- [ ] `view-layers` — multi-layer map with legend, temporal filtering
- [ ] `view-timeseries` — time-axis optimised chart with zoom/pan
- [ ] `view-profile` — elevation/cross-section line chart
- [ ] `view-heatmap` — grid heatmap (confusion matrices, retention)
- [ ] `view-gauge` — single-value metric display
- [ ] Publish all to npm + deploy to Fly.io

### Success Criteria

Full coverage for CHUK MCP ecosystem including media servers
(remotion, audacity, pptx) and geo-specialist use cases (DEM profiles,
STAC imagery comparison, multi-layer investigations).

---

## Phase 5 — Advanced

**Goal:** Network graphs, 3D, and advanced specialist Views.

### Deliverables

- [ ] `view-globe` — CesiumJS 3D globe
- [ ] `view-3d` — Three.js scene renderer (orbit, bloom, streaming)
- [ ] `view-graph` — force-directed network graph
- [ ] `view-calendar` — date-grid with event density
- [ ] `view-wizard` — multi-step conditional forms
- [ ] `view-transcript` — timestamped speaker-labelled text
- [ ] `view-shader` — GLSL playground
- [ ] Publish all to npm + deploy to CDN

### Success Criteria

The catalogue is comprehensive. There is a View for every common output
type an MCP server could produce.

---

## Phase 6 — View Runtime (SSR)

**Goal:** Server-side rendering engine that dynamically composes Views
from data descriptions. The "Next.js of MCP."

### Deliverables

- [ ] SSR engine that takes a layout description and renders composed Views
- [ ] Data shape inference — GeoJSON -> map, tabular -> table, time-series -> chart
- [ ] Server-side cross-View state (no iframe-to-iframe postMessage)
- [ ] Hydration for client-side interactivity
- [ ] API: MCP server sends sections with data, runtime decides Views

### Success Criteria

A Python MCP server returns raw data sections without specifying View
types. The runtime infers the right visualisations, composes a dashboard,
and returns a single rendered page. Zero UI decisions in the MCP server.

---

## Phase 7 — View Catalogue & Viewer

**Goal:** A purpose-built Storybook for MCP Views. The landing page at
`chuk-mcp-ui-views.fly.dev`, the development tool, the demo platform,
and the test harness — all in one.

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
- [ ] Theme toggling — light/dark, custom theme editor
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

## Phase 8 — Ecosystem

**Goal:** Community adoption, registry, and ecosystem tools.

### Deliverables

- [ ] Community contribution guidelines
- [ ] View starter template (scaffold a new View in minutes)
- [ ] mcp-cli integration (auto-open browser for Views)
- [ ] ext-apps spec proposal for hosted View discovery protocol
- [ ] Third-party View submissions to the catalogue

---

## Key Milestones

| Milestone | Phase | Status |
|-----------|-------|--------|
| First View on Fly.io | 1 | ✓ Done — 10 Views at `chuk-mcp-ui-views.fly.dev` |
| TS server using npm inline | 1 | ✓ Done — `examples/ts-inline` |
| Python server using hosted Views | 1 | ✓ Done — `examples/python-heritage` |
| Demo MCP server (streamable HTTP) | 1-2 | ✓ Done — `mcp-view-demo.fly.dev/mcp` |
| Composed dashboard | 2 | ✓ Done — dashboard, split, tabs Views |
| Cross-View interaction | 2 | ✓ Done — click marker -> highlight row |
| GitHub Actions CI | — | ✓ Done — build, test, type-check |
| Zod schemas + tests | — | ✓ Done — 10 schemas, 183 total tests |
| Design system (Tailwind + shadcn + Framer Motion) | 3 | ✓ Done — packages/ui, all 10 Views migrated |
| Storybook (72 stories, theme toggle) | 3 | ✓ Done — component + View stories, static build |
| First View on npm | 1 | Pending |
| PyPI publish | 1 | Pending |
| Full CHUK coverage | 3-4 | In progress |
| Discovery Channel demo | 2-4 | Pending |
| SSR runtime | 6 | Not started |
| View catalogue | 7 | Not started |
| YouTube video | 1-2 | Pending |

---

## Content Milestones

| Video | Phase | Angle |
|-------|-------|-------|
| "MCP Apps got UI wrong" | 1 | The separation insight, dual distribution demo |
| "Zero frontend MCP server" | 1 | Python server, 20 lines, rich map |
| "Composable MCP dashboards" | 2 | Dashboard from pure JSON |
| "AI Heritage Investigation" | 2-4 | Discovery Channel preview |
| "The Next.js of MCP" | 6 | SSR runtime, data-driven rendering |

---

## Priority Order

1. ~~**view-datatable**~~ ✓
2. ~~**view-map**~~ ✓
3. ~~**view-chart**~~ ✓
4. ~~**view-dashboard**~~ ✓
5. ~~**view-form**~~ ✓
6. ~~**view-markdown**~~ ✓
7. ~~**view-video**~~ ✓
8. ~~**view-pdf**~~ ✓
9. ~~**view-split**~~ ✓
10. ~~**view-tabs**~~ ✓
11. **npm publish** — all 10 packages
12. **view-timeline** — heritage periods, voyage timelines
13. **view-layers** — Discovery Channel killer demo
14. **view-tree** — hierarchical explorer
15. Everything else by demand

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
| Component development | Storybook 8 | 72 stories, theme toggle, colocated with source |
