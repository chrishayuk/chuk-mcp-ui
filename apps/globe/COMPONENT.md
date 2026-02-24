# Component Spec: @chuk/view-globe

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-globe`                                                    |
| Type        | `globe`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 2 -- Specialist                                                  |
| Description | Interactive SVG globe View with orthographic projection, draggable rotation, geographic points, and curved arcs between locations. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | framer-motion                           | `^11.0.0`     |
| Runtime  | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |
| Build    | vite                                    | `^6.0.0`      |
| Build    | vite-plugin-singlefile                  | `^2.0.0`      |
| Build    | typescript                              | `^5.7.0`      |
| Build    | `@vitejs/plugin-react`                  | `^4.3.0`      |

---

## 2b. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, requestDisplayMode |

---

## 3. Schema

### 3.1 Root -- `GlobeContent`

```typescript
interface GlobeContent {
  type: "globe";
  version: "1.0";
  title?: string;
  points: GlobePoint[];
  arcs?: GlobeArc[];
  rotation?: { lat: number; lon: number };
}

interface GlobePoint {
  id: string;
  lat: number;
  lon: number;
  label: string;
  color?: string;
  size?: number;
}

interface GlobeArc {
  from: string;
  to: string;
  color?: string;
  label?: string;
}
```

### 3.2 Defaults

| Field        | Default        |
|--------------|----------------|
| `title`      | `undefined`    |
| `rotation`   | `{lat:20, lon:0}` |
| `color`      | `"#ff4444"`    |
| `size`       | `5`            |

---

## 4. Rendering

### 4.1 Projection

Orthographic projection from lat/lon to 2D screen coordinates. Only points on the visible hemisphere are rendered. Globe rendered as a circle with a blue-green radial gradient.

### 4.2 Features

- Graticule grid lines (every 30 degrees latitude and longitude)
- Point markers with labels
- Curved arc paths between points (elevated for visual effect)
- Drag-to-rotate interaction

### 4.3 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | `<Fallback message="Connecting..." />`                                  |
| Empty       | `<Fallback content={content} />`                                        |
| Populated   | Full globe with points, arcs, and graticule                             |

---

## 5. Interactions

- **Drag to rotate**: Pointer drag rotates the globe view. Latitude clamped to +/- 80 degrees.

---

## 5b. Model Context Updates

None. The globe view does not call `updateModelContext`.

---

## 5c. Display Mode

Fullscreen toggle button in top-right corner (`absolute top-2 right-2 z-[1000]`).
Uses semi-transparent background (`bg-background/80 backdrop-blur-sm`).
Toggles between `"inline"` and `"fullscreen"` via `requestDisplayMode()`.
Button label shows "Fullscreen" or "Exit Fullscreen". Only rendered when
`onRequestDisplayMode` is available (host supports it).

---

## 5d. Cancellation

Default. No special handling beyond the shared Fallback behaviour.

---

## 5e. Cross-View Events

None. The globe view does not emit ViewBus events or listen for messages
from sibling Views.

---

## 5f. SSR Entry

- **File:** `apps/globe/src/ssr-entry.tsx`
- **Renders:** `GlobeRenderer` via `renderToString`
- **Config:** `apps/globe/vite.config.ssr.ts`
- **Output:** `apps/globe/dist-ssr/ssr-entry.js`

---

## 6. Storybook Stories

| Story                | Description                                               |
|----------------------|-----------------------------------------------------------|
| WorldCities          | Major world cities as labelled points                     |
| FlightRoutes         | International flight routes with colored arcs             |
| ConferenceLocations  | Tech conference venues with custom rotation               |
