# Component Spec: @chuk/view-boxplot

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-boxplot`                                                  |
| Type        | `boxplot`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Box-and-whisker plot View that renders pure SVG box plots with IQR boxes, whiskers, median lines, optional mean diamonds, and outlier markers. Supports vertical and horizontal orientations with configurable axis ranges. |

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

### 3.1 Root -- `BoxplotContent`

```typescript
interface BoxplotContent {
  type: "boxplot";
  version: "1.0";
  title?: string;
  groups: BoxplotGroup[];
  orientation?: "vertical" | "horizontal";
  showOutliers?: boolean;
  yAxis?: { label?: string; min?: number; max?: number };
}

interface BoxplotGroup {
  label: string;
  color?: string;
  stats: BoxplotStats;
}

interface BoxplotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  mean?: number;
}
```

### 3.2 Defaults

| Field          | Default                          |
|----------------|----------------------------------|
| `title`        | `undefined` (not rendered)       |
| `orientation`  | `"vertical"`                     |
| `showOutliers` | `true`                           |
| `yAxis`        | `undefined` (auto-range)         |
| `color`        | Cycles through default palette   |

---

## 4. Rendering

### 4.1 Layout

Centered Card with max-width 640px. Pure SVG rendering with computed viewBox. Each group is rendered as a column (vertical) or row (horizontal) with proportional spacing.

**Vertical orientation (default):**
- SVG viewBox `0 0 600 360` with padding: top=40, right=30, bottom=50, left=60.
- Y-axis with tick marks, labels, and dashed grid lines.
- Each group occupies an equal-width band along the x-axis.
- Box (rect) spans Q1 to Q3 with rounded corners and 20% fill opacity.
- Horizontal median line inside the box (2.5px stroke).
- Vertical whisker lines from min to Q1 and Q3 to max.
- Horizontal caps at min and max whisker endpoints.
- Diamond polygon at mean value (if provided).
- Open circles at each outlier position (if showOutliers is true).
- Group labels rendered below the x-axis.
- Y-axis label rotated -90 degrees.

**Horizontal orientation:**
- SVG viewBox `0 0 600 360` with padding: top=40, right=50, bottom=30, left=100.
- X-axis with tick marks, labels, and dashed grid lines.
- Each group occupies an equal-height band along the y-axis.
- Same box/whisker/median/mean/outlier elements, rotated 90 degrees.
- Group labels rendered on the y-axis (left side).
- Value axis label at the bottom center.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full box plot display with all groups, axes, and optional elements.      |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Group labels, axis labels.                       |
| `--color-background`         | Container background.                            |
| `--color-muted`              | Grid lines, axis lines.                          |
| `--color-muted-foreground`   | Title text, tick labels, axis labels.            |

### 4.4 Group Colours

Each group can specify a custom `color`. If omitted, colours cycle through the default palette: `#3388ff`, `#ff6384`, `#36a2eb`, `#ffce56`, `#4bc0c0`, `#9966ff`, `#ff9f40`, `#c9cbcf`. The colour is used for box stroke, box fill (at 20% opacity), whiskers, caps, median line, mean diamond, and outlier circles.

---

## 5. Interactions

### 5.1 User Actions

None. The box plot is display-only.

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

Works inside dashboard, split, and tabs containers. Particularly suited for dashboard grid layouts alongside chart and gauge views.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- SVG has `role="img"` and `aria-label` set to the title or "Box plot".
- Group labels, axis labels, and tick values are rendered as text elements.
- Colours meet WCAG contrast guidelines against both light and dark backgrounds.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/boxplot/src/ssr-entry.tsx`
- **Renders:** `BoxplotRenderer` via `renderToString`
- **Config:** `apps/boxplot/vite.config.ssr.ts`
- **Output:** `apps/boxplot/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation (AJV)

- Accepts minimal valid BoxplotContent with one group.
- Accepts boxplot with all options.
- Accepts horizontal orientation.
- Accepts multiple groups.
- Accepts group with outliers.
- Accepts group with mean.
- Accepts negative values in stats.
- Accepts yAxis with partial options.
- Accepts decimal values.
- Accepts unknown additional fields.
- Rejects missing groups.
- Rejects empty groups array.
- Rejects missing type.
- Rejects missing version.
- Rejects wrong type.
- Rejects invalid orientation.
- Rejects group missing required stats fields.
- Rejects group missing label.
- Rejects non-number in stats.
- Rejects non-number in outliers array.

### Zod Validation

- Accepts minimal valid boxplot.
- Accepts boxplot with all options.
- Accepts horizontal orientation.
- Rejects empty groups array.
- Rejects missing type.
- Rejects missing version.
- Rejects wrong type literal.
- Rejects invalid orientation value.
- Rejects stats missing required field.
- Rejects non-number in stats.

### Rendering

- Vertical box plots render with correct IQR boxes.
- Whiskers extend from min to max.
- Median line renders inside each box.
- Mean diamonds render when mean is provided.
- Outlier circles render when showOutliers is true.
- Horizontal orientation rotates all elements correctly.
- Group labels appear on the correct axis.
- Y-axis label renders and rotates properly.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/boxplot/src/Boxplot.stories.tsx`

| Story               | Description                                                        |
|---------------------|--------------------------------------------------------------------|
| SalaryDistribution  | 4 departments, vertical, salary data in $K                         |
| HorizontalBoxplot   | Same salary data rendered horizontally                             |
| WithOutliers        | 3 services with outlier markers for response time latency          |
| WithMean            | 4 classes with mean diamond markers for test scores                |
