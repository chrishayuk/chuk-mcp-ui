# Component Spec: @chuk/view-crosstab

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-crosstab`                                                 |
| Type        | `crosstab`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Matrix with conditional formatting View for MCP Apps -- heatmap, inline bars, and percentage display modes with optional row/column totals and cell annotations. |

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

### 3.1 Root -- `CrosstabContent`

```typescript
interface CrosstabContent {
  type: "crosstab";
  version: "1.0";
  title?: string;
  rowHeaders: string[];
  columnHeaders: string[];
  values: number[][];
  formatting?: "none" | "heatmap" | "bars" | "percentage";
  colorScale?: ColorScale;
  showTotals?: boolean;
  annotations?: CrosstabAnnotation[];
}

interface ColorScale {
  min: string;
  max: string;
}

interface CrosstabAnnotation {
  row: number;
  col: number;
  label?: string;
  highlight?: boolean;
}
```

### 3.2 Defaults

| Field        | Default                              |
|--------------|--------------------------------------|
| `title`      | None (header hidden if omitted)      |
| `formatting` | `"none"`                             |
| `colorScale` | `{ min: "#dbeafe", max: "#1e40af" }` |
| `showTotals` | `false`                              |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 900px. Optional title header. Scrollable table using `ScrollArea` from `@chuk/view-ui`. Sticky row headers (left-positioned) and column headers. Fade-in animation via framer-motion.

### 4.2 Formatting Modes

| Mode         | Cell Rendering                                                         |
|--------------|------------------------------------------------------------------------|
| `none`       | Plain numeric values with `toLocaleString()` formatting.               |
| `heatmap`    | Background colour interpolated between `colorScale.min` and `colorScale.max` based on normalised value. Text switches to white when background is dark (t > 0.6). |
| `bars`       | Inline horizontal bar (primary colour) with numeric label. Bar width proportional to normalised value. Minimum cell width 140px. |
| `percentage` | Value shown as percentage of the row total (e.g. `45.0%`).            |

### 4.3 Totals

When `showTotals` is `true`, an extra column and row are appended showing row sums, column sums, and grand total. Totals use bold font weight.

### 4.4 Annotations

Annotations render below the cell value as small muted text. When `highlight` is `true`, the cell receives a primary-colour ring indicator.

---

## 5. Interactions

### 5.1 User Actions

| Action | Trigger | Result                          |
|--------|---------|----------------------------------|
| Scroll | Drag    | Horizontal scroll for wide matrices via ScrollArea. |

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

No external resources loaded. All colours are computed inline.

---

## 9. Accessibility

- Table uses semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` elements.
- Row headers provide context for each data row.
- Heatmap colours are supplemented by visible numeric values.
- Annotations provide additional text context for highlighted cells.
- Tabular numbers (`tabular-nums`) for consistent column alignment.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid CrosstabContent.
- Accepts all formatting values (none, heatmap, bars, percentage).
- Accepts optional title, colorScale, showTotals, annotations.
- Rejects missing rowHeaders, columnHeaders, or values.
- Rejects wrong type literal.
- Rejects invalid formatting value.
- Rejects non-number values in the matrix.
- Accepts annotation without optional label/highlight.

### Rendering

- Heatmap mode applies background colour gradient.
- Bars mode renders inline bars with proportional width.
- Percentage mode shows row-relative percentages.
- Totals row and column appear when showTotals is true.
- Annotations render label text and highlight ring.

### Theme

- Uses theme tokens for all colours (background, foreground, primary, muted).

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/crosstab/src/Crosstab.stories.tsx`

| Story      | Description                                           |
|------------|-------------------------------------------------------|
| Heatmap    | Sales matrix with heatmap colours, totals, and annotations |
| Bars       | Feature usage matrix with inline bar charts           |
| Percentage | Survey responses shown as row-relative percentages    |
