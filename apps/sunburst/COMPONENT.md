# Component Spec: @chuk/view-sunburst

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-sunburst`                                                 |
| Type        | `sunburst`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Radial hierarchical chart View that renders concentric arc rings using pure SVG, with interactive drill-down navigation. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
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

## 3. Schema

### 3.1 Root -- `SunburstContent`

```typescript
interface SunburstContent {
  type: "sunburst";
  version: "1.0";
  title?: string;
  root: SunburstNode;
  showLabels?: boolean;
  interactive?: boolean;
}
```

### 3.2 `SunburstNode`

```typescript
interface SunburstNode {
  id: string;
  label: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}
```

### 3.3 Defaults

| Field         | Default              |
|---------------|----------------------|
| `title`       | `undefined` (not rendered) |
| `showLabels`  | `false`              |
| `interactive` | `true`               |
| Node `value`  | `1` (for leaf nodes without explicit value) |
| Node `color`  | Auto-generated HSL palette based on position and depth |

---

## 4. Rendering

### 4.1 Layout

- SVG with `viewBox="0 0 400 400"`, center at `(200, 200)`.
- Wrapped in a `Card` / `CardContent` from `@chuk/view-ui`.
- Outer wrapper: `motion.div` with `fadeIn` animation.
- Container max-width: `480px`, centered in the viewport.

### 4.2 Sunburst Structure

The chart is composed of concentric rings of arc segments:

- **Depth 0** (root): Not drawn as an arc; represented by the center circle.
- **Depth 1+**: Each node is an annular wedge (arc sector) drawn as an SVG `<path>` using `M`, `A` (arc), `L`, and `Z` commands.
- **Ring sizing**: Inner radius starts at 40px. Each depth level adds 50px of ring width.
- **Angular subdivision**: Each node's children subdivide the parent's angular range proportionally by their computed values.
- **Value computation**: Leaf nodes use their `value` property (default `1`). Interior nodes sum their descendants' values recursively.

### 4.3 Arc Path Generation

The `describeArc(cx, cy, innerR, outerR, startAngle, endAngle)` helper returns an SVG path `d` string for an annular wedge:

1. Move to outer arc start point.
2. Arc to outer arc end point.
3. Line to inner arc end point.
4. Arc back to inner arc start point (counter-sweep).
5. Close path.

Angles are in radians, 0 = 12 o'clock (top), increasing clockwise.

### 4.4 Colors

- If a node has `color` set, that color is used.
- Otherwise, colors cascade from parent or are auto-generated using HSL based on node index and depth.
- Arc fill opacity: 0.85 default, 0.5 for non-hovered arcs when one arc is hovered, 1.0 for the hovered arc.

### 4.5 Center Circle

- White/background-colored circle in the center.
- Displays the currently hovered node's label and value, or the current root's label and value when nothing is hovered.
- Click center circle to navigate back up one level (when drilled down).

### 4.6 Labels

When `showLabels` is `true`, text labels are rendered along arcs for segments wider than the threshold (0.15 radians). Labels are:
- Positioned at the midpoint of the arc (middle radius, middle angle).
- Rotated to follow the radial direction.
- Flipped for readability when they would otherwise be upside down.
- Truncated based on available arc width.

### 4.7 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full sunburst rendering with arcs, center label, and optional text labels. |

### 4.8 Theme

| CSS Custom Property          | Usage                                |
|------------------------------|--------------------------------------|
| `--color-background`         | Container background, center circle fill, arc stroke (separator lines). |
| `--color-foreground`         | Center label text, arc label text.   |
| `--color-muted-foreground`   | Title text, center value text, breadcrumb text. |
| `--color-border`             | Center circle border.                |

---

## 5. Interactions

### 5.1 User Actions

| Action          | Trigger              | Result                                                                 |
|-----------------|----------------------|------------------------------------------------------------------------|
| Hover arc       | Mouse enter on arc   | Hovered arc goes to full opacity, others dim to 0.5. Center label updates to show hovered node's label and value. |
| Click arc       | Click on arc segment | If the clicked node has children: drills down, re-rooting the chart on that node. Children fill the full circle. Breadcrumb trail appears. |
| Click center    | Click center circle  | Navigates back up one level in the drill-down stack.                    |
| Click breadcrumb| Click breadcrumb item| Navigates directly to that ancestor level.                              |
| Reset to root   | Click root breadcrumb| Returns to the original root, clearing the drill-down stack.            |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 6. Animation

| Element         | Variant   | Description                              |
|-----------------|-----------|------------------------------------------|
| Card container  | `fadeIn`  | Fades in on mount.                       |
| Arc opacity     | CSS       | `transition: opacity 0.2s ease` on hover. |

---

## 7. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 8. Composition

### 8.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the `postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook. The sunburst view registers with `type: "sunburst"` and `version: "1.0"`.

### 8.2 As Parent

Not applicable. The sunburst view does not embed child views.

---

## 9. CSP Requirements

None. The component is bundled as a single HTML file via `vite-plugin-singlefile` and requires no external network requests at runtime.

---

## 10. Size Budget

