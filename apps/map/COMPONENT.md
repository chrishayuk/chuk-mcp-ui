# @chuk/view-map

## Identity

- **Name:** @chuk/view-map
- **Type:** map
- **Version:** 1.0
- **Category:** Tier 1 -- Universal
- **Description:** Interactive map rendering GeoJSON features with markers, polygons, clustering, popups, and action templates.

## Dependencies

- **Runtime:** Leaflet 1.9+, leaflet.markercluster, React 18
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool, updateModelContext, requestDisplayMode |
| `useViewEvents` | Cross-view event emission (`emitSelect` on feature click) |

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
  features: FeatureCollection;
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
| **Loading** | "Connecting..." fallback while waiting for MCP protocol handshake. |
| **Empty** | Map at default center/zoom with fallback content rendered as plain text. |
| **Populated** | Features rendered per layer config. Map fits to data bounds if no explicit bounds. |
| **Error** | Fallback to plain text content from `result.content`. |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text in popups and map container. Injected styles use CSS variable wrappers rather than hardcoded values. |

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

If `confirm` is set on the action, a `window.confirm` dialog is shown
before the tool call is made. The call is suppressed if the user cancels.

### Action Templates

Template syntax: `{path.to.value}`

Resolved from the feature's GeoJSON properties object using
`resolveTemplates` from `@chuk/view-shared`. Nested paths are supported
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
Button label shows current state: "Fullscreen" or "Exit". Only rendered when
`onRequestDisplayMode` is available (host supports it).

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

### As Parent

Not applicable. `view-map` does not embed other Views.
Use `view-dashboard` to compose map with other Views.

### Cross-View Events

| Direction | Event | Payload | When |
|-----------|-------|---------|------|
| **Emit** | `select` | `[featureId]` (field: `"feature_id"`) | Feature clicked |
| **Listen** | `row-click` (postMessage, origin-restricted to `window.location.origin`) | `{ nhle_id, properties }` | Sibling datatable row clicked -- pans to matching feature |

## Basemaps

| Key | Provider | URL Template |
|-----|----------|-------------|
| `osm` | OpenStreetMap | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| `satellite` | ArcGIS World Imagery | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` |
| `terrain` | OpenTopoMap | `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png` |
| `dark` | CartoDB Dark Matter | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` |

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
- Fullscreen button has `aria-label`.
- Colour is never the sole indicator -- icons/shapes differentiate features.
- Focus trapped inside popup when open.

## Size Budget

**Target:** < 200KB (Leaflet ~140KB + markercluster ~30KB + app code ~30KB)

**Actual:** 754 KB / 208 KB gzip (includes Tailwind CSS + shadcn/ui)

## SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** Placeholder ("Loading map...") — Leaflet requires browser APIs
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `placeholder`

## Test Cases

### TC-MAP-001: Schema Validation -- Minimal Valid Input

**Input:** MapContent with `type: "map"`, `version: "1.0"`, and a single
layer containing one Point feature.

**Expected:** Renders without error. Marker appears at the Point coordinates.
Map fits to the feature location.

### TC-MAP-002: Schema Validation -- Multiple Layers, Mixed Geometry

**Input:** MapContent with three layers: one with Point features, one with
Polygon features, one with LineString features.

**Expected:** All three layers render. Layer control appears (>1 layer).
Each geometry type renders with the correct Leaflet representation.

### TC-MAP-003: Schema Validation -- Missing type Field

**Input:** Object with `version: "1.0"` and `layers` but no `type` field.

**Expected:** Fallback renders. Map does not crash.

### TC-MAP-004: Schema Validation -- Missing layers Field

**Input:** Object with `type: "map"`, `version: "1.0"` but no `layers`.

**Expected:** Fallback renders. Map does not crash.

### TC-MAP-005: Schema Validation -- Invalid GeoJSON in features

**Input:** Layer with `features` set to `{ "type": "invalid" }`.

**Expected:** Graceful fallback. No unhandled exception.

### TC-MAP-006: Schema Validation -- Forward Compatibility

**Input:** Valid MapContent with an additional unknown field `experimental: true`.

**Expected:** Renders normally. Unknown fields are ignored.

### TC-MAP-007: Rendering -- Single Marker

**Input:** One layer, one Point feature at `[48.8566, 2.3522]` (Paris).

**Expected:** Marker renders at the correct lat/lon. Default Leaflet icon
is used (no `style.radius` set).

### TC-MAP-008: Rendering -- Circle Marker

**Input:** One layer, one Point feature with `style.radius: 8`.

**Expected:** CircleMarker renders instead of default pin icon. Radius
matches the configured value.

