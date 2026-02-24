# Component Spec: @chuk/view-threed

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-threed`                                                   |
| Type        | `threed`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 2 -- Specialist                                                  |
| Description | Isometric 3D scene View rendering geometric primitives (box, sphere, cylinder, cone, torus) as pure SVG with painter's algorithm depth sorting. |

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

### 3.1 Root -- `ThreedContent`

```typescript
interface ThreedContent {
  type: "threed";
  version: "1.0";
  title?: string;
  objects: ThreedObject[];
  camera?: {
    position?: [number, number, number];
    target?: [number, number, number];
  };
  background?: string;
}

interface ThreedObject {
  id: string;
  geometry: "box" | "sphere" | "cylinder" | "cone" | "torus";
  position: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  label?: string;
  wireframe?: boolean;
}
```

### 3.2 Defaults

| Field        | Default        |
|--------------|----------------|
| `title`      | `undefined`    |
| `background` | `undefined`    |
| `scale`      | `[1, 1, 1]`   |
| `color`      | geometry-based |
| `wireframe`  | `false`        |

---

## 4. Rendering

### 4.1 Projection

Isometric projection: `x_screen = (x - z) * cos(30deg)`, `y_screen = (x + z) * sin(30deg) - y`. Objects depth-sorted using painter's algorithm.

### 4.2 Geometry Types

- **box**: 3-face isometric cube with shading (top, left, right faces)
- **sphere**: Circle with radial gradient for 3D lighting effect; wireframe shows latitude/longitude ellipses
- **cylinder**: Top/bottom ellipses connected by body rectangle
- **cone**: Apex point to base ellipse with triangular body
- **torus**: Concentric ellipses with filled ring and highlight

### 4.3 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | `<Fallback message="Connecting..." />`                                  |
| Empty       | `<Fallback content={content} />`                                        |
| Populated   | Full 3D scene with all objects rendered                                 |

---

## 5. Interactions

Display-only. No user interactions currently implemented.

---

## 5b. Model Context Updates

None. The threed view does not call `updateModelContext`.

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

None. The threed view does not emit ViewBus events or listen for messages
from sibling Views.

---

## 5f. SSR Entry

- **File:** `apps/threed/src/ssr-entry.tsx`
- **Renders:** `ThreedRenderer` via `renderToString`
- **Config:** `apps/threed/vite.config.ssr.ts`
- **Output:** `apps/threed/dist-ssr/ssr-entry.js`

---

## 6. Storybook Stories

| Story              | Description                                                  |
|--------------------|--------------------------------------------------------------|
| BasicShapes        | All 5 geometry types arranged in a scene with labels         |
| MolecularModel     | Water molecule: oxygen and hydrogen spheres with bond cylinders |
| ArchitecturalBlocks| Simple building with stacked boxes, pillars, and dome        |
