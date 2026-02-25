# Component Spec Format

## Overview

Every View in the `chuk-mcp-ui` monorepo has a `COMPONENT.md` file at its
root. This file is the single source of truth for building, consuming, and
testing the View. It is designed to be both human-readable and machine-parseable
so that an AI coding agent can build the View from the spec alone.

---

## Design Principles

Every View in the monorepo must adhere to these universal principles.

### 1. `useView` as Single Entry Point

Every View calls `useView<T>(type, version)` from `@chuk/view-shared` as its
sole connection to the MCP protocol. This hook returns all state and methods:

```typescript
interface ViewState<T> {
  app: App | null;
  data: T | null;
  content: Array<{ type: string; text?: string }> | null;
  theme: "light" | "dark";
  isConnected: boolean;
  error: string | null;
  callTool: (name: string, args: Record<string, unknown>) => Promise<void>;
  sendMessage: (params: { role: string; content: Array<{ type: string; text: string }> }) => Promise<void>;
  updateModelContext: (params: { content?: Array<{ type: string; text: string }>; structuredContent?: Record<string, unknown> }) => Promise<void>;
  requestDisplayMode: (mode: "inline" | "fullscreen" | "pip") => Promise<string>;
  openLink: (url: string) => Promise<void>;
  sendLog: (level: string, data: string) => Promise<void>;
  displayMode: "inline" | "fullscreen" | "pip" | null;
  containerDimensions: { width?: number; height?: number; maxWidth?: number; maxHeight?: number } | null;
  isCancelled: boolean;
}
```

No View should call `useApp` from `@modelcontextprotocol/ext-apps` directly.

### 2. View + Renderer Separation

Every View exports two components:

- **`{Name}View`** — Connected component that calls `useView`, handles
  loading/empty states via `Fallback`, and passes data down as props.
- **`{Name}Renderer`** — Pure rendering component that receives data and
  optional callback props. Used by Storybook stories and SSR entries. The
  Renderer never calls hooks that require the MCP protocol.

```
{Name}View (calls useView, handles states)
  └── {Name}Renderer (pure rendering, data as props)
```

### 3. Theme via CSS Custom Properties

Views use `--chuk-*` CSS custom properties from the shared theme system.
Never hardcode colors. Views must render correctly in both light and dark mode.

Key variables: `--chuk-font-family`, `--chuk-color-text`,
`--chuk-color-text-secondary`, `--chuk-color-background`,
`--chuk-color-surface`, `--chuk-color-border`, `--chuk-color-primary`,
`--chuk-border-radius`.

Theme is applied automatically by `useView` via `applyTheme()` and
`useHostStyles()`. Views can also accept a `?theme=` query parameter for
standalone preset application via `applyPreset()`.

### 4. Graceful Degradation

Use the `Fallback` component from `@chuk/view-shared` for all non-happy-path
states:

| Condition | Fallback behaviour |
|-----------|-------------------|
| Not connected | Shows "Connecting..." message |
| Connected, no data | Shows plain text from `content` |
| Wrong `type` field | Shows fallback (data is `null`) |
| Incompatible `version` | Shows warning, best-effort rendering |

### 5. Single-File HTML Output

Every View builds to `dist/mcp-app.html` via `vite-plugin-singlefile`. All
JavaScript, CSS, fonts, and images are inlined into a single HTML file. No
external runtime dependencies at load time.

### 6. Forward Compatibility

Views must ignore unknown fields in their schema. New optional fields can be
added without breaking older Views. The `version` field exists for future
breaking changes requiring migration.

### 7. SSR-Safe Rendering

Each View provides an `ssr-entry.tsx` that exports a `render(data): string`
function using `renderToString` from `react-dom/server`. SSR renders the
`{Name}Renderer` component (never the `{Name}View`) with noop callbacks for
any required function props.

```typescript
// apps/{name}/src/ssr-entry.tsx
import { renderToString } from "react-dom/server";
import { MyRenderer } from "./App";
import type { MyContent } from "./schema";

const noop = async () => {};

export function render(data: MyContent): string {
  return renderToString(<MyRenderer data={data} onCallTool={noop} />);
}
```