### TC-MAP-009: Rendering -- Polygon Styling

**Input:** One layer, one Polygon feature with
`style: { color: "#ff0000", weight: 3, fillColor: "#ff9999", fillOpacity: 0.5 }`.

**Expected:** Polygon renders with red border (weight 3), light red fill
at 50% opacity.

### TC-MAP-010: Rendering -- Clustering

**Input:** One layer with 100 Point features in close proximity.
`cluster: { enabled: true, radius: 80 }`.

**Expected:** Features cluster into cluster icons at default zoom.
Clicking a cluster zooms to reveal child markers.

### TC-MAP-011: Rendering -- Clustering Disabled

**Input:** Same 100 Points but `cluster.enabled: false` (or omitted).

**Expected:** All 100 individual markers render. No clustering.

### TC-MAP-012: Rendering -- Fit to Feature Bounds

**Input:** Two features spread across Europe. No `center`, `zoom`, or `bounds`.

**Expected:** Map viewport automatically fits to the bounding box of
all features with padding.

### TC-MAP-013: Rendering -- Explicit Bounds Override

**Input:** Features in London. `bounds: { south: 40.0, west: -5.0, north: 55.0, east: 10.0 }`.

**Expected:** Map fits to the explicit bounds, not to the feature locations.

### TC-MAP-014: Rendering -- Explicit Center and Zoom

**Input:** `center: { lat: 40.7128, lon: -74.0060 }`, `zoom: 12`.
Features elsewhere.

**Expected:** Map centers on New York at zoom 12. Features may be off-screen.

### TC-MAP-015: Rendering -- Basemap Switching

**Input:** Four separate payloads with `basemap` set to `"osm"`,
`"satellite"`, `"terrain"`, and `"dark"` respectively.

**Expected:** Each payload renders tiles from the correct provider URL.
Tile images load without CSP violations.

### TC-MAP-016: Rendering -- Layer Visibility Toggle

**Input:** Two layers, second with `visible: false`.

**Expected:** First layer visible on load. Second layer hidden.
Toggling the layer control checkbox shows the second layer.

### TC-MAP-017: Rendering -- Empty Features

**Input:** One layer with `features: { type: "FeatureCollection", features: [] }`.

**Expected:** Map renders at default center/zoom. No markers or shapes.
Fallback content shown if no structuredContent data available.

### TC-MAP-018: Rendering -- Layer Opacity

**Input:** Layer with `opacity: 0.5`.

**Expected:** Layer renders at 50% opacity.

### TC-MAP-019: Interaction -- Popup Opens on Feature Click

**Input:** Layer with popup template:
`{ title: "{properties.name}", fields: ["type", "status"] }`.
Feature with `properties: { name: "Big Ben", type: "landmark", status: "open" }`.

**Expected:** Clicking the feature opens a popup showing "Big Ben" as bold
title, with "type: landmark" and "status: open" listed below.

### TC-MAP-020: Interaction -- Popup Body Text

**Input:** Popup with `body: "Located in {properties.city}"`.
Feature with `properties: { city: "London" }`.

**Expected:** Popup shows body text "Located in London" beneath the title.

### TC-MAP-021: Interaction -- Popup Action Calls Server Tool

**Input:** Popup action:
```json
{
  "label": "View Details",
  "tool": "get-monument",
  "arguments": { "nhle_id": "{properties.id}" }
}
```
Feature with `properties: { id: "1234567" }`.

**Expected:** Clicking "View Details" calls `callServerTool` with
`name: "get-monument"`, `arguments: { nhle_id: "1234567" }`.

### TC-MAP-022: Interaction -- Popup Action with Confirm

**Input:** Same as TC-MAP-021 but action has `confirm: "Delete this record?"`.

**Expected:** Clicking the action button shows a `window.confirm` dialog.
If confirmed, tool call proceeds. If cancelled, no tool call is made.

### TC-MAP-023: Interaction -- Multiple Popup Actions

**Input:** Popup with two actions: "View" and "Edit".

**Expected:** Both buttons render in the popup. Each resolves independently
to the correct tool call.

### TC-MAP-024: Interaction -- Cluster Click Zooms

**Input:** Clustered layer. User clicks a cluster icon.

**Expected:** Map zooms in to the bounds of the cluster, eventually
revealing individual markers.

### TC-MAP-025: Interaction -- Pan and Zoom

**Input:** Any populated map.

**Expected:** Drag pans the map. Scroll wheel zooms. Zoom buttons work.
No viewport-related errors.

### TC-MAP-026: Theme -- Font Family

**Input:** Host sets `--chuk-font-family: "Courier New", monospace`.

