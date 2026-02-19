# chuk-mcp-ui Architecture

## Independently Developed, Composable UI Views for MCP Apps

---

## The Problem

MCP Apps couples UI to the MCP server. Every official example bundles the
View HTML inside the server — built with Vite + `vite-plugin-singlefile`,
read from disk with `readFileSync`, served via `resources/read` on a
`ui://` scheme. This means:

- Python MCP servers need Node.js/Vite to produce Views.
- Every server that returns spatial data builds its own map.
- Views cannot be composed — no map + table dashboards.
- No reuse across the ecosystem.

## The Insight

The ext-apps spec already supports separation. The View communicates with
the host via `postMessage`, never directly with the server. Views and
servers are architecturally independent. Nobody has packaged them that way.

---

## Core Idea

**A View is developed and deployed independently from any MCP server.**

One Vite build produces a single self-contained `mcp-app.html`. That file
ships two ways:

1. **npm package** (`@chuk/view-map`) — Node/TS servers do
   `readFileSync(require.resolve("@chuk/view-map"))` and serve it inline
   via `ui://`, exactly matching the Anthropic pattern.

2. **CDN hosted** (`chuk-mcp-ui-views.fly.dev/map/v1`) — Python/Rust/Go servers
   reference the URL directly in `resourceUri`. No bundling, no file
   reading, no Node.js.

Same HTML. Same App protocol. Same `structuredContent` schema. The
consumer chooses their distribution mode.

---

## Architecture

```
                     Same mcp-app.html, two paths
                     ────────────────────────────

                    ┌──────────────────────────────────┐
                    │       chuk-mcp-ui monorepo       │
                    │                                  │
                    │   Vite + vite-plugin-singlefile  │
                    │            ▼                      │
                    │      dist/mcp-app.html           │
                    └───────┬──────────────┬───────────┘
                            │              │
                    npm publish      Fly.io deploy
                            │              │
               ┌────────────▼──┐    ┌──────▼──────────────────┐
               │  npm registry │    │  chuk-mcp-ui-views      │
               │               │    │  .fly.dev               │
               │ @chuk/view-map│    │                         │
               │ @chuk/view-*  │    │  /map/v1                │
               └────────┬──────┘    │  /datatable/v1  ...     │
                        │           └──────┬──────────────────┘
                        │                  │
          ┌─────────────▼──┐    ┌──────────▼───────────┐
          │  Node/TS MCP   │    │  Python/Rust/Go MCP   │
          │  Server        │    │  Server               │
          │                │    │                       │
          │  readFileSync  │    │  resourceUri =        │
          │  from node_    │    │  "https://chuk-mcp-   │
          │  modules       │    │   ui-views.fly.dev    │
          │                │    │   /map/v1"            │
          │  ui://server/  │    │                       │
          │  map           │    │  Host fetches URL     │
          └────────┬───────┘    └──────────┬────────────┘
                   │                       │
                   │    MCP protocol        │
                   │                       │
          ┌────────▼───────────────────────▼────────────┐
          │                    Host                     │
          │         (Claude, ChatGPT, mcp-cli, etc.)    │
          │                                             │
          │  1. Calls tool on MCP Server                │
          │  2. Gets structuredContent + resourceUri    │
          │  3. Gets View HTML (inline or fetches URL)  │
          │  4. Renders View in sandboxed iframe        │
          │  5. Passes structuredContent to View        │
          └─────────────────────────────────────────────┘
```

The MCP server and the View have **no direct connection**. The host
mediates everything. Whether the View HTML came from an npm package
served inline or from a CDN URL is invisible to the View itself — it
receives the same `structuredContent` either way.

---

## Dual Distribution

### Path A: Inline (Anthropic Pattern)

Matches exactly how the official ext-apps examples work. The MCP server
reads the pre-built HTML from the npm package and serves it as a resource.

