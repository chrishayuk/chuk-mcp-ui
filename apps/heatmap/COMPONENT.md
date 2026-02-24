# Component Spec: @chuk/view-heatmap

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-heatmap`                                                  |
| Type        | `heatmap`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Grid heatmap View that renders a color-interpolated matrix with row/column labels, optional annotations, tooltips, and a colour legend bar. |

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

### 3.1 Root -- `HeatmapContent`

```typescript
interface HeatmapContent {
  type: "heatmap";
  version: "1.0";
  title?: string;
  rows: string[];
  columns: string[];
  values: number[][];
  colorScale?: "sequential" | "diverging";
  minColor?: string;
  maxColor?: string;
  midColor?: string;
  showValues?: boolean;
  annotations?: HeatmapAnnotation[];
}

interface HeatmapAnnotation {
  row: number;
  col: number;
  label: string;
}
```

### 3.2 Defaults

| Field        | Default                                     |
|--------------|---------------------------------------------|
| `title`      | `undefined` (not rendered)                  |
| `colorScale` | `"sequential"`                              |
| `minColor`   | `"#ffffff"` (sequential) / `"#3b82f6"` (diverging) |
| `maxColor`   | `"#1e40af"` (sequential) / `"#ef4444"` (diverging) |
| `midColor`   | `"#ffffff"`                                 |
| `showValues` | `false`                                     |
| `annotations`| `undefined` (none rendered)                 |

---

## 4. Rendering

### 4.1 Layout

CSS Grid layout inside a Card wrapper with max-width 900px. The grid template has an auto-sized first column for row headers, followed by `1fr` columns for each data column. Column headers render at the top, row headers on the left with sticky positioning. Each cell is a coloured div whose background is computed by linear interpolation between colour stops. A colour legend bar at the bottom shows the gradient from min to max values.

### 4.2 Colour Interpolation

- **Sequential**: Linear interpolation from `minColor` to `maxColor`.
- **Diverging**: Two-segment interpolation -- `minColor` to `midColor` for `t <= 0.5`, `midColor` to `maxColor` for `t > 0.5`.

### 4.3 Auto-Contrast Text

Text colour is automatically computed based on perceived brightness of the cell background using the formula `(R*299 + G*587 + B*114) / 1000`. White text is used on dark backgrounds (brightness < 128), dark text on light backgrounds.

### 4.4 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full heatmap grid with headers, cells, tooltips, and legend.            |

### 4.5 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Default text colour, hover ring colour.          |
| `--color-background`         | Container background, sticky row-header bg.      |
| `--color-muted-foreground`   | Row/column header text, legend min/max text.     |

---

## 5. Interactions

### 5.1 User Actions

| Action       | Behaviour                                                              |
|--------------|------------------------------------------------------------------------|
| Hover cell   | Shows tooltip with row name, column name, and value. Adds ring highlight. |
| (display)    | `showValues=true` renders numeric value centred in each cell.          |

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

Works inside dashboard, split, and tabs containers. Suited for analytics dashboards showing correlation matrices, time-based patterns, or confusion matrices.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- Grid uses ARIA `role="grid"`, `role="columnheader"`, `role="rowheader"`, and `role="gridcell"` attributes.
- Each cell has an `aria-label` describing its row, column, and value.
- Values formatted with `toLocaleString()` for locale-aware number display.
- Colour contrast automatically adjusted for text readability.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/heatmap/src/ssr-entry.tsx`
- **Renders:** `HeatmapRenderer` via `renderToString`
- **Config:** `apps/heatmap/vite.config.ssr.ts`
- **Output:** `apps/heatmap/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid HeatmapContent with rows, columns, and values.
- Accepts heatmap with all options.
- Accepts sequential colorScale.
- Accepts diverging colorScale.
- Rejects missing rows.
- Rejects missing columns.
- Rejects missing values.
- Rejects wrong type.
- Rejects invalid colorScale value.
- Rejects non-number values.
- Accepts unknown additional fields.
- Accepts annotation with all fields.
- Rejects annotation without label.
- Accepts multi-row multi-column heatmap.
- Accepts negative and decimal values.
- Accepts showValues as false.
- Rejects missing version.

### Rendering

- Grid cells render with correct interpolated background colours.
- Auto-contrast text switches to white on dark backgrounds.
- Tooltip shows row, column, and value on hover.
- Annotations render as small labels overlaid on cells.
- showValues displays numeric values inside cells.
- Colour legend bar shows gradient with min/max labels.
- Sequential and diverging colour scales produce correct gradients.

### Theme

- Uses theme tokens for all non-data colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/heatmap/src/Heatmap.stories.tsx`

| Story             | Description                                                            |
|-------------------|------------------------------------------------------------------------|
| TemperatureGrid   | 7-day x 24-hour hourly temperature matrix with sequential scale        |
| ConfusionMatrix   | ML classification confusion matrix with diverging scale and values     |
| ActivityHeatmap   | GitHub-style 12-week x 7-day contribution activity grid                |
| WithAnnotations   | Server response time matrix with annotated cells and values shown      |
