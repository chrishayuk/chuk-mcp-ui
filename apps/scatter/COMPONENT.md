# Component Spec: @chuk/view-scatter

## 1. Identity

| Field       | Value                                                                                         |
|-------------|-----------------------------------------------------------------------------------------------|
| Name        | `@chuk/view-scatter`                                                                          |
| Type        | `scatter`                                                                                     |
| Version     | `1.0`                                                                                         |
| Category    | Tier 1 -- Universal                                                                           |
| Description | Scatter and bubble plot visualization using Chart.js supporting point styles, tooltips with metadata, logarithmic axes, and zoom. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | Chart.js                                | `^4.4.0`      |
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | framer-motion                           | `^11.0.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
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

### 3.1 Root -- `ScatterContent`

```typescript
interface ScatterContent {
  type: "scatter";
  version: "1.0";
  title?: string;
  subtitle?: string;
  datasets: ScatterDataset[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: { position: "top" | "bottom" | "left" | "right" | "none" };
  zoom?: boolean;
}
```

### 3.2 `ScatterDataset`

```typescript
interface ScatterDataset {
  label: string;
  points: ScatterPoint[];
  color?: string;
  pointStyle?: "circle" | "cross" | "rect" | "triangle" | "star";
  pointRadius?: number;
}
```

### 3.3 `ScatterPoint`

```typescript
interface ScatterPoint {
  x: number;
  y: number;
  r?: number;
  label?: string;
  metadata?: Record<string, string>;
}
```

### 3.4 `AxisConfig`

```typescript
interface AxisConfig {
  label?: string;
  type?: "linear" | "logarithmic";
  min?: number;
  max?: number;
}
```

### 3.5 Defaults

| Field                  | Default                                 |
|------------------------|-----------------------------------------|
| `zoom`                 | `false`                                 |
| `legend.position`      | `"top"`                                 |
| `xAxis.type`           | `"linear"`                              |
| `yAxis.type`           | `"linear"`                              |
| `dataset.pointRadius`  | `4`                                     |
| `dataset.pointStyle`   | `"circle"`                              |
| dataset colors         | Cycle through 8 defaults: `#3388ff`, `#ff6384`, `#36a2eb`, `#ffce56`, `#4bc0c0`, `#9966ff`, `#ff9f40`, `#c9cbcf` |

---

## 4. Rendering

### 4.1 Layout

- A single `<canvas>` element fills its container.
- The container has 16 px padding on all sides, uses `box-sizing: border-box`.
- Canvas is centered via flexbox (`align-items: center; justify-content: center`).
- `responsive: true`, `maintainAspectRatio: false` -- the chart scales freely to fill available space without forcing a fixed aspect ratio.
- Entry animation via framer-motion `fadeIn` variant.

### 4.2 Scatter vs Bubble Mode

If any point in any dataset has an `r` value, the chart renders in bubble mode (`BubbleController`). Otherwise it uses scatter mode (`ScatterController`). This is determined automatically from the data.

### 4.3 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. Falls back to plain text display of raw content. |
| Populated   | Full Chart.js rendering with all configured options.                    |
| Error       | Chart.js errors are not explicitly caught; the component relies on the shared `Fallback` component for graceful degradation. |

### 4.4 Theme

| CSS Custom Property               | Usage                                |
|------------------------------------|--------------------------------------|
| `--chuk-color-text`                | Title, legend labels, axis titles.   |
| `--chuk-color-text-secondary`      | Subtitle, axis tick labels.          |
| `--chuk-color-border`              | Grid lines.                          |
| `--chuk-font-family`               | Applied to the chart container.      |
| `--chuk-color-background`          | Background color of the container.   |

---

## 5. Interactions

| Interaction                | Condition                  | Behaviour                                                        |
|----------------------------|----------------------------|------------------------------------------------------------------|
| Hover tooltip              | Always enabled             | Shows point label (if set), coordinates, radius (bubble mode), and metadata key-value pairs. Uses `mode: "nearest"`, `intersect: true`. |
| Legend toggle               | Legend is visible          | Clicking a legend item toggles visibility of the corresponding dataset. |
| Zoom (wheel)               | `zoom === true`            | Mouse wheel zooms in/out by scaling axis min/max around the center point. Factor 1.1x per scroll tick. |
| Point styles               | `pointStyle` is set        | Each dataset can use a different point shape: circle, cross, rect, triangle, or star. |

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

Not implemented. The component renders a complete chart from the full `ScatterContent` payload. Incremental updates require a full re-render (the previous `ChartJS` instance is destroyed and recreated on every `data` change).

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the `postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook. The scatter view registers with `type: "scatter"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The scatter view does not embed child views.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None. The component is bundled as a single HTML file via `vite-plugin-singlefile` and requires no external network requests at runtime. All Chart.js code and assets are inlined.

---

## 9. Size Budget

| Metric       | Target      |
|--------------|-------------|
| Raw          | < 200 KB    |
| Gzip         | < 60 KB     |

The scatter view registers only the ScatterController, BubbleController, LinearScale, LogarithmicScale, and PointElement -- significantly fewer modules than the full chart view.

---

## 9b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** Placeholder ("Loading scatter plot...") — Chart.js requires canvas
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `placeholder`

---

## 10. Build

Entry point: `mcp-app.html`

```bash
# Development
pnpm dev

# Production build (outputs dist/mcp-app.html)
pnpm build

# Type checking
pnpm type-check

# Tests
pnpm test

# Clean
pnpm clean
```

Output: a single self-contained `dist/mcp-app.html` file (via `vite-plugin-singlefile`).

---

## 11. Test Cases

### 11.1 Schema Validation (AJV -- JSON Schema)

| ID      | Description                              | Expected |
|---------|------------------------------------------|----------|
| TC-S01  | Minimal valid scatter                    | Pass     |
| TC-S02  | All optional fields present              | Pass     |
| TC-S03  | Multiple datasets                        | Pass     |
| TC-S04  | Bubble points with r values              | Pass     |
| TC-S05  | Logarithmic axis type                    | Pass     |
| TC-S06  | All point styles                         | Pass     |
| TC-S07  | All legend positions                     | Pass     |
| TC-S08  | Rejects missing type                     | Fail     |
| TC-S09  | Rejects wrong type                       | Fail     |
| TC-S10  | Rejects missing version                  | Fail     |
| TC-S11  | Rejects missing datasets                 | Fail     |
| TC-S12  | Rejects point missing x                  | Fail     |
| TC-S13  | Rejects point missing y                  | Fail     |
| TC-S14  | Rejects invalid point style              | Fail     |
| TC-S15  | Rejects invalid axis type                | Fail     |
| TC-S16  | Accepts empty points array               | Pass     |
| TC-S17  | Accepts points with metadata             | Pass     |

### 11.2 Zod Schema Validation

| ID      | Description                              | Expected |
|---------|------------------------------------------|----------|
| TC-Z01  | Minimal valid scatter                    | Pass     |
| TC-Z02  | All optional fields present              | Pass     |
| TC-Z03  | Bubble points with r values              | Pass     |
| TC-Z04  | Rejects wrong type                       | Fail     |
| TC-Z05  | Rejects missing datasets                 | Fail     |
| TC-Z06  | Rejects point with missing x             | Fail     |
| TC-Z07  | Rejects point with missing y             | Fail     |
| TC-Z08  | Rejects invalid point style              | Fail     |
| TC-Z09  | Accepts all point styles                 | Pass     |
| TC-Z10  | Accepts logarithmic axis types           | Pass     |

---

## 12. Storybook Stories

Story file: `apps/scatter/src/Scatter.stories.tsx`

| Story           | Description                                                  |
|-----------------|--------------------------------------------------------------|
| IrisDataset     | Classic 3-class scatter with different point styles          |
| BubblePlot      | Points with varying radius, labels, and metadata             |
| LogarithmicAxes | Both axes using logarithmic scale                            |
| SingleDataset   | Simple scatter with labeled points and clamped Y axis        |