```typescript
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const viewHtml = readFileSync(require.resolve("@chuk/view-map"), "utf-8");

const resourceUri = "ui://heritage-explorer/map";

// Register the View as a resource (served inline via MCP protocol)
registerAppResource(server, resourceUri, resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => ({
    contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: viewHtml }],
  })
);

// Tool references the inline resource
registerAppTool(server, "search-sites", {
  _meta: { ui: { resourceUri } },
  // ...
});
```

The host never fetches from an external URL. It gets the HTML through
the MCP protocol via `resources/read`.

### Path B: Hosted (CDN)

The MCP server references the View by URL. No npm install, no file
reading, no Node.js required. This is what makes it work for Python.

```python
MAP_VIEW = "https://chuk-mcp-ui-views.fly.dev/map/v1"

@mcp.tool(meta={"ui": {"resourceUri": MAP_VIEW}})
async def search_sites(bbox: str) -> dict:
    sites = await query_heritage_database(bbox)
    return {
        "content": [{"type": "text", "text": f"Found {len(sites)} sites"}],
        "structuredContent": {
            "type": "map",
            "version": "1.0",
            "center": {"lat": 51.88, "lon": 0.87},
            "zoom": 13,
            "layers": [{
                "id": "sites",
                "label": "Heritage Sites",
                "features": to_geojson(sites)
            }]
        }
    }
```

The host fetches the HTML directly from the CDN.

### Same View, Both Paths

The View doesn't know or care how it was delivered. It receives
`structuredContent` via the App protocol either way:

```typescript
// Inside the View — identical regardless of distribution path
app.ontoolresult = (result) => {
  renderMap(result.structuredContent);
};
```

---

## Monorepo Structure

