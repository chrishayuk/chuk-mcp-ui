# Component Spec: @chuk/view-pivot

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-pivot`                                                    |
| Type        | `pivot`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Pivot table View for MCP Apps -- aggregation engine with sortable columns, multiple value fields, and row/column/grand totals. |

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

### 3.1 Root -- `PivotContent`

```typescript
interface PivotContent {
  type: "pivot";
  version: "1.0";
  title?: string;
  data: Record<string, unknown>[];
  rows: string[];
  columns: string[];
  values: PivotValue[];
  sortable?: boolean;
  showTotals?: boolean;
}

interface PivotValue {
  field: string;
  aggregate: "sum" | "count" | "avg" | "min" | "max";
  label?: string;
  format?: "number" | "percent" | "currency";
}
```

### 3.2 Defaults

| Field        | Default                         |
|--------------|---------------------------------|
| `title`      | None (header hidden if omitted) |
| `sortable`   | `false`                         |
| `showTotals` | `false`                         |
| `label`      | `aggregate(field)`              |
| `format`     | `"number"`                      |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 1200px. Optional title header. Scrollable table using `ScrollArea` from `@chuk/view-ui`. Sticky row headers (left-positioned). Fade-in animation via framer-motion.

### 4.2 Pivot Aggregation Engine

The pivot engine operates in three phases:

1. **Group by rows** -- Data records are grouped by the unique combination of all `rows` field values.
2. **Group by columns** -- Within each row group, records are further grouped by the unique combination of all `columns` field values.
3. **Aggregate** -- For each cell (row-group x column-group intersection), the configured aggregate function is applied to the specified value field.

Supported aggregation functions:

| Aggregate | Computation                        |
|-----------|------------------------------------|
| `sum`     | Sum of all values in the group     |
| `count`   | Number of records in the group     |
| `avg`     | Mean of all values in the group    |
| `min`     | Minimum value in the group         |
| `max`     | Maximum value in the group         |

### 4.3 Column Headers

When there is a single value definition, a two-row header structure is used:
- Row 1: Column group labels spanning the value column
- Row 2: Value label repeated per column group

When there are multiple value definitions, a two-row header structure is used:
- Row 1: Column group labels spanning across all value sub-columns
- Row 2: Individual value labels for each sub-column

### 4.4 Value Formatting

| Format     | Rendering                                     |
|------------|-----------------------------------------------|
| `number`   | `toLocaleString()` for thousands separators   |
| `percent`  | Value followed by `%` with 1 decimal place    |
| `currency` | `$` prefix with 2 decimal places              |

### 4.5 Sorting

When `sortable` is `true`, clicking a column header sorts all pivot rows by the aggregated value in that column. Clicking the same header toggles between ascending and descending order. Sort indicators (triangle arrows) appear next to the active sort column.

### 4.6 Totals

When `showTotals` is `true`:
- An extra column group ("Total") is appended showing the row total for each value field
- An extra row ("Total") is appended showing the column total for each value field
- The intersection cell shows the grand total

Totals use bold font weight.

---

## 5. Interactions

### 5.1 User Actions

| Action       | Trigger       | Result                                        |
|--------------|---------------|-----------------------------------------------|
| Sort         | Header click  | Sorts rows by the clicked column's values     |
| Scroll       | Drag          | Horizontal scroll for wide tables via ScrollArea |

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

Not implemented.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

No external resources loaded. All values are computed inline.

---

## 9. Accessibility

- Table uses semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` elements.
- Row headers provide context for each data row.
- Column headers use `aria-sort` when sortable.
- Tabular numbers (`tabular-nums`) for consistent column alignment.
- Sticky row headers remain visible during horizontal scroll.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `PivotRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid PivotContent.
- Accepts pivot with all options (title, sortable, showTotals).
- Accepts all aggregate types (sum, count, avg, min, max).
- Accepts all format types (number, percent, currency).
- Accepts multiple value definitions.
- Rejects missing data, rows, columns, or values.
- Rejects wrong type literal.
- Rejects invalid aggregate value.
- Rejects invalid format value.
- Rejects value missing required field or aggregate.
- Accepts unknown additional fields.

### Rendering

- Pivot engine correctly groups by rows and columns.
- Aggregation produces correct sum, count, avg, min, max.
- Formatted values display correct number, percent, and currency styles.
- Sorting reorders rows by selected column.
- Totals row, column, and grand total appear when showTotals is true.
- Multiple value fields produce sub-column headers.

### Theme

- Uses theme tokens for all colours (background, foreground, muted).

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/pivot/src/Pivot.stories.tsx`

| Story           | Description                                                   |
|-----------------|---------------------------------------------------------------|
| SalesReport     | Region x Quarter pivot with sum revenue, sorting, and totals  |
| EmployeeMetrics | Department x Role with count and avg salary, multiple values  |
| MinimalPivot    | Simple 2x2 pivot with no options                              |
| WithTotals      | Product x Channel with showTotals enabled, multiple values    |