Views with browser-only dependencies (Leaflet, CesiumJS, Three.js) may provide
a `{Name}RendererStatic` component that renders structural HTML without
browser APIs.

### 8. Cross-View Communication

Views inside composition containers (dashboard, split, tabs) communicate via
the ViewBus event system from `@chuk/view-shared`:

- **`useViewEvents()`** — Returns `emitSelect`, `emitDeselect`,
  `emitFilterChange`, `emitHighlight`, etc.
- **Message types:** `select`, `filter`, `highlight`, `navigate`,
  `export-request`, `drag-start`, `drag-end`, `drop`
- Each message includes a `source` panel ID auto-populated by the bus.

Views should emit events on user interaction (e.g., row click, feature click)
and listen for events from sibling Views to highlight/filter matching items.

### 9. Accessibility

WCAG 2.1 AA baseline for all Views:

- All interactive elements are keyboard-navigable.
- Semantic HTML elements (`<table>`, `<button>`, `<nav>`, etc.).
- `aria-label` on controls that lack visible text labels.
- `aria-sort` on sortable table columns.
- Color is never the sole indicator of state — use icons, shapes, or text.
- Focus management: trap focus inside modals/popups, restore on close.

### 10. Security

- HTML content from data must be escaped. Never use
  `dangerouslySetInnerHTML` with unescaped user data.
- Declare required external domains in the CSP Requirements section.
- Views must not load scripts from external origins.
- Template resolution (`resolveTemplates`) escapes values to prevent injection.

### 11. Performance

- Target < 250KB gzip for Tier 1 views (heavy dependencies like Leaflet,
  Chart.js).
- Target < 150KB gzip for Tier 2+ views (React + app code only).
- Document actual sizes in each View's Size Budget section.
- Debounce expensive operations (e.g., `updateModelContext` on viewport
  change: 500ms).

---

## Template

```markdown
# @chuk/view-{name}

## Identity

- **Name:** @chuk/view-{name}
- **Type:** {view type string used in structuredContent}
- **Version:** {schema version}
- **Category:** {tier 1-4 from catalogue}
- **Description:** {one sentence}

## Dependencies

- **Runtime:** {libraries bundled into the single-file HTML}
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool, etc. |
| {additional hooks from @chuk/view-shared if used} | {purpose} |

Available hooks: `useViewEvents`, `useViewResize`, `useViewStream`,
`useViewSelection`, `useViewFilter`, `useViewExport`, `useViewUndo`,
`useViewAuth`, `useViewToast`, `useViewNavigation`, `useViewLiveData`,
`useViewDrag`.

## Schema

### Input (structuredContent)

{TypeScript interface definition — the full data contract}

### Defaults

{Default values for all optional fields}

## Rendering

### Layout

{Description of the visual layout, regions, responsive behaviour}

### States

{What the View looks like in each state: loading, empty, populated, error}

### Theme Integration

{Which CSS custom properties are used and where}

## Interactions

### User Actions

{Table of user interactions and what they trigger}

### Outbound Events (sendMessage)

{Events the View emits to the host}

### Server Calls (callServerTool)

{When and how the View calls back to the server}

### Action Templates

{Template strings the View resolves from data context}

## Model Context Updates

{When and what the View sends via `updateModelContext()` to push state to the
LLM. Describe the text content format. "None" if the View does not use
updateModelContext.}

## Display Mode

{Whether the View supports `requestDisplayMode()` for fullscreen/pip toggle.
Describe the UI element (button position, label, z-index). "Not applicable"
if the View stays inline-only.}

## Cancellation

{How the View responds to `isCancelled` from `ontoolcancelled`. "Default"
if no special handling beyond the shared Fallback behaviour.}

## Streaming

{How the View handles ontoolinputpartial for progressive rendering.
"Not implemented" if the View only renders on full ontoolresult.}

## Composition

### As Child

{How this View behaves when embedded inside a composition View}

### As Parent

{If this View embeds other Views, how it manages them}

### Cross-View Events

{ViewBus messages this View emits (e.g., emitSelect on click) and messages it
listens for (e.g., select for highlighting). "None" if the View does not
participate in cross-view coordination.}

## CSP Requirements

{External domains needed, if any. "None" if fully self-contained.}

## Accessibility

{WCAG 2.1 AA requirements specific to this View}

## Size Budget

{Target and actual bundle size for dist/mcp-app.html}

## SSR Entry

All views are rendered by the **universal SSR module** at `packages/ssr/`.

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `{RendererComponent}` via `renderToString`
- **Build:** `pnpm run build:ssr` (single bundle for all 65 views)
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** {`full` — component renders to HTML | `placeholder` — loading skeleton (browser-dependent views)}

## Test Cases

{Key scenarios to validate}

## Storybook Stories

{List of stories with their names and what they demonstrate}

Story file location: `apps/{name}/src/{Component}.stories.tsx`
```