```
chuk-mcp-ui/
├── apps/
│   ├── map/                    # @chuk/view-map — Leaflet, GeoJSON, clustering
│   │   ├── src/
│   │   │   ├── App.tsx         # React component
│   │   │   ├── mcp-app.tsx     # Entry point (renders App in StrictMode)
│   │   │   ├── schema.ts      # TypeScript types for structuredContent
│   │   │   ├── schema.test.ts # JSON Schema validation tests (Ajv)
│   │   │   ├── zod.ts         # Zod schema
│   │   │   └── zod.test.ts    # Zod validation tests
│   │   ├── schemas/
│   │   │   └── input.json     # JSON Schema
│   │   ├── index.html          # HTML entry point (Vite)
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json        # exports: ".", "./schema", "./types", "./zod"
│   │
│   ├── chart/                  # @chuk/view-chart — Chart.js (8 types)
│   ├── datatable/              # @chuk/view-datatable — sortable, filterable
│   ├── form/                   # @chuk/view-form — JSON Schema driven
│   ├── markdown/               # @chuk/view-markdown — rich markdown
│   ├── video/                  # @chuk/view-video — HTML5 player
│   ├── pdf/                    # @chuk/view-pdf — PDF.js viewer
│   ├── dashboard/              # @chuk/view-dashboard — multi-panel composition
│   ├── split/                  # @chuk/view-split — two-panel layout
│   ├── tabs/                   # @chuk/view-tabs — tabbed panels
│   ├── detail/                 # @chuk/view-detail — detail panel display
│   ├── counter/                # @chuk/view-counter — numeric counter display
│   ├── code/                   # @chuk/view-code — syntax-highlighted code (Shiki)
│   ├── progress/               # @chuk/view-progress — progress indicator display
│   ├── confirm/                # @chuk/view-confirm — confirmation dialog
│   ├── json/                   # @chuk/view-json — collapsible JSON tree
│   ├── status/                 # @chuk/view-status — status indicator display
│   └── playground/              # Live Playground SPA — interactive View explorer
│
├── .storybook/                # Storybook config
│   ├── main.ts                # Story discovery, Vite + Tailwind plugin
│   ├── preview.ts             # Global decorators, theme toolbar
│   ├── theme-decorator.tsx    # applyTheme() light/dark switcher
│   └── mock-call-tool.ts      # fn() mock for Actions panel
│
├── packages/
│   ├── shared/                 # @chuk/view-shared
│   │   ├── src/
│   │   │   ├── use-view.ts     # useView hook (App protocol, theme, errors)
│   │   │   ├── theme.ts        # CSS custom property mapping
│   │   │   ├── actions.ts      # template resolver for callServerTool
│   │   │   ├── fallback.tsx    # graceful degradation component
│   │   │   ├── bus/            # Cross-View message bus
│   │   │   │   ├── useViewBus.ts   # useViewBus hook
│   │   │   │   ├── ViewBusProvider.tsx # React context provider
│   │   │   │   └── types.ts        # Typed bus message definitions
│   │   │   ├── hooks/          # Purpose-built View hooks (6 hooks, 46 tests)
│   │   │   │   ├── use-view-stream.ts     # Progressive rendering
│   │   │   │   ├── use-view-selection.ts  # Shared selection state
│   │   │   │   ├── use-view-filter.ts     # Cross-View filtering
│   │   │   │   ├── use-view-undo.ts       # Undo/redo stack
│   │   │   │   ├── use-view-export.ts     # PNG/CSV/JSON export
│   │   │   │   └── use-view-resize.ts     # Responsive breakpoints
│   │   │   └── server/         # Server-side helpers
│   │   │       ├── getViewUrl.ts    # Resolve View CDN/local URL
│   │   │       ├── buildViewMeta.ts # Build ui meta for tool registration
│   │   │       └── wrapViewResult.ts # Wrap structuredContent response
│   │   └── package.json
│   ├── ui/                      # @chuk/view-ui
│       ├── src/
│       │   ├── index.ts         # barrel export (15 components + cn)
│       │   ├── lib/utils.ts     # cn() — clsx + tailwind-merge
│       │   ├── styles/
│       │   │   ├── theme.css    # @theme bridge: --chuk-* → Tailwind tokens
│       │   │   └── globals.css  # base reset, imports theme.css
│       │   ├── components/      # 15 shadcn/ui components (Radix primitives)
│       │   │   ├── button.tsx, card.tsx, badge.tsx, input.tsx
│       │   │   ├── label.tsx, textarea.tsx, checkbox.tsx
│       │   │   ├── radio-group.tsx, slider.tsx, select.tsx
│       │   │   ├── table.tsx, tabs.tsx, scroll-area.tsx
│       │   │   ├── separator.tsx, tooltip.tsx
│       │   └── animations/      # Framer Motion shared variants
│       │       ├── variants.ts  # fadeIn, slideUp, listContainer, pressable
│       │       └── transitions.ts # springSnappy, easeOut, easeInOut
│       └── package.json
│
│   └── create-chuk-view/        # CLI scaffolder for new Views
│       ├── index.ts             # CLI entry point
│       ├── templates/           # View boilerplate templates
│       └── package.json├── chuk-view-schemas/          # Python Pydantic v2 models (PyPI)
│   ├── chuk_view_schemas/
│   │   ├── map.py
│   │   ├── chart.py
│   │   ├── datatable.py
│   │   └── ...                 # All 17 View schemas
│   └── pyproject.toml
│
├── examples/
│   ├── demo-server/            # Live MCP server (Fly.io, streamable HTTP)
│   │   ├── server.py           # FastMCP with 11 tools, all 17 Views
│   │   ├── Dockerfile
│   │   ├── fly.toml            # mcp-view-demo.fly.dev
│   │   └── requirements.txt
│   ├── python-heritage/        # Python heritage exploration example
│   └── ts-inline/              # TypeScript npm inline example
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Build, test (343), type-check
│
├── Dockerfile                  # Views static server (Fly.io)
├── fly.toml                    # chuk-mcp-ui-views.fly.dev
├── server.mjs                  # Node.js static file server for Views
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Per-View package.json

```json
{
  "name": "@chuk/view-map",
  "version": "1.0.0",
  "description": "Interactive map View for MCP Apps",
  "type": "module",
  "main": "dist/mcp-app.html",
  "exports": {
    ".": "./dist/mcp-app.html",
    "./schema": "./schemas/input.json",
    "./types": "./src/schema.ts",
    "./zod": "./src/zod.ts"
  },
  "files": [
    "dist/mcp-app.html",
    "schemas/input.json",
    "src/schema.ts",
    "src/zod.ts"
  ],
  "keywords": ["mcp", "mcp-apps", "ext-apps", "view", "map"]
}
```

The key export is `dist/mcp-app.html` — the pre-built single-file HTML.
Node servers `readFileSync` this. The CDN serves this same file.

### Vite Config (per View)

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: { input: "mcp-app.html" }
  }
});
```

