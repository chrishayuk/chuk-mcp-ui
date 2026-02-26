# SSR Runtime (Phase 8) ✓

## Overview

A server-side composition engine implemented in TypeScript at `packages/ssr/`.
Takes raw data sections, infers view types using `inferView()` (Phase 5.7),
SSR-renders each panel, and assembles a complete HTML page with CSS grid/flex
layout. Optionally includes cross-view state propagation and client hydration
scripts for interactivity. The "Next.js of MCP."

**Status: Complete.** 50 tests passing (41 SSR + 9 ComposeBus).

---

## Architecture

```
packages/ssr/
  src/
    ssr-entry.tsx          # Universal SSR module — render() for all 69 views
    compose.ts             # Compose engine — sections → HTML page
    compose-client.tsx     # Client hydration entry point (browser)
    layout-css.ts          # ResolvedLayout → CSS strings
    state-propagation.ts   # Cross-view state through links
    __tests__/
      compose.test.ts      # 28 tests
      state-propagation.test.ts  # 13 tests
  vite.config.ts           # SSR build (Node.js, React externalized)
  vite.config.client.ts    # Client hydration build (browser bundle)
  vitest.config.ts         # Test config

packages/shared/src/bus/
  compose-bus.ts           # In-memory pub/sub for composed pages
  ComposeBusProvider.tsx   # React context for per-panel bus access
  use-view-bus.ts          # Dual-mode: ComposeBus or postMessage
```

---

## Server Endpoints

### `POST /compose/ssr`

Composes multiple views into a single SSR HTML page.

**Request:** `ComposeRequest`

```typescript
interface ComposeRequest {
  sections: ComposeSection[];     // Data sections to compose
  layout?: LayoutConfig;          // "auto" | "grid" | "flex" | custom
  title?: string;                 // Page title
  gap?: string;                   // CSS gap (default "12px")
  theme?: "light" | "dark";      // Theme (default "light")
  links?: CrossViewLink[];        // Cross-view link declarations
  initialState?: ComposeInitialState;  // Pre-rendered state
  hydrate?: boolean;              // Include client JS (default false)
}

interface ComposeSection {
  id: string;                     // Unique panel identifier
  view?: string;                  // Explicit view name (omit for auto-infer)
  data: unknown;                  // View data
  label?: string;                 // Panel label
  priority?: number;              // Layout ordering priority
}
```

**Response:** `ComposeResult`

```typescript
interface ComposeResult {
  html: string;                   // Complete HTML page
  sections: ComposeSectionResult[];  // Metadata per section
}

interface ComposeSectionResult {
  id: string;
  view: string;                   // Resolved view name
  inferred: boolean;              // Whether auto-inferred
  confidence?: number;            // 0-1 (when inferred)
  reason?: string;                // Inference explanation
}
```

**Example:**

```bash
curl -X POST http://localhost:8000/compose/ssr \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Heritage Dashboard",
    "sections": [
      { "id": "map", "data": { "type": "FeatureCollection", "features": [...] } },
      { "id": "stats", "data": 42 },
      { "id": "table", "view": "datatable", "data": { "columns": [...], "rows": [...] } }
    ],
    "hydrate": true
  }'
```

### `POST /compose/infer`

Run view inference on data objects without composing.

**Request:** `{ data: unknown[] }`

**Response:** `{ results: InferResult[] }` where each result has `index` and ranked `suggestions`.

### `GET /compose/client.js`

Serves the client hydration bundle (ES module) for composed pages.

---

## View Inference

When a section omits `view`, the engine calls `inferView()` from Phase 5.7:

- GeoJSON → `map` (0.95 confidence)
- `{ columns, rows }` → `datatable` (0.95)
- Bare number → `counter` (0.85)
- Markdown string → `markdown` (0.80)
- Fallback → `json` (0.0)

The compose engine uses the top suggestion. The `/compose/infer` endpoint
exposes all ranked suggestions for client-side decision making.

---

## Layout

Layout is resolved by `resolveLayout()` from `apps/dashboard/src/auto-layout.ts`:

| Layout | Behavior |
|--------|----------|
| `"auto"` | Automatic based on panel count and types |
| `"grid"` | CSS Grid with equal columns |
| `"flex"` | Flexbox (row or column) |
| Custom object | Explicit `gridTemplateColumns`, `gridTemplateRows`, `gridTemplateAreas` |

Layout output is converted to inline CSS by `layout-css.ts`:
- `layoutToContainerStyle(layout, gap)` → container CSS string
- `panelStyle(layout, panelId)` → per-panel CSS from `panelStyles` Map

---

## Cross-View State Propagation

**File:** `packages/ssr/src/state-propagation.ts`

Pre-renders composed pages with cross-view state already applied. No
JavaScript needed for initial state display.

### Initial State

```typescript
interface ComposeInitialState {
  selections?: Record<string, string[]>;       // panelId → selected IDs
  filters?: Record<string, Record<string, unknown>>;  // panelId → { field: value }
  highlights?: Record<string, string>;          // panelId → highlighted ID
}
```

### Link-Based Propagation

State flows through `CrossViewLink` declarations:

```typescript
interface CrossViewLink {
  source: string;           // Source panel ID
  target: string;           // Target panel ID
  type: "selection" | "filter" | "highlight" | "navigate" | "update";
  sourceField: string;
  targetField: string;
  bidirectional?: boolean;
}
```

The engine:
1. Seeds explicit state per panel from `initialState`
2. Walks links: propagates selections, filter values, and highlights
3. Handles bidirectional links (propagates both directions)
4. Augments each panel's data with `_compose` overlay before rendering

### Data Augmentation

Renderers receive augmented data with `_compose`:

```typescript
{
  ...originalData,
  _compose: {
    panelId: "table",
    selectedIds: ["row-5"],
    filters: { category: "heritage" },
    highlightedId: "site-42"
  }
}
```

---

## Client Hydration

When `hydrate: true`, the compose engine:

1. Injects `<script>window.__COMPOSE_STATE__={...}</script>` with section
   data, links, and initial state (with `<` escaped to `\u003c`)
2. Adds `<script type="module" src="/compose/client.js"></script>`

### Compose Client (`compose-client.tsx`)

The client hydration entry point:

1. Reads `window.__COMPOSE_STATE__`
2. Creates a `ComposeBus` with link filtering via `buildLinkFilter()`
3. Registers all panels on the bus
4. For each `<div data-panel="id">`:
   - **SSR-rendered panels** → `hydrateRoot()` (preserves DOM, attaches events)
   - **Placeholder panels** (`data-ssr-placeholder`) → `createRoot()` (replaces placeholder)
5. Wraps each panel in `<ComposeBusProvider bus={bus} panelId={id}>`

### Browser-Dependent Views

9 views use placeholder SSR (lightweight "Loading..." UI) and full client
rendering:

| View | Dependency | Lazy-loaded |
|------|-----------|-------------|
| chart | Chart.js (canvas) | Yes |
| map | Leaflet (window) | Yes |
| minimap | Leaflet (window) | Yes |
| layers | Leaflet (window) | Yes |
| profile | Chart.js (canvas) | Yes |
| scatter | Chart.js (canvas) | Yes |
| timeseries | Chart.js (canvas) | Yes |
| pdf | pdf.js (window) | Yes |
| shader | WebGL (canvas) | Placeholder only |

These are identified by the `data-ssr-placeholder` attribute on their
panel div. The client uses dynamic `import()` to lazy-load their full
renderers only when needed.

### SPA Backward Compatibility

All 69 `apps/*/src/mcp-app.tsx` files use conditional hydration:

```typescript
const rootEl = document.getElementById("root")!;
if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, <StrictMode><XxxView /></StrictMode>);
} else {
  ReactDOM.createRoot(rootEl).render(<StrictMode><XxxView /></StrictMode>);
}
```

SPA mode (empty root) uses `createRoot()`. SSR pages use `hydrateRoot()`.

---

## In-Memory ComposeBus

**File:** `packages/shared/src/bus/compose-bus.ts`

Replaces iframe `postMessage` relay for composed pages where all panels
share the same window.