---

## Example: @chuk/view-map

```markdown
# @chuk/view-map

## Identity

- **Name:** @chuk/view-map
- **Type:** map
- **Version:** 1.0
- **Category:** Tier 1 — Universal
- **Description:** Interactive map rendering GeoJSON features with markers,
  polygons, clustering, popups, and action templates.

## Dependencies

- **Runtime:** Leaflet 1.9+, leaflet.markercluster, React 18
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool, updateModelContext, requestDisplayMode |
| `useViewEvents` | Cross-view event emission (`emitSelect`) |

## Schema

### Input (structuredContent)

```typescript
interface MapContent {
  type: "map";
  version: "1.0";
  center?: { lat: number; lon: number };
  zoom?: number;
  bounds?: { south: number; west: number; north: number; east: number };
  basemap?: "osm" | "satellite" | "terrain" | "dark";
  layers: MapLayer[];
  controls?: {
    zoom?: boolean;
    layers?: boolean;
    scale?: boolean;
    fullscreen?: boolean;
  };
}

interface MapLayer {
  id: string;
  label: string;
  visible?: boolean;
  opacity?: number;
  features: GeoJSON.FeatureCollection;
  style?: LayerStyle;
  cluster?: { enabled: boolean; radius?: number };
  popup?: PopupTemplate;
}

interface LayerStyle {
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  icon?: string;
  radius?: number;
}

interface PopupTemplate {
  title: string;
  body?: string;
  fields?: string[];
  actions?: PopupAction[];
}

interface PopupAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
  confirm?: string;
}
```

### Defaults

| Field | Default |
|-------|---------|
| center | `{ lat: 51.505, lon: -0.09 }` (London) |
| zoom | `10` |
| basemap | `"osm"` |
| controls.zoom | `true` |
| controls.layers | `true` (if >1 layer) |
| controls.scale | `true` |
| controls.fullscreen | `false` |
| layer.visible | `true` |
| layer.opacity | `1.0` |
| cluster.enabled | `false` |
| cluster.radius | `50` |
| style.color | `"#3388ff"` |
| style.weight | `2` |
| style.fillOpacity | `0.3` |

## Rendering

### Layout

Full-bleed map filling the entire iframe viewport. Controls overlaid in
standard Leaflet positions (top-left for zoom, top-right for layers).
Popup panels appear anchored to features. Fullscreen toggle button positioned
absolute top-right with `z-[1000]`.

If `bounds` is provided, the map fits to those bounds, ignoring `center`
and `zoom`. If neither `bounds` nor `center` is provided, the map fits
to the bounding box of all features across all layers.

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | "Connecting..." fallback while waiting for MCP protocol handshake. |
| **Empty** | Map at default centre/zoom with fallback content rendered as plain text. |
| **Populated** | Features rendered per layer config. Map fits to data bounds if no explicit bounds. |
| **Error** | Fallback to plain text content from `result.content`. |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text in popups and map container |
| `--chuk-color-primary` | Active layer highlight, selected feature |
| `--chuk-color-background` | Popup background, fullscreen button background |
| `--chuk-color-text` | Popup text, labels |
| `--chuk-color-surface` | Layer control panel background |
| `--chuk-color-border` | Popup border, control borders, fullscreen button border |
| `--chuk-border-radius` | Popup corners, control panel corners |

Dark mode: tile layer switches to CartoDB dark basemap. Popup and control
backgrounds use `--chuk-color-surface`.

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Click feature | `click` on marker/polygon | Open popup with template-rendered content |
| Click popup action | Button in popup | `callServerTool` with resolved template args |
| Toggle layer | Layer control checkbox | Show/hide layer |
| Pan/zoom | Drag / scroll / buttons | Update viewport; push bounds to model context |
| Click cluster | `click` on cluster icon | Zoom to cluster bounds |
| Toggle fullscreen | Fullscreen button (top-right) | Switch between inline and fullscreen display modes |

### Outbound Events (sendMessage)

| Event | Payload | When |
|-------|---------|------|
| `viewport-changed` | `{ bounds: { north, south, east, west }, zoom }` | After pan or zoom settles (debounced 300ms) |
| `feature-click` | `{ layerId, featureId, properties }` | User clicks a feature |
| `layer-toggled` | `{ layerId, visible }` | User toggles layer visibility |

### Server Calls (callServerTool)

Triggered by popup actions only. The View resolves action template arguments
from the clicked feature's properties:

```typescript
// Popup action definition
{
  "label": "View Record",
  "tool": "get-monument",
  "arguments": { "nhle_id": "{properties.id}" }
}