| Metric       | Target      |
|--------------|-------------|
| Raw          | < 200 KB    |
| Gzip         | < 60 KB     |

---

## 11. Build

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

## 12. Test Cases

### 12.1 Schema Validation

#### TC-S01: Minimal valid payload

```json
{
  "type": "sunburst",
  "version": "1.0",
  "root": { "id": "root", "label": "Root" }
}
```

**Expected:** Renders a single center circle with label "Root". No arcs (root has no children).

#### TC-S02: All optional fields present

```json
{
  "type": "sunburst",
  "version": "1.0",
  "title": "My Chart",
  "showLabels": true,
  "interactive": true,
  "root": {
    "id": "root",
    "label": "Root",
    "value": 100,
    "color": "#3b82f6",
    "children": [
      { "id": "a", "label": "A", "value": 60 },
      { "id": "b", "label": "B", "value": 40 }
    ]
  }
}
```

**Expected:** Title "My Chart" above the chart. Two arcs in the first ring, proportional to 60/40 split. Labels displayed on arcs. Center shows "Root" and total value.

#### TC-S03: Invalid type field

```json
{
  "type": "unknown",
  "version": "1.0",
  "root": { "id": "root", "label": "Root" }
}
```

**Expected:** `useView("sunburst", "1.0")` does not match. Component remains in the empty/fallback state.

#### TC-S04: Missing required root field

```json
{
  "type": "sunburst",
  "version": "1.0"
}
```

**Expected:** Schema validation fails. Component degrades gracefully.

#### TC-S05: Root with empty children

```json
{
  "type": "sunburst",
  "version": "1.0",
  "root": { "id": "root", "label": "Root", "children": [] }
}
```

**Expected:** Renders center circle with label "Root". No arc segments.

---

### 12.2 Recursive Nesting

#### TC-R01: Deeply nested hierarchy (4 levels)

```json
{
  "type": "sunburst",
  "version": "1.0",
  "root": {
    "id": "a", "label": "A",
    "children": [{
      "id": "b", "label": "B",
      "children": [{
        "id": "c", "label": "C",
        "children": [{
          "id": "d", "label": "D", "value": 10
        }]
      }]
    }]
  }
}
```

**Expected:** Four concentric rings visible (depth 1 through 4). Each ring contains a single arc spanning the full circle.

---

### 12.3 Interactive Drill-Down

#### TC-INT01: Click arc to zoom

**Scenario:** `interactive: true`, click on an arc segment that has children.

**Expected:** Chart re-roots on the clicked node. Its children now fill the full circle. Breadcrumb trail appears below the chart.

#### TC-INT02: Click center to zoom out

**Scenario:** After drilling down, click the center circle.

**Expected:** Chart navigates back one level. Breadcrumb trail updates accordingly.

#### TC-INT03: Click root breadcrumb to reset

**Scenario:** After drilling down 2+ levels, click the root item in the breadcrumb trail.

**Expected:** Chart returns to the original root. Breadcrumb trail disappears.

#### TC-INT04: Non-interactive mode

**Scenario:** `interactive: false`, click on arcs and center.

**Expected:** No drill-down occurs. Hover highlighting still works.

---

### 12.4 Hover

#### TC-HOV01: Hover on arc

**Scenario:** Mouse over an arc segment.

**Expected:** Hovered arc goes to full opacity. Other arcs dim to 0.5 opacity. Center label updates to show hovered node label and value.

#### TC-HOV02: Mouse leave

**Scenario:** Mouse leaves the hovered arc.

**Expected:** All arcs return to 0.85 opacity. Center label returns to showing the current root.

---

### 12.5 Edge Cases

#### TC-E01: Single root, no children

```json
{
  "type": "sunburst",
  "version": "1.0",
  "root": { "id": "solo", "label": "Solo" }
}
```

**Expected:** Only center circle rendered. No arc segments.

#### TC-E02: All leaf values are zero

**Scenario:** Root with children that all have `value: 0`.

**Expected:** No arcs rendered (total value is 0, division would produce zero-width arcs).

#### TC-E03: Node with special characters in label

```json
{
  "type": "sunburst",
  "version": "1.0",
  "root": {
    "id": "root",
    "label": "<script>alert('xss')</script>",
    "children": [{ "id": "a", "label": "A", "value": 1 }]
  }
}
```

**Expected:** Label rendered as text, not HTML. No script execution. React's default escaping handles this.

#### TC-E04: Many children at same level (20+)

**Expected:** All children render as thin arc slices. Colors auto-generated from HSL palette.

---

## 13. Storybook Stories

Story file: `apps/sunburst/src/Sunburst.stories.tsx`

| Story            | Description                                                                  |
|------------------|------------------------------------------------------------------------------|
| FileSystem       | Directory tree as sunburst (src/public/config hierarchy with file sizes as values) |
| BudgetBreakdown  | Department/category/item hierarchy (Engineering/Marketing/Operations/HR with dollar amounts) |
| MinimalSunburst  | Simple 2-level hierarchy with two sections, each having two children         |
| DeepHierarchy    | 4 levels deep taxonomy (Life > Animals/Plants/Fungi > subtypes > species)    |
