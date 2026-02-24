# @chuk/view-layers

## Identity

- **Name:** @chuk/view-layers
- **Type:** layers
- **Version:** 1.0
- **Category:** Tier 1 -- Universal
- **Description:** Multi-layer map rendering GeoJSON features with a layer control panel, choropleth styling, opacity sliders, group organization, and popup templates.

## Dependencies

- **Runtime:** Leaflet 1.9+, React 18
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

## Schema

### Input (structuredContent)

```typescript
interface LayersContent {
  type: "layers";
  version: "1.0";
  title?: string;
  center?: { lat: number; lon: number };
  zoom?: number;
  basemap?: "osm" | "satellite" | "terrain" | "dark";
  layers: LayerDef[];
}

interface LayerDef {
  id: string;
  label: string;
  visible?: boolean;
  opacity?: number;
  features: object;  // GeoJSON FeatureCollection
  style?: LayerStyle;
  popup?: LayerPopup;
  group?: string;
}

interface LayerStyle {
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
}

interface LayerPopup {
  title: string;
  fields?: string[];
}
```

### Defaults

| Field | Default |
|-------|---------|
| center | `{ lat: 51.505, lon: -0.09 }` (London) |
| zoom | `10` |
| basemap | `"osm"` |
| layer.visible | `true` |
| layer.opacity | `1.0` |
| style.color | `"#3388ff"` |
| style.weight | `2` |
| style.fillOpacity | `0.3` |

## Rendering

### Layout

Full-bleed map filling the entire iframe viewport. A Card-based layer
control panel is positioned at the top-right corner (z-index 1000) with
backdrop blur. The panel lists all layers organized by group with checkbox
toggles and opacity sliders per layer.

If no `center` or `zoom` is provided, the map fits to the bounding box
of all features across all layers. If `center` is provided, the map
centers there at the given zoom level.

### Layer Control Panel

- Layers are grouped by their `group` field, with group names displayed as uppercase section headers
- Each layer shows a checkbox toggle, label, color swatch (from style.color), and an opacity button
- Clicking the opacity button reveals a range slider (0-100%)
- The panel uses a ScrollArea for overflow when many layers are present
- A title from `LayersContent.title` is displayed at the top of the panel

### Choropleth Styling

Each layer is styled independently via its `LayerStyle` configuration:
- `color`: stroke color for lines and polygon borders
- `weight`: stroke width in pixels
- `fillColor`: fill color for polygons and circle markers
- `fillOpacity`: fill opacity (0-1)

Point features render as circle markers with a default radius of 6px.

### Popups

When a `LayerPopup` is configured on a layer:
- Clicking a feature opens a popup showing the resolved title
- Listed `fields` are displayed as key-value pairs from the feature's properties
- Template syntax: `{properties.key}` or `{key}` resolves from feature properties

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
| `--chuk-color-background` | Popup background |
| `--chuk-color-text` | Popup text color |
| `--chuk-color-border` | Popup border |
| `--chuk-color-text-secondary` | Popup field labels |

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Toggle layer | Checkbox in control panel | Show/hide layer on map |
| Adjust opacity | Opacity slider | Change layer transparency |
| Click feature | `click` on marker/polygon | Open popup with template-rendered content |
| Pan/zoom | Drag / scroll / buttons | Update viewport |

## Model Context Updates

None.

## Display Mode

Not applicable. The view stays inline-only.

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

## Composition

### As Child

Works inside dashboard, split, and tabs containers.

### As Parent

Not applicable.

### Cross-View Events

None.

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

- All layer toggle checkboxes have `aria-label` with the layer name.
- Opacity sliders have `aria-label` describing which layer they control.
- Zoom controls have standard Leaflet accessibility attributes.
- Popup content is accessible when opened.

## Size Budget

**Target:** < 180KB (Leaflet ~140KB + app code ~40KB)

## SSR Entry

- **File:** `apps/layers/src/ssr-entry.tsx`
- **Renders:** `LayersRenderer` via `renderToString`
- **Config:** `apps/layers/vite.config.ssr.ts`
- **Output:** `apps/layers/dist-ssr/ssr-entry.js`

## Test Cases

### TC-LAYERS-001: Schema Validation -- Minimal Valid Input

**Input:** LayersContent with `type: "layers"`, `version: "1.0"`, and a single
layer containing one LineString feature.

**Expected:** Renders without error. Line appears on the map.

### TC-LAYERS-002: Schema Validation -- Full Options

**Input:** LayersContent with all optional fields populated: title, center,
zoom, basemap, style, popup, group.

**Expected:** All fields are respected. Control panel shows grouped layers.

### TC-LAYERS-003: Schema Validation -- Missing type

**Input:** Object with `version: "1.0"` and `layers` but no `type`.

**Expected:** Schema validation fails. Fallback renders.

### TC-LAYERS-004: Schema Validation -- Wrong type

**Input:** `type: "map"` instead of `"layers"`.

**Expected:** Schema validation fails.

### TC-LAYERS-005: Rendering -- Layer Visibility Toggle

**Input:** Two layers, one initially hidden (`visible: false`).

**Expected:** One layer visible. Toggling checkbox shows hidden layer.

### TC-LAYERS-006: Rendering -- Opacity Slider

**Input:** Layer with `opacity: 0.5`.

**Expected:** Layer renders at 50% opacity. Slider adjusts opacity.

### TC-LAYERS-007: Rendering -- Grouped Layers

**Input:** Four layers across three groups.

**Expected:** Control panel shows group headers with layers organized beneath.

### TC-LAYERS-008: Rendering -- Choropleth Styling

**Input:** Three layers with different colors and fill styles.

**Expected:** Each layer renders with its specified style.

### TC-LAYERS-009: Rendering -- Popup on Click

**Input:** Layer with popup config `{ title: "{properties.name}", fields: ["type"] }`.

**Expected:** Clicking feature opens popup with resolved title and fields.

### TC-LAYERS-010: Rendering -- Auto Fit Bounds

**Input:** Layers with features spread across London. No explicit center/zoom.

**Expected:** Map fits to the bounding box of all features.

## Storybook Stories

Story file: `apps/layers/src/Layers.stories.tsx`

| Story | Description |
|-------|-------------|
| CityInfrastructure | Roads + buildings + parks layers organized by group |
| SimpleMap | Single layer with point features |
| StyledLayers | Custom colors per layer on dark basemap |
| MultipleGroups | Four layers organized across three groups |
