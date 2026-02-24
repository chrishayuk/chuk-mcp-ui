# Component Spec: @chuk/view-treemap

## 1. Identity

| Field       | Value                                                                       |
|-------------|-----------------------------------------------------------------------------|
| Name        | `@chuk/view-treemap`                                                        |
| Type        | `treemap`                                                                   |
| Version     | `1.0`                                                                       |
| Category    | Tier 2 -- Data Visualisation                                                |
| Description | Nested rectangle treemap with squarified layout, drill-down, and tooltips. |

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

## 2b. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

---

## 3. Schema

### 3.1 Root -- `TreemapContent`

```typescript
interface TreemapContent {
  type: "treemap";
  version: "1.0";
  title?: string;
  root: TreemapNode;
  colorField?: string;
  showLabels?: boolean;
  interactive?: boolean;
}
```

### 3.2 `TreemapNode`

```typescript
interface TreemapNode {
  id: string;
  label: string;
  value?: number;
  color?: string;
  children?: TreemapNode[];
  metadata?: Record<string, string>;
}
```

### 3.3 Defaults

| Field         | Default  |
|---------------|----------|
| `showLabels`  | `true`   |
| `interactive` | `true`   |

---

## 4. Rendering

### 4.1 Layout

- Root container: `h-full overflow-auto font-sans text-foreground bg-background`
- Wrapped in `Card` / `CardContent` from `@chuk/view-ui`
- Title rendered as `h2` when present
- Breadcrumb navigation bar shown when drilled down (depth > 1)
- Canvas element fills the remaining space via a `ResizeObserver`
- Canvas uses `devicePixelRatio` scaling for crisp rendering on HiDPI displays

### 4.2 Squarified Treemap Algorithm

The layout uses the Bruls/Huizing/van Wijk squarified treemap algorithm:

1. Children of the current root are sorted and assigned areas proportional to their values.
2. Rectangles are placed in rows that minimise the worst aspect ratio.
3. Each rectangle is filled with the node's colour (or a palette colour) and outlined with a 1px white border.
4. Labels are drawn inside rectangles when `showLabels` is true and the rectangle is large enough (width > 30px, height > 18px).
5. Values are drawn below labels when height permits (> 36px).
6. Text colour automatically contrasts with the background (white on dark, dark on light).

### 4.3 States

| State         | Behaviour                                                              |
|---------------|------------------------------------------------------------------------|
| Loading       | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty         | Renders `<Fallback content={content} />` when connected but `data` is `null`.  |
| Populated     | Full treemap rendering with drill-down, tooltips, and breadcrumbs.    |
| Drilled down  | Shows children of the selected node; breadcrumbs allow navigation back. |

### 4.4 Theme

| CSS Custom Property          | Usage                                   |
|------------------------------|-----------------------------------------|
| `--chuk-font-family`         | Applied to the container.               |
| `--chuk-color-background`    | Background colour.                      |
| `--chuk-color-text`          | Primary text colour.                    |
| `--chuk-color-text-secondary`| Tooltip secondary text, breadcrumbs.    |
| `--chuk-color-border`        | Card border.                            |

---

## 5. Interactions

### 5.1 User Actions

| Action          | Trigger                          | Result                                                            |
|-----------------|----------------------------------|-------------------------------------------------------------------|
| Hover           | Mouse over a rectangle           | Highlight border; show tooltip with label, value, and metadata.   |
| Drill down      | Click a rectangle with children  | Re-roots the treemap to show that node's children. Breadcrumbs update. |
| Navigate back   | Click a breadcrumb button        | Returns to the corresponding ancestor level.                      |

### 5.2 Server Calls

None. This is a pure visualisation component with no server-side tool calls.

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

## 6. Animation

| Element   | Variant  | Description                          |
|-----------|----------|--------------------------------------|
| Container | `fadeIn` | Fades in on mount via framer-motion. |

---

## 7. Streaming

Not implemented. The component renders a complete treemap from the full `TreemapContent` payload.

---

## 8. Composition

### 8.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the `postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook. The treemap view registers with `type: "treemap"` and `version: "1.0"`.

### 8.2 As Parent

Not applicable. The treemap view does not embed child views.

### 8.3 Cross-View Events

None.

---

## 9. CSP Requirements

None. The component is bundled as a single HTML file via `vite-plugin-singlefile` and requires no external network requests at runtime. All rendering is done via Canvas API.

---

