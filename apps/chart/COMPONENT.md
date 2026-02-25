# Component Spec: @chuk/view-chart

## 1. Identity

| Field       | Value                                                                                         |
|-------------|-----------------------------------------------------------------------------------------------|
| Name        | `@chuk/view-chart`                                                                            |
| Type        | `chart`                                                                                       |
| Version     | `1.0`                                                                                         |
| Category    | Tier 1 -- Universal                                                                           |
| Description | Chart visualization using Chart.js supporting bar, line, scatter, pie, doughnut, area, radar, and bubble chart types. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | Chart.js                                | `^4.4.0`      |
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
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
| `useView` | MCP protocol connection, data, theme, callTool, updateModelContext |
| `useViewEvents` | Cross-view event emission (`emitSelect` on data point click) -- used in `ChartView` only; `ChartRenderer` receives `onEmitSelect` as an optional callback prop |

---

## 3. Schema

### 3.1 Root -- `ChartContent`

```typescript
interface ChartContent {
  type: "chart";
  version: "1.0";
  title?: string;
  subtitle?: string;
  chartType: "bar" | "line" | "scatter" | "pie" | "doughnut" | "area" | "radar" | "bubble";
  data: ChartDataset[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: { position: "top" | "bottom" | "left" | "right" | "none" };
  annotations?: Annotation[];
  interactive?: boolean;
  onClickTool?: ChartClickAction;
}

interface ChartClickAction {
  tool: string;
  arguments?: Record<string, string>;
}
```

### 3.2 `ChartDataset`

```typescript
interface ChartDataset {
  label: string;
  values: DataPoint[];
  color?: string;
  backgroundColor?: string;
  fill?: boolean;
  type?: ChartType;
  borderWidth?: number;
  tension?: number;
}
```

### 3.3 `DataPoint`

```typescript
type DataPoint =
  | number
  | { x: number | string; y: number }
  | { label: string; value: number }
  | { x: number; y: number; r: number };
```

### 3.4 `AxisConfig`

```typescript
interface AxisConfig {
  label?: string;
  type?: "linear" | "logarithmic" | "category" | "time";
  min?: number;
  max?: number;
  stacked?: boolean;
}
```

### 3.5 `Annotation`

```typescript
interface Annotation {
  type: "line" | "label";
  axis?: "x" | "y";
  value?: number | string;
  label?: string;
  color?: string;
}
```

### 3.6 Defaults

| Field                  | Default                                 |
|------------------------|-----------------------------------------|
| `interactive`          | `true`                                  |
| `legend.position`      | `"top"`                                 |
| `xAxis.type`           | `"category"`                            |
| `yAxis.type`           | `"linear"`                              |
| `dataset.borderWidth`  | `2`                                     |
| `dataset.tension`      | `0` (`0.4` for `area` chart type)       |
| `dataset.pointRadius`  | `3` (`4` for `scatter` and `bubble`)    |
| dataset colors         | Cycle through 8 defaults: `#3388ff`, `#ff6384`, `#36a2eb`, `#ffce56`, `#4bc0c0`, `#9966ff`, `#ff9f40`, `#c9cbcf` |

---

## 4. Rendering

### 4.1 Layout

- A single `<canvas>` element fills its container.
- The container has 16 px padding on all sides, uses `box-sizing: border-box`.
- Canvas is centered via flexbox (`align-items: center; justify-content: center`).
- `responsive: true`, `maintainAspectRatio: false` -- the chart scales freely to fill available space without forcing a fixed aspect ratio.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. Falls back to plain text display of raw content. |
| Populated   | Full Chart.js rendering with all configured options.                    |
| Error       | Chart.js errors are not explicitly caught; the component relies on the shared `Fallback` component for graceful degradation. |

### 4.3 Theme

| CSS Custom Property          | Usage                                |
|------------------------------|--------------------------------------|
| `--chuk-font-family`         | Applied to the chart container.      |
| `--chuk-color-background`    | Background color of the chart container. |

### 4.4 Chart Type Mapping

| Schema `chartType` | Chart.js Controller | Notes                                              |
|---------------------|--------------------|----------------------------------------------------|
| `bar`               | `BarController`    | Standard vertical bars.                            |
| `line`              | `LineController`   | Standard line chart.                               |
| `scatter`           | `ScatterController`| Point radius defaults to 4.                        |
| `pie`               | `PieController`    | Labels extracted from data points. No axes.        |
| `doughnut`          | `DoughnutController`| Labels extracted from data points. No axes.       |
| `area`              | `LineController`   | Mapped to `line` with `fill: true`, `tension: 0.4`, and 0.2 alpha background. |
| `radar`             | `RadarController`  | Uses `RadialLinearScale`. No Cartesian axes.       |
| `bubble`            | `BubbleController` | Requires `{ x, y, r }` data points. Point radius defaults to 4. |

