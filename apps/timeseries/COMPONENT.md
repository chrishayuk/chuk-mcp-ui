# Component Spec: @chuk/view-timeseries

## 1. Identity

| Field       | Value                                                                                         |
|-------------|-----------------------------------------------------------------------------------------------|
| Name        | `@chuk/view-timeseries`                                                                       |
| Type        | `timeseries`                                                                                  |
| Version     | `1.0`                                                                                         |
| Category    | Tier 1 -- Universal                                                                           |
| Description | Time-axis chart visualization using Chart.js with date-fns adapter, supporting line, bar, and area series types with annotations and zoom. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | Chart.js                                | `^4.4.0`      |
| Runtime  | chartjs-adapter-date-fns                | `^3.0.0`      |
| Runtime  | date-fns                                | `^4.0.0`      |
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

### 3.1 Root -- `TimeseriesContent`

```typescript
interface TimeseriesContent {
  type: "timeseries";
  version: "1.0";
  title?: string;
  subtitle?: string;
  series: TimeseriesSeries[];
  xAxis?: { label?: string; min?: string; max?: string };
  yAxis?: { label?: string; min?: number; max?: number; type?: "linear" | "logarithmic" };
  annotations?: TimeseriesAnnotation[];
  zoom?: boolean;
}
```

### 3.2 `TimeseriesSeries`

```typescript
interface TimeseriesSeries {
  label: string;
  data: { t: string; v: number }[];
  color?: string;
  fill?: boolean;
  type?: "line" | "bar" | "area";
}
```

### 3.3 `TimeseriesAnnotation`

```typescript
interface TimeseriesAnnotation {
  type: "line" | "range";
  start: string;
  end?: string;
  label?: string;
  color?: string;
}
```

### 3.4 Defaults

| Field                  | Default                                 |
|------------------------|-----------------------------------------|
| `zoom`                 | `false`                                 |
| `yAxis.type`           | `"linear"`                              |
| `series.type`          | `"line"`                                |
| `series.fill`          | `false` (`true` for `"area"` type)      |
| `series.tension`       | `0` (`0.4` for `"area"` type)           |
| `series.borderWidth`   | `2`                                     |
| `series.pointRadius`   | `3`                                     |
| dataset colors         | Cycle through 8 defaults: `#3388ff`, `#ff6384`, `#36a2eb`, `#ffce56`, `#4bc0c0`, `#9966ff`, `#ff9f40`, `#c9cbcf` |

---

## 4. Rendering

### 4.1 Layout

- A single `<canvas>` element fills its container.
- The container has 16 px padding on all sides, uses `box-sizing: border-box`.
- Canvas is centered via flexbox (`align-items: center; justify-content: center`).
- `responsive: true`, `maintainAspectRatio: false` -- the chart scales freely to fill available space.
- Wrapped in a `motion.div` with `fadeIn` animation variant from `@chuk/view-ui/animations`.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full Chart.js rendering with time-scale x-axis and configured y-axis.   |

### 4.3 Theme

| CSS Custom Property              | Usage                                |
|----------------------------------|--------------------------------------|
| `--chuk-color-text`              | Title, axis labels, legend text.     |
| `--chuk-color-text-secondary`    | Tick labels, subtitle.               |
| `--chuk-color-border`            | Grid lines.                          |
| `--chuk-color-background`        | Container background (via Tailwind). |

### 4.4 Series Type Mapping

| Schema `series.type` | Chart.js Controller | Notes                                              |
|-----------------------|--------------------|----------------------------------------------------|
| `"line"` (default)    | `LineController`   | Standard line chart on time axis.                  |
| `"bar"`               | `BarController`    | Vertical bars on time axis.                        |
| `"area"`              | `LineController`   | Mapped to line with `fill: true`, `tension: 0.4`, and 0.2 alpha background. |

### 4.5 Annotations

Annotations are rendered via a custom Chart.js plugin (`timeseriesAnnotations`) that draws after the main chart:

- **`"line"`** annotations draw a dashed vertical line at the `start` timestamp with an optional label above.
- **`"range"`** annotations draw a shaded rectangle between `start` and `end` timestamps with dashed vertical borders and an optional centered label above.

### 4.6 Data Mapping

Each series data point `{ t, v }` is mapped to `{ x: new Date(t), y: v }` for Chart.js consumption. The x-axis uses Chart.js `TimeScale` with the `chartjs-adapter-date-fns` adapter.

---

## 5. Interactions

| Interaction                | Condition              | Behaviour                                                        |
|----------------------------|------------------------|------------------------------------------------------------------|
| Hover tooltip              | Always enabled         | Shows value tooltip using Chart.js `Tooltip` plugin. Uses `mode: "index"`, `intersect: false`. |
| Legend toggle               | Multiple series        | Clicking a legend item toggles visibility of the corresponding series. Legend displayed when 2+ series. |
| Wheel zoom                  | `zoom === true`        | Mouse wheel adjusts the time range min/max on the x-axis, zooming in and out. |
| Area auto-fill             | `series.type === "area"` | Automatically sets `fill: true` and applies 0.2 alpha to the background color. |

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

Not implemented. The component renders a complete chart from the full `TimeseriesContent` payload. Incremental updates require a full re-render (the previous `ChartJS` instance is destroyed and recreated on every `data` change).

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the `postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook. The timeseries view registers with `type: "timeseries"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The timeseries view does not embed child views.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None. The component is bundled as a single HTML file via `vite-plugin-singlefile` and requires no external network requests at runtime. All Chart.js code, the date-fns adapter, and assets are inlined.

---

## 9. Size Budget

| Metric       | Target      |
|--------------|-------------|
| Raw          | < 300 KB    |
| Gzip         | < 100 KB    |

The bundle includes Chart.js (line/bar controllers, time scale), chartjs-adapter-date-fns, and date-fns locale support.

---

## 9b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** Placeholder ("Loading time series...") -- Chart.js requires canvas
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

### 11.1 Schema Validation (AJV)

| Test | Description |
|------|-------------|
| TC-S01 | Minimal valid timeseries (single series, single data point) |
| TC-S02 | All optional fields present (title, subtitle, axes, annotations, zoom) |
| TC-S03 | Multiple series accepted |
| TC-S04 | Bar series type accepted |
| TC-S05 | Area series type accepted |
| TC-S06 | Range annotation accepted |
| TC-S07 | Logarithmic y-axis accepted |
| TC-S08 | Rejects missing series |
| TC-S09 | Rejects wrong type field |
| TC-S10 | Rejects wrong version field |
| TC-S11 | Rejects invalid series type (e.g., "scatter") |
| TC-S12 | Rejects invalid y-axis type (e.g., "category") |
| TC-S13 | Rejects invalid annotation type |
| TC-S14 | Rejects data point missing t field |
| TC-S15 | Rejects data point missing v field |
| TC-S16 | Rejects data point with non-numeric v |

### 11.2 Zod Validation

| Test | Description |
|------|-------------|
| TC-Z01 | Minimal valid timeseries |
| TC-Z02 | All optional fields present |
| TC-Z03 | Multiple series with different types |
| TC-Z04 | Range annotation with all fields |
| TC-Z05 | Rejects missing series |
| TC-Z06 | Rejects wrong type |
| TC-Z07 | Rejects wrong version |
| TC-Z08 | Rejects invalid series type |
| TC-Z09 | Rejects data point with missing t |
| TC-Z10 | Rejects data point with non-numeric v |
| TC-Z11 | Rejects invalid annotation type |

---

## Storybook Stories

Story file: `apps/timeseries/src/Timeseries.stories.tsx`

| Story | Description |
|-------|-------------|
| StockPrice | Daily stock prices over 30 days with zoom enabled |
| ServerMetrics | Multi-series CPU/memory with line and range annotations |
| BarTimeseries | Monthly bar chart over a fiscal year |
| AreaChart | Filled area series for inbound/outbound network traffic |