## 10. Size Budget

| Metric       | Target      |
|--------------|-------------|
| Raw          | < 150 KB    |
| Gzip         | < 45 KB     |

---

## 10b. SSR Entry

- **File:** `apps/treemap/src/ssr-entry.tsx`
- **Renders:** `TreemapRenderer` via `renderToString`
- **Config:** `apps/treemap/vite.config.ssr.ts`
- **Output:** `apps/treemap/dist-ssr/ssr-entry.js`

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
  "type": "treemap",
  "version": "1.0",
  "root": { "id": "root", "label": "Root" }
}
```

**Expected:** Renders a single rectangle filling the entire canvas. No breadcrumbs shown.

#### TC-S02: All optional fields present

```json
{
  "type": "treemap",
  "version": "1.0",
  "title": "Disk Usage",
  "root": {
    "id": "root",
    "label": "Root",
    "value": 100,
    "color": "#3b82f6",
    "metadata": { "path": "/root" },
    "children": [
      { "id": "child1", "label": "Child 1", "value": 60 },
      { "id": "child2", "label": "Child 2", "value": 40 }
    ]
  },
  "colorField": "category",
  "showLabels": true,
  "interactive": true
}
```

**Expected:** Two rectangles drawn proportional to their values (60:40 ratio). Title shown above. Labels visible. Hovering shows tooltip. Clicking drills down (though children are leaves).

#### TC-S03: Invalid type field

```json
{
  "type": "unknown",
  "version": "1.0",
  "root": { "id": "a", "label": "A" }
}
```

**Expected:** Schema validation fails. Component remains in fallback state.

#### TC-S04: Missing required root field

```json
{
  "type": "treemap",
  "version": "1.0"
}
```

**Expected:** Schema validation fails.

---

### 12.2 Recursive Nesting

#### TC-R01: Deeply nested tree (4 levels)

```json
{
  "type": "treemap",
  "version": "1.0",
  "root": {
    "id": "a", "label": "A",
    "children": [{
      "id": "b", "label": "B",
      "children": [{
        "id": "c", "label": "C",
        "children": [{ "id": "d", "label": "D", "value": 10 }]
      }]
    }]
  }
}
```

**Expected:** First level shows one rectangle for "B". Click to drill into "B" shows "C". Click to drill into "C" shows "D". Breadcrumbs show full path.

---

### 12.3 Drill-Down

#### TC-DD01: Drill into child with children

**Scenario:** Click on a rectangle whose node has children.

**Expected:** Treemap re-roots to show that node's children. Breadcrumbs update to show the path.

#### TC-DD02: Navigate back via breadcrumb

**Scenario:** Drill two levels deep, then click the root breadcrumb.

**Expected:** Treemap returns to the root level. Breadcrumb bar shows only the root (or disappears).

#### TC-DD03: Click leaf node

**Scenario:** Click on a rectangle whose node has no children.

**Expected:** Nothing happens. The treemap remains at the current level.

---

### 12.4 Tooltip

#### TC-TT01: Hover shows label and value

**Scenario:** Hover over a rectangle.

**Expected:** Tooltip appears near the cursor showing the node's label, computed value, and any metadata entries.

#### TC-TT02: Hover with metadata

**Scenario:** Hover over a node with `metadata: { "ticker": "AAPL" }`.

**Expected:** Tooltip shows "ticker: AAPL" in addition to label and value.

---

### 12.5 Edge Cases

#### TC-E01: Single root with no children

**Expected:** One rectangle fills the entire canvas. No breadcrumbs.

#### TC-E02: Node with zero value

**Expected:** Node receives zero area and is not visible. Other nodes fill the space.

#### TC-E03: showLabels disabled

**Expected:** Rectangles drawn without text labels.

#### TC-E04: interactive disabled

**Expected:** Clicking does nothing. No cursor pointer. Tooltips still work.

---

## 13. Storybook Stories

Story file: `apps/treemap/src/Treemap.stories.tsx`

| Story        | Description                                                                            |
|--------------|----------------------------------------------------------------------------------------|
| FileSystem   | Nested directory/file structure with disk usage values, multiple colour groups          |
| MarketCap    | Stock market sectors and companies, 2-level hierarchy with metadata (ticker symbols)   |
| FlatTreemap  | Single level (no children), programming language popularity, custom colours per node    |
| DeepNesting  | 3+ levels deep hierarchy (company > department > team > project), drill-down navigation |