Tailwind CSS v4 runs as a Vite plugin (`@tailwindcss/vite`) — no PostCSS
config, no `tailwind.config.js`. Everything inlined into one file via
`vite-plugin-singlefile`, matching the Anthropic build pattern.

---

## Design Principles

1. **One build, two distribution paths.** Vite produces `dist/mcp-app.html`.
   npm gets it for inline. CDN gets it for hosted. Same artifact.

2. **Views are language-agnostic to consume.** Node servers use npm.
   Python/Rust/Go servers use the CDN URL. Both get the same View.

3. **Views are data-driven.** Input is `structuredContent` (JSON). Output
   is user interactions via `callServerTool` and `sendMessage`.

4. **Views are server-agnostic.** A map View doesn't know if data comes
   from heritage databases, restaurant APIs, or physics simulations.

5. **Views are composable.** A View can embed other Views. A dashboard is
   a View that arranges child Views and routes data between them.

6. **Views are themeable.** They adapt to the host's theme context via
   CSS custom properties.

7. **Views degrade gracefully.** Missing `structuredContent` falls back
   to plain text content rendering.

8. **Compatible with ext-apps.** The inline path is identical to how
   Anthropic's official examples work. Not a fork — an extension.

---

## The structuredContent Contract

### Envelope

Every View expects a common envelope:

```json
{
  "type": "map",
  "version": "1.0",
  "...view-specific fields"
}
```

- `type` identifies which View renders the data.
- `version` is the schema version. Views handle unknown fields gracefully.

### Schema Publication

Each View publishes its schema four ways:

| Format | Package | Consumer |
|--------|---------|----------|
| JSON Schema | `@chuk/view-map/schema` (npm) | Any language, runtime validation |
| TypeScript types | `@chuk/view-map/types` (npm) | TS servers, compile-time |
| Zod schema | `@chuk/view-map/zod` (npm) | TS servers, runtime + compile-time |
| Pydantic models | `chuk-view-schemas` (PyPI) | Python servers, runtime + compile-time |

---

## Composition Model

### Dashboard View

A dashboard is itself a View. It embeds child Views by URL:

```python
DASHBOARD  = "https://chuk-mcp-ui-views.fly.dev/dashboard/v1"
MAP_VIEW   = "https://chuk-mcp-ui-views.fly.dev/map/v1"
TABLE_VIEW = "https://chuk-mcp-ui-views.fly.dev/datatable/v1"

@mcp.tool(meta={"ui": {"resourceUri": DASHBOARD}})
async def heritage_overview(bbox: str) -> dict:
    sites = await query_heritage_database(bbox)
    return {
        "structuredContent": {
            "type": "dashboard",
            "version": "1.0",
            "layout": "split-horizontal",
            "panels": [
                {
                    "id": "map", "label": "Map",
                    "viewUrl": MAP_VIEW, "width": "60%",
                    "structuredContent": {
                        "type": "map", "version": "1.0",
                        "layers": [build_geojson_layer(sites)]
                    }
                },
                {
                    "id": "table", "label": "Sites",
                    "viewUrl": TABLE_VIEW, "width": "40%",
                    "structuredContent": {
                        "type": "datatable", "version": "1.0",
                        "columns": [...],
                        "rows": [...]
                    }
                }
            ]
        }
    }
```