---

## 5. Interactions

| Interaction                | Condition                  | Behaviour                                                        |
|----------------------------|----------------------------|------------------------------------------------------------------|
| Hover tooltip              | `interactive !== false`    | Shows value tooltip using Chart.js `Tooltip` plugin. Uses `mode: "index"`, `intersect: false`. |
| Legend toggle               | Legend is visible          | Clicking a legend item toggles visibility of the corresponding dataset. |
| Area auto-fill             | `chartType === "area"`     | Automatically sets `fill: true` and applies 0.2 alpha to the background color. |
| Mixed chart types          | `dataset.type` is set      | Individual datasets can override the root `chartType` to create mixed charts (e.g., bar + line). |
| Per-dataset fill override  | `dataset.fill === true`    | Any dataset can opt into fill mode regardless of root `chartType`. |
| Click data point           | `interactive !== false` and `onClickTool` set | Resolves `{{label}}`, `{{datasetIndex}}`, `{{value}}` templates in `onClickTool.arguments`, then calls `callTool`. Also calls `emitSelect` with the clicked label and pushes model context update. |

---

## 5b. Model Context Updates

On click of a data point, the chart pushes the selected label to the LLM via `updateModelContext`:

```
Chart: user clicked "{label}" in dataset "{datasetLabel}"
```

Where `{label}` is the resolved label of the clicked data point and `{datasetLabel}` is the dataset's `label` field.

---

## 5c. Display Mode

Not applicable. The chart view stays inline-only and does not support `requestDisplayMode()`.

---

## 5d. Cancellation

Default. No special handling beyond the shared Fallback behaviour.

---

## 6. Streaming

Not implemented. The component renders a complete chart from the full `ChartContent` payload. Incremental updates require a full re-render (the previous `ChartJS` instance is destroyed and recreated on every `data` change).

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the `postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook. The chart view registers with `type: "chart"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The chart view does not embed child views.

### 7.3 Cross-View Events

| Direction | Event | Payload | When |
|-----------|-------|---------|------|
| **Emit** | `select` | `[label]` (field: `"label"`) | Data point clicked |

---

## 8. CSP Requirements

None. The component is bundled as a single HTML file via `vite-plugin-singlefile` and requires no external network requests at runtime. All Chart.js code and assets are inlined.

---

## 9. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 250 KB    | 745 KB              |
| Gzip         | --          | 214 KB              |

The overshoot is due to the full Chart.js library being bundled. Chart.js tree-shaking is limited because all eight chart controllers and their associated elements/scales are registered.

---

## 9b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** Placeholder ("Loading chart...") — Chart.js requires canvas
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

# Clean
pnpm clean
```

Output: a single self-contained `dist/mcp-app.html` file (via `vite-plugin-singlefile`).

---

## 11. Test Cases

### 11.1 Schema Validation

#### TC-S01: Minimal valid payload

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    {
      "label": "Sales",
      "values": [10, 20, 30]
    }
  ]
}
```

**Expected:** Renders a bar chart with three bars using the first default color (`#3388ff`). Legend displays "Sales" at the top. No title or subtitle. Tooltips enabled.

#### TC-S02: All optional fields present

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "title": "Revenue Report",
  "subtitle": "Q1 2025",
  "chartType": "line",
  "data": [
    {
      "label": "Revenue",
      "values": [
        { "x": "Jan", "y": 100 },
        { "x": "Feb", "y": 150 },
        { "x": "Mar", "y": 200 }
      ],
      "color": "#22c55e",
      "backgroundColor": "#22c55e",
      "fill": false,
      "borderWidth": 3,
      "tension": 0.3
    }
  ],
  "xAxis": { "label": "Month", "type": "category" },
  "yAxis": { "label": "USD ($)", "type": "linear", "min": 0, "max": 300 },
  "legend": { "position": "bottom" },
  "interactive": true
}
```

**Expected:** Line chart with title "Revenue Report", subtitle "Q1 2025", green line with custom tension, axes labeled, legend at bottom, Y axis clamped 0-300.

#### TC-S03: Invalid type field

```jsonc
{
  "type": "unknown",
  "version": "1.0",
  "chartType": "bar",
  "data": []
}
```

**Expected:** `useView("chart", "1.0")` does not match. Component remains in the empty/fallback state.

#### TC-S04: Missing required `chartType`

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "data": [{ "label": "A", "values": [1] }]
}
```

