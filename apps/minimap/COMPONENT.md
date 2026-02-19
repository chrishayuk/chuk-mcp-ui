# Component Spec: @chuk/view-minimap

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-minimap`                                                  |
| Type        | `minimap`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 2 -- Domain                                                      |
| Description | Overview-detail dual map View rendering two linked Leaflet instances with an extent rectangle showing the detail viewport on the overview map. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | Leaflet                                 | `^1.9.4`      |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | framer-motion                           | `^11.0.0`     |
| Runtime  | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |
| Build    | vite                                    | `^6.0.0`      |
| Build    | vite-plugin-singlefile                  | `^2.0.0`      |
| Build    | typescript                              | `^5.7.0`      |
| Build    | `@vitejs/plugin-react`                  | `^4.3.0`      |
| Protocol | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |

---

## 3. Schema

### 3.1 Root -- `MinimapContent`

```typescript
interface MinimapContent {
  type: "minimap";
  version: "1.0";
  title?: string;
  overview: MinimapPanel;
  detail: MinimapPanel;
  linkZoom?: boolean;
  layout?: "horizontal" | "vertical";
  ratio?: string;
}

interface MinimapPanel {
  center?: { lat: number; lon: number };
  zoom?: number;
  basemap?: "osm" | "satellite" | "terrain" | "dark";
  layers: MinimapLayer[];
}

interface MinimapLayer {
  id: string;
  label: string;
  visible?: boolean;
  features: object;  // GeoJSON FeatureCollection
  style?: {
    color?: string;
    weight?: number;
    fillColor?: string;
    fillOpacity?: number;
    radius?: number;
  };
  popup?: {
    title: string;
    fields?: string[];
  };
}
```

### 3.2 Defaults

| Field               | Default                            |
|---------------------|------------------------------------|
| `title`             | *(none)*                           |
| `layout`            | `"horizontal"`                     |
| `ratio`             | `"1:2"` (overview : detail)        |
| `linkZoom`          | `false`                            |
| `panel.center`      | `{ lat: 51.505, lon: -0.09 }`     |
| `panel.zoom`        | overview: `10`, detail: `14`       |
| `panel.basemap`     | `"osm"`                            |
| `layer.visible`     | `true`                             |
| `style.color`       | `"#3388ff"`                        |
| `style.weight`      | `2`                                |
| `style.fillOpacity` | `0.3`                              |

---

## 4. Rendering

### 4.1 Layout

Flex container filling the entire iframe viewport. Two map panels separated by a 1px border divider.

- `layout: "horizontal"` (default): side-by-side, overview on the left, detail on the right.
- `layout: "vertical"`: stacked, overview on top, detail below.
- `ratio` controls the flex sizing (e.g. `"1:2"` gives overview 1/3 of space, detail 2/3).

Optional title bar rendered above the map panels when `title` is set.

### 4.2 Overview Map

- Wider geographic view showing all overview layers.
- Draws a dashed extent rectangle showing the current bounds of the detail map viewport.
- Zoom controls hidden to keep the overview compact.
- Clicking anywhere on the overview pans the detail map to that location.

### 4.3 Detail Map

- Zoomed-in view showing detail layers with full interactivity.
- Zoom controls and scale bar shown.
- Pan and zoom events update the extent rectangle on the overview map.
- GeoJSON layers render with style and popup support.

### 4.4 Linked Zoom

When `linkZoom: true`, zooming in or out on the detail map also adjusts the overview zoom level to maintain a fixed offset (detail zoom - 4).

### 4.5 States

| State         | Behaviour                                                        |
|---------------|------------------------------------------------------------------|
| **Loading**   | "Connecting..." fallback while waiting for MCP protocol handshake. |
| **Empty**     | Maps at default center/zoom with fallback content as plain text.   |
| **Populated** | Features rendered per panel layer configs. Extent rectangle synced. |
| **Error**     | Fallback to plain text content from `result.content`.              |

### 4.6 Theme Integration

| CSS Variable                  | Usage                          |
|-------------------------------|--------------------------------|
| `--chuk-color-background`     | Popup background               |
| `--chuk-color-text`           | Popup text                     |
| `--chuk-color-text-secondary` | Popup field labels             |
| `--chuk-color-border`         | Popup border, panel divider    |
| `--chuk-font-family`          | All text                       |

### 4.7 Animation

Uses `fadeIn` variant from `@chuk/view-ui/animations` for the initial reveal.

---

## 5. Interactions

### 5.1 User Actions

| Action                | Trigger                     | Result                                           |
|-----------------------|-----------------------------|--------------------------------------------------|
| Click overview        | `click` on overview map     | Detail map pans to the clicked location           |
| Pan/zoom detail       | Drag / scroll / buttons     | Extent rectangle on overview updates              |
| Click feature         | `click` on marker/polygon   | Open popup with configured fields                 |
| Zoom detail (linked)  | Scroll / buttons on detail  | Overview zoom adjusts to `detail.zoom - 4`        |

### 5.2 Outbound Events

| Event              | Payload                              | When                         |
|--------------------|--------------------------------------|------------------------------|
| `detail-moved`     | `{ center, zoom, bounds }`           | After detail pan/zoom settles |

---

## 6. Streaming

Not implemented. Both panels render on initial data load.

---

## 7. Composition

### 7.1 As Child

Works inside `view-dashboard`, `view-split`, and `view-tabs` containers.

### 7.2 As Parent

Not applicable. Use `view-dashboard` to compose minimap with other Views.

---

## 8. CSP Requirements

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

---

## 9. Accessibility

- Both map containers have `aria-label` attributes ("Overview map" / "Detail map").
- Popup content is keyboard-navigable.
- Colour is supplemented by shape differentiation in GeoJSON features.
- Title bar uses semantic heading level.

---

## 10. Size Budget

| Metric | Target       | Actual |
|--------|-------------|--------|
| Raw    | < 200 KB    | TBD    |
| Gzip   | --          | TBD    |

---

## 11. Basemaps

| Key         | Provider              | URL Template                                                                 |
|-------------|-----------------------|------------------------------------------------------------------------------|
| `osm`       | OpenStreetMap         | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`                         |
| `satellite` | ArcGIS World Imagery  | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/...`     |
| `terrain`   | OpenTopoMap           | `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`                           |
| `dark`      | CartoDB Dark Matter   | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`              |