```typescript
interface ComposeBus {
  send(panelId: string, message: Omit<ViewMessage, "source">): void;
  subscribe<T extends ViewMessageType>(
    panelId: string, type: T, handler: ViewBusHandler<T>
  ): ViewBusUnsubscribe;
  subscribeAll(
    panelId: string,
    handler: (message: ViewMessage, sourcePanelId?: string) => void
  ): ViewBusUnsubscribe;
  registerPanel(panelId: string): void;
  destroy(): void;
}

function createComposeBus(filter?: LinkFilter): ComposeBus
```

Key behaviors:
- Per-panel scoped subscriptions
- Messages dispatched via `queueMicrotask()` (avoids sync re-render cascades)
- Optional link filter for cross-view routing
- Self-delivery prevention (sender doesn't receive own messages)

### Dual-Mode `useViewBus`

The `useViewBus()` hook auto-detects compose mode:

- Inside `ComposeBusProvider` → uses in-memory ComposeBus
- Outside (iframe mode) → uses postMessage transport

All downstream hooks (`useViewSelection`, `useViewFilter`, `useViewNavigation`,
`useViewDrag`) automatically work in both modes.

---

## Build

### SSR Build (Node.js)

```bash
pnpm --filter @chuk/ssr build
```

- Output: `packages/ssr/dist/ssr-entry.js`
- React externalized (runtime dep in Docker)
- Size: ~2.2 MB

### Client Hydration Build (Browser)

```bash
pnpm --filter @chuk/ssr build:client
```

- Output: `packages/ssr/dist-client/compose-client.js`
- React bundled (browser needs it)
- ES module, minified, tree-shaken

### Tests

```bash
pnpm --filter @chuk/ssr test
```

50 tests: 28 compose + 13 state-propagation + 9 ComposeBus.

---

## Deployment

The Dockerfile copies both build outputs:

```dockerfile
COPY packages/ssr/dist         packages/ssr/dist
COPY packages/ssr/dist-client  packages/ssr/dist-client
```

The server serves the client bundle at `GET /compose/client.js`.

---

## Test Cases

| ID | Scenario | Status |
|----|----------|--------|
| SSR-01 | Single section renders full-width | PASS |
| SSR-02 | Multiple sections with grid layout | PASS |
| SSR-03 | Auto-infer GeoJSON → map | PASS |
| SSR-04 | Auto-infer bare number → counter | PASS |
| SSR-05 | Explicit view name used without inference | PASS |
| SSR-06 | Title included in HTML | PASS |
| SSR-07 | Dark theme class applied | PASS |
| SSR-08 | Panel labels rendered | PASS |
| SSR-09 | HTML escaped in title and labels (XSS prevention) | PASS |
| SSR-10 | Empty sections throws error | PASS |
| SSR-11 | Custom gap applied | PASS |
| SSR-12 | Cross-view state with links + initialState | PASS |
| SSR-13 | `data-view` attribute on panels | PASS |
| SSR-14 | `data-ssr-placeholder` on browser-dependent views | PASS |
| SSR-15 | Hydration scripts included when `hydrate=true` | PASS |
| SSR-16 | No hydration scripts by default | PASS |
| SSR-17 | Links included in hydration state | PASS |
| SSR-18 | `</script>` escaped in hydration JSON | PASS |
| SSR-19 | Selection propagation through links | PASS |
| SSR-20 | Filter propagation through links | PASS |
| SSR-21 | Highlight propagation through links | PASS |
| SSR-22 | Bidirectional link propagation | PASS |
| SSR-23 | ComposeBus message delivery between panels | PASS |
| SSR-24 | ComposeBus link filter blocking | PASS |
| SSR-25 | ComposeBus destroy clears handlers | PASS |

---

## Success Criteria

A Python MCP server returns raw data sections without specifying view
types. The runtime infers the right visualizations, composes a dashboard,
and returns a single rendered page. Zero UI decisions in the MCP server.
SSR runs within 256MB memory on Fly.io without OOM. Composed pages
hydrate into fully interactive apps with cross-view communication via
the in-memory ComposeBus.