**Expected:** Chart.js receives `undefined` as the chart type. The component should degrade gracefully (Chart.js will throw; the canvas remains blank or the error boundary catches it).

#### TC-S05: Empty data array

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": []
}
```

**Expected:** Renders an empty chart canvas with no datasets. If a title is provided it should still display.

#### TC-S06: Mixed DataPoint formats in one dataset

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    {
      "label": "Mixed",
      "values": [10, { "label": "B", "value": 20 }, { "x": "C", "y": 30 }]
    }
  ]
}
```

**Expected:** The `normalizeValues` function processes each point individually. Numeric values pass through, `{ label, value }` extracts the value, and `{ x, y }` extracts accordingly. Chart renders without error.

---

### 11.2 Chart Type Rendering

#### TC-R01: Bar chart with labels

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    {
      "label": "Fruit Sales",
      "values": [
        { "label": "Apples", "value": 50 },
        { "label": "Bananas", "value": 30 },
        { "label": "Cherries", "value": 80 }
      ]
    }
  ]
}
```

**Expected:** Three labeled bars on the x-axis ("Apples", "Bananas", "Cherries"). Values on the y-axis.

#### TC-R02: Line chart with numeric values

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "line",
  "data": [
    { "label": "Temperature", "values": [15, 18, 22, 25, 20, 17] }
  ]
}
```

**Expected:** A line with six points. No labels on x-axis (numeric index). Default tension 0 (straight segments).

#### TC-R03: Scatter chart with x/y points

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "scatter",
  "data": [
    {
      "label": "Samples",
      "values": [
        { "x": 1, "y": 5 },
        { "x": 3, "y": 8 },
        { "x": 5, "y": 2 },
        { "x": 7, "y": 9 }
      ]
    }
  ]
}
```

**Expected:** Four scatter points. Point radius is 4. No connecting lines.

#### TC-R04: Pie chart

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "pie",
  "data": [
    {
      "label": "Market Share",
      "values": [
        { "label": "Company A", "value": 45 },
        { "label": "Company B", "value": 30 },
        { "label": "Company C", "value": 25 }
      ]
    }
  ]
}
```

**Expected:** Pie chart with three slices. Each slice uses a color from `DEFAULT_COLORS`. Labels extracted from data points. No axes rendered. White border between slices (`borderColor: "#fff"`).

#### TC-R05: Doughnut chart

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "doughnut",
  "data": [
    {
      "label": "Budget",
      "values": [
        { "label": "Engineering", "value": 40 },
        { "label": "Marketing", "value": 35 },
        { "label": "Operations", "value": 25 }
      ]
    }
  ]
}
```

**Expected:** Doughnut chart (pie with hollow center). Same behavior as pie for colors and labels.

#### TC-R06: Area chart (auto-fill)

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "area",
  "data": [
    {
      "label": "CPU Usage",
      "values": [20, 35, 45, 60, 55, 40, 30]
    }
  ]
}
```

**Expected:** Rendered as a `line` chart with `fill: true`. Background color is the dataset color at 0.2 alpha. Default tension is 0.4 (smooth curves). Area below the line is filled.

#### TC-R07: Radar chart

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "radar",
  "data": [
    {
      "label": "Skills",
      "values": [
        { "label": "Speed", "value": 8 },
        { "label": "Power", "value": 6 },
        { "label": "Accuracy", "value": 9 },
        { "label": "Stamina", "value": 7 },
        { "label": "Agility", "value": 8 }
      ]
    }
  ]
}
```

**Expected:** Radar (spider) chart with five axes. Uses `RadialLinearScale`. No Cartesian axes. Labels placed around the perimeter.

#### TC-R08: Bubble chart

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bubble",
  "data": [
    {
      "label": "Projects",
      "values": [
        { "x": 10, "y": 20, "r": 5 },
        { "x": 30, "y": 40, "r": 10 },
        { "x": 50, "y": 10, "r": 15 }
      ]
    }
  ]
}
```

**Expected:** Three bubbles plotted at (10,20), (30,40), (50,10) with radii 5, 10, 15 respectively. Point radius defaults to 4 but `r` from data controls bubble size.

---

### 11.3 Multi-Dataset and Mixed Charts

