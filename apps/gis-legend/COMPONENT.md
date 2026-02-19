# Component Spec: @chuk/view-gis-legend

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-gis-legend`                                               |
| Type        | `gis-legend`                                                          |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Cartographic legend View with SVG symbol swatches for point, line, polygon, gradient, and icon map symbols. Displays labelled legend entries grouped by section. |

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
| Protocol | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |

---

## 3. Schema

### 3.1 Root -- `GisLegendContent`

```typescript
interface GisLegendContent {
  type: "gis-legend";
  version: "1.0";
  title?: string;
  sections: GisLegendSection[];
  orientation?: "vertical" | "horizontal";
}

interface GisLegendSection {
  title?: string;
  items: GisLegendItem[];
}

interface GisLegendItem {
  type: "point" | "line" | "polygon" | "gradient" | "icon";
  label: string;
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  size?: number;
  icon?: string;
  gradientStops?: GisLegendGradientStop[];
}

interface GisLegendGradientStop {
  value: string;
  color: string;
}
```

### 3.2 Defaults

| Field         | Default            |
|---------------|--------------------|
| `title`       | *(none)*           |
| `orientation` | `"vertical"`       |
| `color`       | Type-specific      |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 600px. Optional title header. ScrollArea wrapping sections. Each section has an optional uppercase title and a list of legend items.

### 4.2 SVG Swatches

| Item Type  | SVG Element       | Description                          |
|------------|-------------------|--------------------------------------|
| `point`    | `<circle>`        | Filled circle with optional stroke   |
| `line`     | `<line>`          | Horizontal line with stroke          |
| `polygon`  | `<rect>`          | Filled rectangle with optional stroke|
| `gradient` | `<linearGradient>`| Gradient-filled rectangle            |
| `icon`     | Text span         | Unicode icon character               |

### 4.3 Orientation

- `vertical` (default): Items stack vertically in each section.
- `horizontal`: Items wrap horizontally using flexbox.

---

## 5. Interactions

### 5.1 User Actions

No interactive actions. Legend is read-only.

---

## 6. Streaming

Not implemented.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

---

## 8. CSP Requirements

No external resources loaded. All SVG is inline.

---

## 9. Accessibility

- SVG swatches use `aria-hidden="true"` as labels provide text description.
- Colour is supplemented by shape and text label.
- Section titles use semantic heading elements.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts valid GisLegendContent with sections array.
- Accepts all item type values (point, line, polygon, gradient, icon).
- Accepts optional title, orientation.
- Rejects missing sections.
- Rejects item missing type or label.
- Rejects invalid item type value.

### Rendering

- SVG swatches render correct shapes for each item type.
- Section titles render as uppercase headings.
- Horizontal orientation applies flex wrap layout.
- Gradient stops render correctly in linearGradient.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/gis-legend/src/GisLegend.stories.tsx`

| Story      | Description                                         |
|------------|-----------------------------------------------------|
| LandCover  | Multi-section land cover classification legend       |
| Seismic    | Earthquake points, gradient intensity, fault lines   |
| Horizontal | Horizontal orientation with mixed symbol types       |