// Feature properties
{ "id": "1234567", "name": "Roman Villa" }

// Resolved call
app.callServerTool({
  name: "get-monument",
  arguments: { nhle_id: "1234567" }
});
```

If `confirm` is set on the action, show a confirmation dialog before calling.

### Action Templates

Template syntax: `{path.to.value}`

Resolved from the feature's GeoJSON properties object using
`resolveTemplates` from `@chuk/view-shared`. Nested paths supported
with dot notation. Missing values resolve to empty string.

## Model Context Updates

On `moveend` (debounced 500ms), the map pushes the current viewport state to
the LLM via `updateModelContext`:

```
Map view: center {lat},{lon} zoom {zoom} bounds {south},{west} to {north},{east}
```

This fires once on mount (initial state) and after each pan/zoom settles.

## Display Mode

Fullscreen toggle button in top-right corner (`absolute top-2 right-2 z-[1000]`).
Uses semi-transparent background (`bg-background/80 backdrop-blur-sm`).
Toggles between `"inline"` and `"fullscreen"` via `requestDisplayMode()`.
Button label shows current state: "Fullscreen" or "Exit Fullscreen".
Only rendered when `onRequestDisplayMode` is available (host supports it).

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

## Streaming

### ontoolinputpartial

As the LLM generates tool arguments, the map can show a preview:

- If `bbox` argument is partially available, draw a dashed rectangle on the
  map showing the search area.
- If `lat`/`lon` arguments appear, drop a temporary marker.

### ontoolinput

Replace preview geometry with a "searching..." indicator at the specified
location.

### ontoolresult

Clear all preview geometry. Render the actual data.

## Composition

### As Child

When embedded in a `view-dashboard` or `view-split`:

- Responds to `highlight-feature` message: pans to and highlights the
  specified feature with a bounce animation.
- Responds to `fit-bounds` message: adjusts viewport.
- Responds to `filter-layer` message: shows/hides features matching criteria.
- Emits `feature-click` and `viewport-changed` for parent coordination.
- Listens for `row-click` postMessage from sibling panels (e.g., datatable)
  and pans to / opens popup for the matching feature.

### As Parent

Not applicable. `view-map` does not embed other Views.
Use `view-layers` for the extended multi-basemap version.
Use `view-dashboard` to compose map with other Views.

### Cross-View Events

| Direction | Event | Payload | When |
|-----------|-------|---------|------|
| **Emit** | `select` | `[featureId]` (field: `"feature_id"`) | Feature clicked |
| **Listen** | `row-click` (postMessage) | `{ nhle_id, properties }` | Sibling datatable row clicked — pans to matching feature |

## CSP Requirements

```json
{
  "img-src": [
    "https://*.tile.openstreetmap.org",
    "https://server.arcgisonline.com",
    "https://*.tile.opentopomap.org",
    "https://*.basemaps.cartocdn.com"
  ]
}
```

## Accessibility

- All interactive elements are keyboard navigable.
- Features have `aria-label` from popup title template.
- Layer toggles are labelled checkboxes.
- Popup close button has `aria-label="Close"`.
- Zoom controls have `aria-label="Zoom in"` / `"Zoom out"`.
- Fullscreen button has descriptive text label.
- Colour is never the sole indicator — icons/shapes differentiate features.
- Focus trapped inside popup when open.

## Size Budget

**Target:** < 200KB gzip (Leaflet ~140KB + markercluster ~30KB + app code ~30KB)

**Actual:** 754 KB raw / 208 KB gzip (includes Tailwind CSS + shadcn/ui)

## SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** Placeholder ("Loading map…") — Leaflet requires browser APIs
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `placeholder`

## Test Cases

### Schema Validation
- Accepts valid MapContent with one layer, one Point feature.
- Accepts valid MapContent with multiple layers, mixed geometry types.
- Rejects missing `type` field.
- Rejects missing `layers` field.
- Rejects invalid GeoJSON in `features`.
- Accepts unknown additional fields (forward compatibility).

### Rendering
- Single marker renders at correct position.
- Polygon renders with correct style (color, weight, fill).
- Cluster forms when markers are close and `cluster.enabled` is true.
- Map fits to feature bounds when no `center`/`zoom`/`bounds` specified.
- Map uses explicit `bounds` when provided.
- Basemap switches between osm/satellite/terrain/dark.
- Layer visibility toggles correctly.
- Empty features array shows "No data" state.
- Fullscreen button visible when host supports display mode.

### Interaction
- Feature click opens popup with resolved title and fields.
- Popup action button calls `callServerTool` with correct resolved args.
- Popup action with `confirm` shows dialog before calling.
- `viewport-changed` event fires after pan/zoom (debounced).
- `feature-click` event fires on feature click.
- Cluster click zooms to cluster bounds.
- Fullscreen toggle switches between inline and fullscreen.
- `updateModelContext` fires with bounds after pan/zoom.

### Theme
- Light mode: standard tile layer, light popup background.
- Dark mode: dark tile layer, dark popup background.
- All text uses `--chuk-font-family`.
- All borders use `--chuk-border-radius`.

### Composition
- Responds to `highlight-feature` message from parent.
- Responds to `fit-bounds` message from parent.
- Responds to `row-click` from sibling datatable.
- Emits events that parent can route to sibling Views.

### Streaming
- Preview rectangle appears during `ontoolinputpartial` with bbox.
- Preview clears on `ontoolresult`.

### Accessibility
- Tab navigation reaches all controls and features.
- Screen reader announces popup content.
- Layer toggles are keyboard operable.

### Fallback
- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Incompatible `version` renders warning with best-effort.

## Storybook Stories

Story file: `apps/map/src/MapView.stories.tsx`

| Story | Description |
|-------|-------------|
| SingleLayer | Three London landmarks on OSM basemap with popups |
| Clustered | Same data with marker clustering enabled |
```

---

## Usage

Every View directory contains a `COMPONENT.md` following this format:

```
apps/
├── map/
│   ├── COMPONENT.md      <-- this file
│   ├── src/
│   ├── dist/
│   ├── vite.config.ts
│   └── package.json
├── datatable/
│   ├── COMPONENT.md
│   └── ...
```

The `COMPONENT.md` is:

1. **The build spec** — an AI agent or developer can build the View from it.
2. **The API docs** — server developers know exactly what schema to produce.
3. **The test plan** — QA knows what to verify.
4. **The review checklist** — PRs are validated against it.

If the `COMPONENT.md` and the code disagree, the `COMPONENT.md` is correct
and the code needs to change.