#### TC-M01: Multiple datasets on bar chart

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    {
      "label": "2024",
      "values": [
        { "label": "Q1", "value": 100 },
        { "label": "Q2", "value": 150 },
        { "label": "Q3", "value": 130 },
        { "label": "Q4", "value": 180 }
      ]
    },
    {
      "label": "2025",
      "values": [
        { "label": "Q1", "value": 120 },
        { "label": "Q2", "value": 160 },
        { "label": "Q3", "value": 140 },
        { "label": "Q4", "value": 200 }
      ]
    }
  ]
}
```

**Expected:** Two groups of bars per label (Q1-Q4). First dataset uses `#3388ff`, second uses `#ff6384`. Legend shows both labels.

#### TC-M02: Mixed chart types (bar + line)

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    {
      "label": "Revenue",
      "values": [
        { "label": "Jan", "value": 100 },
        { "label": "Feb", "value": 150 },
        { "label": "Mar", "value": 200 }
      ]
    },
    {
      "label": "Trend",
      "values": [
        { "label": "Jan", "value": 110 },
        { "label": "Feb", "value": 140 },
        { "label": "Mar", "value": 190 }
      ],
      "type": "line",
      "tension": 0.3
    }
  ]
}
```

**Expected:** First dataset renders as bars (root `chartType`). Second dataset overrides to render as a line with smooth tension. Both share the same x-axis labels.

#### TC-M03: Stacked bar chart

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    {
      "label": "Product A",
      "values": [{ "label": "Q1", "value": 30 }, { "label": "Q2", "value": 50 }]
    },
    {
      "label": "Product B",
      "values": [{ "label": "Q1", "value": 20 }, { "label": "Q2", "value": 40 }]
    }
  ],
  "xAxis": { "stacked": true },
  "yAxis": { "stacked": true }
}
```

**Expected:** Bars are stacked on top of each other rather than grouped side by side.

---

### 11.4 Axis Configuration

#### TC-A01: Logarithmic y-axis

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "line",
  "data": [
    { "label": "Growth", "values": [1, 10, 100, 1000, 10000] }
  ],
  "yAxis": { "type": "logarithmic", "label": "Scale (log)" }
}
```

**Expected:** Y-axis uses logarithmic scale. Tick marks at powers of 10. Axis label reads "Scale (log)".

#### TC-A02: Axis min/max clamping

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    { "label": "Scores", "values": [45, 67, 89, 34, 78] }
  ],
  "yAxis": { "min": 0, "max": 100, "label": "Score (%)" }
}
```

**Expected:** Y-axis ranges from 0 to 100 exactly, regardless of data values.

---

### 11.5 Legend Configuration

#### TC-L01: Legend at bottom

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [{ "label": "A", "values": [1, 2, 3] }],
  "legend": { "position": "bottom" }
}
```

**Expected:** Legend renders below the chart area.

#### TC-L02: Legend hidden

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [{ "label": "A", "values": [1, 2, 3] }],
  "legend": { "position": "none" }
}
```

**Expected:** No legend is displayed. `display: false` is passed to Chart.js legend plugin.

---

### 11.6 Interaction Tests

#### TC-I01: Tooltips enabled by default

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [{ "label": "A", "values": [10, 20, 30] }]
}
```

**Expected:** Hovering over a bar shows a tooltip with the dataset label and value. Tooltip mode is `"index"` with `intersect: false`.

#### TC-I02: Tooltips disabled

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [{ "label": "A", "values": [10, 20, 30] }],
  "interactive": false
}
```

**Expected:** Hovering over bars does not show tooltips. `tooltip.enabled` is `false`.

#### TC-I03: Legend click toggles dataset

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "line",
  "data": [
    { "label": "Series 1", "values": [1, 2, 3] },
    { "label": "Series 2", "values": [3, 2, 1] }
  ]
}
```

**Expected:** Clicking "Series 1" in the legend hides that dataset. Clicking again restores it. This is default Chart.js behavior.

---

### 11.7 Color and Styling

#### TC-C01: Default color cycling

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    { "label": "A", "values": [1] },
    { "label": "B", "values": [2] },
    { "label": "C", "values": [3] },
    { "label": "D", "values": [4] },
    { "label": "E", "values": [5] },
    { "label": "F", "values": [6] },
    { "label": "G", "values": [7] },
    { "label": "H", "values": [8] },
    { "label": "I", "values": [9] }
  ]
}
```

**Expected:** Datasets A-H use the 8 default colors in order. Dataset I wraps around and uses the first default color (`#3388ff`).