---

## 12. Test Cases

### Schema Validation

- Accepts minimal valid MinimapContent with overview and detail panels.
- Accepts full content with all optional fields populated.
- Accepts all basemap type values on both panels.
- Accepts both layout values (horizontal, vertical).
- Rejects missing overview panel.
- Rejects missing detail panel.
- Rejects missing type or wrong type value.
- Rejects layer missing id or features.
- Rejects panel missing layers array.
- Rejects invalid basemap or layout values.
- Accepts unknown additional fields at root.

### Rendering

- Overview and detail maps render independently in flex container.
- Extent rectangle appears on overview showing detail viewport bounds.
- Clicking overview pans detail map to clicked location.
- Pan/zoom on detail updates extent rectangle.
- linkZoom synchronizes zoom levels between maps.
- Basemap tiles load correctly for each panel.
- GeoJSON layers render with configured styles and popups.
- Vertical layout stacks panels top-to-bottom.
- Ratio string controls relative panel sizing.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 13. Storybook Stories

Story file: `apps/minimap/src/Minimap.stories.tsx`

| Story             | Description                                              |
|-------------------|----------------------------------------------------------|
| Horizontal        | Default side-by-side layout with landmarks and river     |
| Vertical          | Stacked layout with equal ratio                          |
| LinkedZoom        | Detail zoom changes adjust overview zoom                 |
| SatelliteOverview | Mixed basemaps: satellite overview, dark detail          |
| NoTitle           | Minimap without title bar                                |
