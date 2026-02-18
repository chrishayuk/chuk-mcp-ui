# Component Spec Format

## Overview

Every View in the `chuk-mcp-ui` monorepo has a `COMPONENT.md` file at its
root. This file is the single source of truth for building, consuming, and
testing the View. It is designed to be both human-readable and machine-parseable
so that an AI coding agent can build the View from the spec alone.

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

## Streaming

{How the View handles ontoolinputpartial for progressive rendering}

## Composition

### As Child

{How this View behaves when embedded inside a composition View}

### As Parent

{If this View embeds other Views, how it manages them}

## CSP Requirements

{External domains needed, if any}

## Accessibility

{WCAG 2.1 AA requirements specific to this View}

## Size Budget

{Target bundle size for dist/mcp-app.html}

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

- **Runtime:** Leaflet 1.9+, leaflet.markercluster
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

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
Popup panels appear anchored to features.

If `bounds` is provided, the map fits to those bounds, ignoring `center`
and `zoom`. If neither `bounds` nor `center` is provided, the map fits
to the bounding box of all features across all layers.

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | Map container with tile layer visible. Spinner overlay centred. |
| **Empty** | Map at default centre/zoom with "No data to display" message centred. |
| **Populated** | Features rendered per layer config. Map fits to data bounds if no explicit bounds. |
| **Error** | Fallback to plain text content from `result.content`. Error banner at top. |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--color-primary` | Active layer highlight, selected feature |
| `--color-background` | Popup background |
| `--color-text` | Popup text, labels |
| `--color-surface` | Layer control panel background |
| `--color-border` | Popup border, control borders |
| `--font-family` | All text in popups and controls |
| `--border-radius` | Popup corners, control panel corners |

Dark mode: tile layer switches to CartoDB dark basemap. Popup and control
backgrounds use `--color-surface`.

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Click feature | `click` on marker/polygon | Open popup with template-rendered content |
| Click popup action | Button in popup | `callServerTool` with resolved template args |
| Toggle layer | Layer control checkbox | Show/hide layer |
| Pan/zoom | Drag / scroll / buttons | Update viewport |
| Click cluster | `click` on cluster icon | Zoom to cluster bounds |

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

Resolved from the feature's GeoJSON properties object. Nested paths supported
with dot notation. Missing values resolve to empty string.

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

### As Parent

Not applicable. `view-map` does not embed other Views.
Use `view-layers` for the extended multi-basemap version.
Use `view-dashboard` to compose map with other Views.

## CSP Requirements

```json
{
  "img-src": [
    "https://*.tile.openstreetmap.org",
    "https://cartodb-basemaps-*.global.ssl.fastly.net"
  ]
}
```

## Accessibility

- All interactive elements are keyboard navigable.
- Features have `aria-label` from popup title template.
- Layer toggles are labelled checkboxes.
- Popup close button has `aria-label="Close"`.
- Zoom controls have `aria-label="Zoom in"` / `"Zoom out"`.
- Colour is never the sole indicator — icons/shapes differentiate features.
- Focus trapped inside popup when open.

## Size Budget

**Target:** < 200KB (Leaflet ~140KB + markercluster ~30KB + app code ~30KB)

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

### Interaction
- Feature click opens popup with resolved title and fields.
- Popup action button calls `callServerTool` with correct resolved args.
- Popup action with `confirm` shows dialog before calling.
- `viewport-changed` event fires after pan/zoom (debounced).
- `feature-click` event fires on feature click.
- Cluster click zooms to cluster bounds.

### Theme
- Light mode: standard tile layer, light popup background.
- Dark mode: dark tile layer, dark popup background.
- All text uses `--font-family`.
- All borders use `--border-radius`.

### Composition
- Responds to `highlight-feature` message from parent.
- Responds to `fit-bounds` message from parent.
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
│   ├── schemas/
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