**Expected:** Popup text and map container text render in Courier New.

### TC-MAP-027: Composition -- Highlight Feature from Parent

**Input:** Parent sends `highlight-feature` message with a feature ID.

**Expected:** Map pans to the feature and highlights it.

### TC-MAP-028: Composition -- Fit Bounds from Parent

**Input:** Parent sends `fit-bounds` message with a bounding box.

**Expected:** Map viewport adjusts to the specified bounds.

### TC-MAP-029: Composition -- Feature Click Emits Event

**Input:** User clicks a feature.

**Expected:** `feature-click` event emitted with `layerId`, `featureId`,
and `properties` for parent to route to sibling Views.

### TC-MAP-030: Streaming -- Preview Rectangle

**Input:** `ontoolinputpartial` delivers a partial `bbox` argument.

**Expected:** Dashed rectangle appears on the map outlining the search area.
Rectangle updates as more of the bbox is streamed.

### TC-MAP-031: Streaming -- Preview Marker

**Input:** `ontoolinputpartial` delivers `lat` and `lon` arguments.

**Expected:** Temporary marker appears at the specified coordinates.

### TC-MAP-032: Streaming -- Preview Clears on Result

**Input:** After preview geometry is shown, `ontoolresult` arrives with
actual data.

**Expected:** Preview geometry is removed. Actual features render in place.

### TC-MAP-033: Accessibility -- Keyboard Navigation

**Input:** Map with features and controls.

**Expected:** Tab key moves focus through zoom controls, layer toggles,
and map features. Enter/Space activates focused elements.

### TC-MAP-034: Accessibility -- Screen Reader

**Input:** Map with popup template on features.

**Expected:** Features announce via `aria-label` derived from popup title.
Popup content is read when opened.

### TC-MAP-035: Accessibility -- Layer Toggle Labels

**Input:** Map with multiple layers.

**Expected:** Each layer toggle in the control panel is a labelled checkbox.
Screen reader announces the layer label.

### TC-MAP-036: Fallback -- Missing structuredContent

**Input:** No `structuredContent` in the MCP result. Plain text `content`
is present.

**Expected:** Plain text content renders as fallback. No map initialization
attempted.

### TC-MAP-037: Fallback -- Wrong Type Field

**Input:** `structuredContent` with `type: "chart"` instead of `"map"`.

**Expected:** Fallback renders. Map does not initialize.

### TC-MAP-038: Fallback -- Incompatible Version

**Input:** `structuredContent` with `type: "map"`, `version: "2.0"`.

**Expected:** Warning shown about version mismatch. Best-effort rendering
attempted with available fields.

### TC-MAP-039: CSP -- Tile Loading

**Input:** Map with each basemap type.

**Expected:** Tiles load without Content Security Policy violations.
All tile domains are covered by `img-src` policy.

### TC-MAP-040: Rendering -- Controls Configuration

**Input:** `controls: { zoom: false, scale: false }`.

**Expected:** Zoom control is not shown. Scale control is not shown.
Map is still pannable via drag.

### TC-MAP-041: Rendering -- Default Controls

**Input:** No `controls` field provided. Single layer.

**Expected:** Zoom control shown (default true). Scale control shown
(default true). Layer control not shown (only 1 layer). Fullscreen
control not shown (default false).

### TC-MAP-042: Rendering -- Layer Control Appears for Multiple Layers

**Input:** Two layers. `controls.layers` not specified.

**Expected:** Layer control automatically appears because there are
more than one layer.

### TC-MAP-043: Interaction -- HTML Escaping in Popups

**Input:** Feature with `properties: { name: "<script>alert('xss')</script>" }`.
Popup with `title: "{properties.name}"`.

**Expected:** The property value is HTML-escaped in the popup. No script
execution. Displays the literal text.

### TC-MAP-044: Rendering -- Missing Feature Properties in Template

**Input:** Popup with `fields: ["name", "missing_field"]`.
Feature with `properties: { name: "Test" }` (no `missing_field`).

**Expected:** "name: Test" shown. "missing_field" row omitted (value is
undefined). No rendering error.

### TC-MAP-045: Rendering -- Large Dataset Performance

**Input:** Layer with 10,000 Point features, clustering enabled.

**Expected:** Map renders within 2 seconds. Panning and zooming remain
smooth. Clusters form and split correctly.

## Storybook Stories

Story file: `apps/map/src/MapView.stories.tsx`

| Story | Description |
|-------|-------------|
| SingleLayer | Three London landmarks on OSM basemap with popups |
| Clustered | Same data with marker clustering enabled |