#### TC-C02: Custom color override

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    { "label": "Custom", "values": [10, 20], "color": "#ff0000", "backgroundColor": "#ff000033" }
  ]
}
```

**Expected:** Bars have a red border and semi-transparent red fill, overriding default colors.

#### TC-C03: Pie chart multi-color slices

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "pie",
  "data": [
    {
      "label": "Shares",
      "values": [
        { "label": "A", "value": 40 },
        { "label": "B", "value": 35 },
        { "label": "C", "value": 25 }
      ]
    }
  ]
}
```

**Expected:** Each slice gets a different color from `DEFAULT_COLORS` (the entire array is passed as `backgroundColor` for pie/doughnut charts when no custom `backgroundColor` is set).

---

### 11.8 State and Lifecycle Tests

#### TC-ST01: Loading state (not connected)

**Scenario:** The `useView` hook returns `isConnected: false`.

**Expected:** Renders `<Fallback message="Connecting..." />`. No canvas element in the DOM.

#### TC-ST02: Connected but no data

**Scenario:** `useView` returns `isConnected: true`, `data: null`, `content: "some raw text"`.

**Expected:** Renders `<Fallback content="some raw text" />`. No canvas element in the DOM.

#### TC-ST03: Data update triggers re-render

**Scenario:** The `data` prop changes from one `ChartContent` payload to another.

**Expected:** The previous `ChartJS` instance is destroyed (`chartRef.current.destroy()`). A new chart instance is created with the updated data. No memory leak from orphaned Chart.js instances.

#### TC-ST04: Component unmount cleanup

**Scenario:** The component is removed from the DOM.

**Expected:** The `useEffect` cleanup function calls `chartRef.current?.destroy()` and sets `chartRef.current = null`, preventing memory leaks.

---

### 11.9 Composition Tests

#### TC-COMP01: Embedded in dashboard

**Scenario:** The chart view is loaded inside a dashboard container via an iframe with `postMessage` communication.

**Expected:** The `useView` hook establishes communication with the parent frame. Data is received and the chart renders correctly within the allocated space. `responsive: true` and `maintainAspectRatio: false` ensure the chart fills the container.

#### TC-COMP02: Embedded in split view

**Scenario:** Two chart views side by side in a split container.

**Expected:** Each chart independently connects via `postMessage`, receives its own data, and renders at the size allocated by the split container.

#### TC-COMP03: Embedded in tabs view

**Scenario:** A chart view is placed in a tab that is initially hidden.

**Expected:** When the tab becomes visible, the chart renders correctly. Chart.js handles the initially-zero-size canvas and redraws on resize.

---

### 11.10 Edge Cases

#### TC-E01: Single data point

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [{ "label": "Only One", "values": [42] }]
}
```

**Expected:** A single bar is rendered. Chart does not crash.

#### TC-E02: Large dataset (1000 points)

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "line",
  "data": [{ "label": "Big", "values": [/* 1000 numbers */] }]
}
```

**Expected:** Chart renders without significant lag. Chart.js handles decimation internally.

#### TC-E03: Negative values

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [{ "label": "PnL", "values": [-20, 10, -5, 30, -15] }]
}
```

**Expected:** Bars extend below the zero line for negative values. Y-axis auto-adjusts to include the negative range.

#### TC-E04: All zero values

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "line",
  "data": [{ "label": "Flat", "values": [0, 0, 0, 0] }]
}
```

**Expected:** A flat line at y=0. Y-axis may show a small range around zero. Chart does not crash.

#### TC-E05: Dataset with `type: "area"` override

```jsonc
{
  "type": "chart",
  "version": "1.0",
  "chartType": "bar",
  "data": [
    { "label": "Bars", "values": [10, 20, 30] },
    { "label": "Filled Line", "values": [15, 25, 20], "type": "area" }
  ]
}
```

**Expected:** The second dataset's `type: "area"` is mapped to `"line"` in the Chart.js config. However, the auto-fill and tension defaults for area only apply when `chartType === "area"` at the root level. The dataset-level `type: "area"` override maps to `"line"` but does not automatically set fill or tension unless `fill: true` is explicitly set on the dataset.

## Storybook Stories

Story file: `apps/chart/src/ChartRenderer.stories.tsx`

| Story | Description |
|-------|-------------|
| Bar | Multi-dataset bar chart with axis labels |
| Line | Two sensor datasets over time |
| Pie | 5-slice market share |
| Scatter | 12 height vs weight points |
| Area | Monthly revenue trend with fill |
| Radar | 6-category skill assessment |