### Cross-View Communication

Parent View coordinates. Children don't know about each other:

```
User clicks marker on map
  -> map emits { type: "feature-click", id: "12345" }
  -> dashboard receives message from "map" panel
  -> dashboard sends { type: "highlight-row", id: "12345" } to "table" panel
  -> table highlights row
```

### Nesting

Composition is recursive. A dashboard can contain a dashboard:

```
investigation-view
  ├── dashboard-view
  │   ├── map-view
  │   ├── datatable-view
  │   └── chart-view
  └── timeline-view
```

---

## Interaction Protocol

### Data In (host -> View)

```typescript
app.ontoolresult = (result) => {
  render(result.structuredContent);
};
```

### Actions Out (View -> host -> server)

```typescript
await app.callServerTool({
  name: "get-monument-detail",
  arguments: { nhle_id: "1234567" }
});
```

### Action Templates

Views support template strings in action definitions:

```json
{
  "tool": "get-monument-detail",
  "arguments": { "nhle_id": "{properties.id}" }
}
```

Resolved from feature properties before calling the tool.

### State Messages (View -> host)

```typescript
app.sendMessage({ type: "viewport-changed", bounds: currentBounds });
```

---

## View Hook Family

Eleven purpose-built hooks in `packages/shared/src/hooks/` for common View
patterns. All exported from `@chuk/view-shared`.

| Hook | Purpose | Mechanism |
|------|---------|-----------|
| `useViewStream` | Progressive rendering as data arrives | `app.ontoolinputpartial` / `app.ontoolinput` |
| `useViewSelection` | Shared selection state across Views | `useViewBus` + local state |
| `useViewFilter` | Cross-View filtering | `useViewBus` + `Record<string, unknown>` |
| `useViewUndo` | Undo/redo stack | `useReducer` with past/present/future |
| `useViewExport` | PNG/CSV/JSON export | Dynamic `import("html2canvas")`, CSV escaping |
| `useViewResize` | Responsive breakpoints | `ResizeObserver` + debounce |
| `useViewToast` | Toast notifications with severity | Local state + auto-dismiss timer |
| `useViewNavigation` | Navigation history and breadcrumbs | `useReducer` with entry stack |
| `useViewAuth` | Authentication state and credentials | OAuth2, basic, bearer, API key flows |
| `useViewLiveData` | Real-time data subscriptions | WebSocket / SSE + reconnection |
| `useViewDrag` | Drag-and-drop handling | HTML5 Drag API + local state |

### Hook Composition

Hooks are designed to compose with `useView` without conflict:

- `useViewStream` uses `ontoolinputpartial`/`ontoolinput` (separate from
  `useView`'s `ontoolresult` handler)
- `useViewSelection`, `useViewFilter`, and `useViewExport` use `useViewBus`
  internally — they broadcast state changes and subscribe to incoming messages
- `useViewUndo`, `useViewResize`, `useViewToast`, `useViewNavigation`,
  `useViewAuth`, `useViewLiveData`, and `useViewDrag` are standalone (no bus dependency)

---

## Hosting and Distribution

### URL Convention

```
https://chuk-mcp-ui-views.fly.dev/{view-name}/v{major}
```

Major version in URL path. Non-breaking changes deploy to same URL.
Breaking changes get a new major version path.

### npm Convention

```
@chuk/view-{name}
```

Main export is `dist/mcp-app.html`. Schema, types, and Zod are secondary exports.

### Fly.io Hosting

Static hosting via Fly.io with a Node.js server (`server.mjs`). Docker
image copies all 17 `dist/mcp-app.html` files and serves them with CORS
headers and cache control. Auto-stop/start minimizes costs. The server
serves the same `dist/mcp-app.html` that npm publishes.

### Self-Hosting

Anyone can host any View or install it from npm. The choice is
configuration:

```python
# Hosted (CDN) — Python, Rust, Go, or anyone who prefers it
MAP_VIEW = "https://chuk-mcp-ui-views.fly.dev/map/v1"

# Self-hosted
MAP_VIEW = "https://my-corp.com/views/map/v1"

# Local dev
MAP_VIEW = "http://localhost:3000"
```

```typescript
// Inline (npm) — Node/TS servers matching Anthropic's pattern
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const viewHtml = readFileSync(require.resolve("@chuk/view-map"), "utf-8");
```

---

## Theming

Views receive host theme context during init. The theming pipeline has
four stages:

1. **Host sends theme context** to the View via the App protocol.
2. **`applyTheme()`** in `packages/shared/theme.ts` sets `--chuk-*` CSS
   custom properties on `document.documentElement`.
3. **`packages/ui/src/styles/theme.css`** bridges `--chuk-*` vars to
   Tailwind v4 `@theme` tokens (e.g., `--color-background`, `--color-primary`).
4. **Tailwind utility classes** like `bg-background`, `text-foreground`,
   `text-primary` resolve at runtime through the bridge.

```
Host → applyTheme() → --chuk-* vars → @theme bridge → Tailwind tokens → utility classes
```

```typescript
// packages/shared/theme.ts — called by useView on context change
export function applyTheme(mode: "light" | "dark" = "light"): void {
  const root = document.documentElement;
  const defaults = mode === "dark" ? DARK_DEFAULTS : LIGHT_DEFAULTS;

  for (const [prop, value] of Object.entries(defaults)) {
    root.style.setProperty(prop, value);
  }

  root.classList.toggle("dark", mode === "dark");
}
```

```css
/* packages/ui/src/styles/theme.css — @theme bridge */
@theme {
  --color-background: var(--chuk-color-background, #ffffff);
  --color-foreground: var(--chuk-color-text, #1a1a1a);
  --color-primary: var(--chuk-color-primary, #3388ff);
  --color-primary-foreground: #ffffff;
  --color-muted: var(--chuk-color-surface, #f5f5f5);
  --color-border: var(--chuk-color-border, #e0e0e0);
}
```

Dark mode works automatically. When the host sends a dark theme,
`applyTheme("dark")` updates the `--chuk-*` variable values. The
Tailwind `@theme` tokens cascade instantly — no class swapping, no
rebuild, no JavaScript re-render.

---

## Design System

All Views share a design system built on three technologies:

| Layer | Technology | Role |
|-------|-----------|------|
| Utility CSS | Tailwind CSS v4 | Styling via `@tailwindcss/vite` plugin, CSS-first config |
| Components | shadcn/ui + Radix UI | 15 accessible component primitives (source-owned) |
| Animation | Framer Motion | Declarative enter/exit animations (opt-in per View) |

### packages/ui

The `@chuk/view-ui` package lives at `packages/ui/` and provides:

- **15 shadcn/ui components**: Button, Card, Badge, Input, Label, Textarea, Checkbox, RadioGroup, Slider, Select, Table, Tabs, ScrollArea, Separator, Tooltip
- **Theme bridge** (`theme.css`): Maps runtime `--chuk-*` CSS variables to Tailwind v4 `@theme` tokens
- **Animation variants**: Shared Framer Motion variants (fadeIn, slideUp, listContainer, tabPanel, pressable)
- **Utility function**: `cn()` -- clsx + tailwind-merge for conditional class merging

### How Views Use It

Each View's entry point imports the global styles:

```typescript
import "@chuk/view-ui/styles";  // Tailwind + theme bridge
```

Views import components and utilities:

```typescript
import { Button, Input, Badge, Table, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
```

### Bundle Impact

The design system adds ~50-100 KB to each View (Tailwind CSS + Radix
primitives). Views that don't use Framer Motion pay zero animation cost.
Total bundle sizes range from 542 KB (video) to 9,933 KB (code, which
includes Shiki grammars). Most Views are 806-810 KB.

---

## Storybook

101 stories cover every component, View, and hook, organised in three tiers:

### Component Stories (48 stories)

Colocated in `packages/ui/src/components/*.stories.tsx`. Each shadcn/ui
component has stories exercising its variants, sizes, and states.

### View Stories (44 stories)

Colocated in `apps/*/src/*.stories.tsx`. Each View's inner component is
exported and rendered directly with mock data, bypassing the `useView` hook.
Views that use `callServerTool` pass a `mockCallTool` (Storybook `fn()`)
for the Actions panel.

### Hook Stories (18 stories)

Colocated in `packages/shared/src/hooks/*.stories.tsx`. Interactive demos
for all 6 `useView*` hooks — resize, undo, stream, selection, filter, export.
Each story wraps the hook in a small React component with buttons/inputs
to trigger hook methods and display current state.

### Theme Toggle

A toolbar decorator applies `applyTheme("light" | "dark")` from
`@chuk/view-shared`, so every story can be previewed in both themes.

### Configuration

```
.storybook/
  main.ts           # Stories from packages/ui + packages/shared + apps/*, Tailwind v4 plugin
  preview.ts        # Theme toolbar, centered layout, CSS import
  theme-decorator   # Applies --chuk-* vars via applyTheme()
  mock-call-tool    # fn() mock for callServerTool actions
```

Storybook uses `@storybook/react-vite` with Tailwind CSS v4 injected via
`viteFinal`. Workspace package aliases resolve `@chuk/view-ui` and
`@chuk/view-shared` for both dev and production builds.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm storybook` | Dev server on port 6006 |
| `pnpm build-storybook` | Static build to `storybook-static/` |

---

## Versioning

| What | Strategy |
|------|----------|
| View URL (CDN) | Major version in path: `/v1`, `/v2` |
| npm package | Semver: `@chuk/view-map@1.x.x` |
| Schema `version` field | `"1.0"` -> `"1.1"` additive, `"2.0"` breaking (new URL + major) |
| Schema packages (npm/PyPI) | Semver, independent of View deployment |
| Shared utilities | Internal, not published separately |

CDN URL major version and npm major version stay in sync. `@chuk/view-map@1.x`
is always the same View as `chuk-mcp-ui-views.fly.dev/map/v1`.

---

## View Catalogue

### Shipped Views (51)

**Core (17)**

| View | Description |
|------|-------------|
| `view-map` | Leaflet map, GeoJSON layers, clustering, popups, actions |
| `view-datatable` | Sortable, filterable table, badges, CSV export |
| `view-chart` | Bar, line, scatter, pie, doughnut, area, radar, bubble |
| `view-form` | JSON Schema driven forms, widget hints, callServerTool |
| `view-markdown` | Rich markdown with code blocks, tables, links |
| `view-video` | HTML5 player with poster and start time |
| `view-pdf` | PDF.js viewer with page navigation and zoom |
| `view-dashboard` | Multi-panel composition, cross-View communication |
| `view-split` | Two-panel side-by-side layout |
| `view-tabs` | Tabbed panel switching |
| `view-detail` | Key-value detail display with sections |
| `view-counter` | Interactive counter with increment/decrement |
| `view-code` | Syntax-highlighted code viewer (Shiki grammars) |
| `view-progress` | Progress bars and step indicators |
| `view-confirm` | Confirmation dialog with actions |
| `view-json` | Collapsible JSON tree viewer |
| `view-status` | Status indicators and health checks |

**Interactive (10)**

| View | Description |
|------|-------------|
| `view-compare` | Side-by-side comparison with slider |
| `view-gallery` | Image gallery with lightbox and grid layout |
| `view-ranked` | Ranked list with scores and movement indicators |
| `view-poll` | Interactive poll with live results |
| `view-quiz` | Multi-question quiz with scoring |
| `view-chat` | Chat message thread with avatars |
| `view-image` | Image viewer with annotations and zoom |
| `view-log` | Log viewer with severity filtering |
| `view-timeline` | Chronological event timeline |
| `view-tree` | Expandable tree with icons and search |

**Developer & Config (7)**

| View | Description |
|------|-------------|
| `view-alert` | Notification cards with severity levels |
| `view-diff` | Unified and split diff rendering |
| `view-embed` | Generic iframe wrapper with toolbar |
| `view-filter` | Standalone filter bar with bus integration |
| `view-kanban` | Card board with drag-and-drop |
| `view-settings` | Configuration panel with sections |
| `view-stepper` | Multi-step progress indicator |

**Data Visualization (10)**

| View | Description |
|------|-------------|
| `view-gauge` | Single-value arc metric with thresholds |
| `view-heatmap` | Grid heatmap with color scales |
| `view-crosstab` | Matrix with conditional formatting |
| `view-scatter` | Scatter/bubble plot (Chart.js) |
| `view-boxplot` | Box-and-whisker diagrams (SVG) |
| `view-timeseries` | Time-axis chart with annotations (Chart.js) |
| `view-treemap` | Nested rectangles with drill-down (Canvas) |
| `view-sunburst` | Radial hierarchical chart (SVG) |
| `view-pivot` | Pivot table with aggregation engine |
| `view-profile` | Elevation/cross-section line (Chart.js) |

**Specialist (7)**

| View | Description |
|------|-------------|
| `view-audio` | Audio player with canvas waveform |
| `view-carousel` | Image/content carousel with auto-play |
| `view-terminal` | Terminal with ANSI color support |
| `view-gis-legend` | Cartographic legend with symbology |
| `view-layers` | Multi-layer map with legend (Leaflet) |
| `view-minimap` | Overview-detail dual map (Leaflet) |
| `view-spectrogram` | Audio frequency visualization (Canvas) |

### Planned Views

| View | Tier | Renders |
|------|------|---------|
| `view-globe` | Specialist | 3D CesiumJS globe |
| `view-graph` | Specialist | Force-directed network graph |
| `view-calendar` | Specialist | Date-grid, event density |
| `view-transcript` | Specialist | Timestamped speaker text |
| `view-wizard` | Specialist | Multi-step conditional form |
| `view-shader` | Specialist | GLSL playground |

---

## CHUK MCP Server Mapping

| MCP Server | Views It Uses |
|------------|---------------|
| chuk-mcp-her | map, datatable, layers, chart, timeline |
| chuk-mcp-dem | map, chart, profile |
| chuk-mcp-stac | map, compare, datatable |
| chuk-mcp-tides | chart, timeseries, timeline |
| chuk-mcp-maritime-archives | map, datatable, timeline |
| chuk-mcp-celestial | chart, globe |
| chuk-mcp-ocean-drift | map, timeseries |
| chuk-mcp-open-meteo | chart, timeseries |
| chuk-mcp-physics | chart, 3d, gauge |
| chuk-mcp-solver | datatable, chart |
| chuk-mcp-remotion | video |
| chuk-mcp-audacity | audio |
| chuk-mcp-playbook | markdown, tree |
| chuk-mcp-pptx | pdf (preview) |

`view-map` serves 7 servers. `view-chart` serves 6. `view-datatable` serves 4.

---

## Future: View Runtime (SSR)

Later-phase vision. A server-side rendering engine that dynamically
composes Views into full applications:

```python
# Server doesn't choose Views. Just sends data with shapes.
return {
    "structuredContent": {
        "sections": [
            {"label": "Sites", "data": geojson},        # -> map
            {"label": "Risk",  "data": categories},      # -> bar chart
            {"label": "Tides", "data": timeseries},      # -> line chart
            {"label": "Elevation", "data": transect}     # -> profile
        ]
    }
}
```

The runtime infers View types from data shapes, composes a dashboard,
SSR renders, hydrates. The MCP server author writes zero UI code and
doesn't even choose the visualisations.

This is the "Next.js of MCP" — React gave components, Next.js gave SSR
composition. View packages are the components, the runtime is Next.js.

