# Component Spec: @chuk/view-gauge

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-gauge`                                                    |
| Type        | `gauge`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Single-value arc/dial metric View that displays a semicircular gauge with threshold zones, formatted value, and optional title/subtitle. |

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

## 2b. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

---

## 3. Schema

### 3.1 Root -- `GaugeContent`

```typescript
interface GaugeContent {
  type: "gauge";
  version: "1.0";
  title?: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  thresholds?: GaugeThreshold[];
  format?: "number" | "percent";
  size?: "sm" | "md" | "lg";
  subtitle?: string;
}

interface GaugeThreshold {
  value: number;
  color: string;
  label?: string;
}
```

### 3.2 Defaults

| Field        | Default     |
|--------------|-------------|
| `title`      | `undefined` (not rendered) |
| `min`        | `0`         |
| `max`        | `100`       |
| `unit`       | `undefined` (not rendered) |
| `thresholds` | `undefined` (single-colour arc) |
| `format`     | `"number"`  |
| `size`       | `"md"`      |
| `subtitle`   | `undefined` (not rendered) |

---

## 4. Rendering

### 4.1 Layout

Centered Card with size-dependent max-width (sm=200px, md=280px, lg=360px). SVG semicircular arc gauge with viewBox `0 0 200 120`. Arc path `M 20 100 A 80 80 0 0 1 180 100` with total arc length of ~251.3 (pi * 80). Background muted arc, optional threshold zone arcs at 20% opacity, and a value arc whose stroke-dashoffset is proportional to `(value - min) / (max - min)`. Center value text displayed as large bold text. Title above gauge, subtitle below.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full gauge display with arc, value, title, and subtitle.                |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Value text colour, default arc colour.           |
| `--color-background`         | Container background.                            |
| `--color-muted`              | Background arc stroke.                           |
| `--color-muted-foreground`   | Title text, subtitle text.                       |

### 4.4 Threshold Colours

Thresholds define coloured zones on the arc. The value arc takes the colour of the threshold zone the current value falls within. Threshold arcs render at 20% opacity beneath the value arc. When no thresholds are provided, the value arc uses `currentColor`.

---

## 5. Interactions

### 5.1 User Actions

None. The gauge is display-only. The value arc animates via CSS `transition: stroke-dashoffset 0.6s ease`.

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 5b. Model Context Updates

None.

---

## 5c. Display Mode

Not applicable. The view stays inline-only.

---

## 5d. Cancellation

Default. No special handling beyond shared Fallback behaviour.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Particularly suited for dashboard grid layouts alongside counter views.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- Value formatted with `Intl.NumberFormat` for locale-aware number grouping.
- Percentage format rounds to nearest integer.
- SVG is marked `aria-hidden="true"` with value displayed as text.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `GaugeRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid GaugeContent with value only.
- Accepts gauge with all options.
- Accepts gauge with thresholds.
- Accepts all size options.
- Accepts all format options.
- Accepts negative min value.
- Accepts decimal value.
- Accepts zero value.
- Rejects missing value.
- Rejects missing type.
- Rejects missing version.
- Rejects wrong type.
- Rejects invalid size.
- Rejects invalid format.
- Accepts unknown additional fields.

### Rendering

- Arc renders with correct stroke-dashoffset for value.
- Threshold zones render at 20% opacity.
- Value text displays formatted with unit.
- Title and subtitle render when provided.
- Size classes apply correctly.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/gauge/src/Gauge.stories.tsx`

| Story        | Description                                                  |
|--------------|--------------------------------------------------------------|
| SpeedGauge   | Speed dial with thresholds at 60/90/120, value 72 mph        |
| CPUUsage     | Percent format with thresholds, subtitle "Server Alpha"      |
| Temperature  | Large size, negative min, decimal value, unit in degrees C    |
