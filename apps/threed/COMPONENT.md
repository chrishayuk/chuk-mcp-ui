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

## 6. Storybook Stories

| Story              | Description                                                  |
|--------------------|--------------------------------------------------------------|
| BasicShapes        | All 5 geometry types arranged in a scene with labels         |
| MolecularModel     | Water molecule: oxygen and hydrogen spheres with bond cylinders |
| ArchitecturalBlocks| Simple building with stacked boxes, pillars, and dome        |
