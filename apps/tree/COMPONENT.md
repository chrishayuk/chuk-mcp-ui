# Component Spec: @chuk/view-tree

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-tree`                                                     |
| Type        | `tree`                                                                |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Hierarchical tree explorer with lazy loading, search, and selection.  |

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

### 3.1 Root -- `TreeContent`

```typescript
interface TreeContent {
  type: "tree";
  version: "1.0";
  title?: string;
  roots: TreeNode[];
  selection?: "none" | "single" | "multi";
  searchable?: boolean;
  expandDepth?: number;
  loadChildrenTool?: string;
}
```

### 3.2 `TreeNode`

```typescript
interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  badge?: TreeBadge;
  children?: TreeNode[];
  hasChildren?: boolean;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}
```

### 3.3 `TreeBadge`

```typescript
interface TreeBadge {
  label: string;
  color?: string;
}
```

### 3.4 Defaults

| Field                  | Default              |
|------------------------|----------------------|
| `selection`            | `"none"`             |
| `searchable`           | `false`              |
| `expandDepth`          | `0` (all collapsed)  |
| Node icon (leaf)       | File emoji           |
| Node icon (expanded)   | Open folder emoji    |
| Node icon (collapsed)  | Closed folder emoji  |

---

## 4. Rendering

### 4.1 Layout

- Root container: `h-full flex flex-col font-sans text-foreground bg-background`
- Toolbar: title (left) and search input (right), with bottom border
- Tree area: `ScrollArea` filling remaining space
- Each `TreeNodeRow` is 32px tall, flex horizontal layout
- Indentation: `paddingLeft: depth * 16` pixels
- Indent guides: vertical border lines at each depth level
- Footer: shows selected count when `selection === "multi"`

### 4.2 TreeNodeRow Structure

Each row contains (left to right):
1. **Expand chevron** (16x16): SVG chevron, rotates 90deg when expanded via `transition-transform`. Only shown for expandable nodes.
2. **Checkbox** (multi-select only): `Checkbox` component from `@chuk/view-ui`. Shown before the label when `selection === "multi"`.
3. **Icon**: Emoji or custom icon string. Defaults to folder/file emojis based on node type.
4. **Label**: `text-sm`, `flex-1`, truncated with ellipsis.
5. **Badge**: Small colored pill with label text and optional background color.

### 4.3 States

| State         | Behaviour                                                               |
|---------------|-------------------------------------------------------------------------|
| Loading       | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty         | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated     | Full tree rendering with expand/collapse, selection, and search.        |
| Lazy loading  | Shows a spinner and "Loading..." text in place of children while `loadChildrenTool` is being called. |

### 4.4 Theme

| CSS Custom Property          | Usage                                |
|------------------------------|--------------------------------------|
| `--chuk-font-family`         | Applied to the tree container.       |
| `--chuk-color-background`    | Background color.                    |
| `--chuk-color-text`          | Primary text color.                  |
| `--chuk-color-text-secondary`| Footer text, loading text.           |
| `--chuk-color-border`        | Toolbar border, indent guides.       |
| `--chuk-color-primary`       | Selected row background (10% alpha). |
| `--chuk-color-surface`       | Hover state background (50% alpha).  |

---

## 5. Interactions

### 5.1 User Actions

| Action            | Trigger                          | Result                                                                 |
|-------------------|----------------------------------|------------------------------------------------------------------------|
| Expand/Collapse   | Click chevron button             | Toggles the expanded state of that node. Animates children with `collapseExpand` variants. |
| Select (single)   | Click row                        | Selects the clicked node; deselects any previous selection.            |
| Select (multi)    | Click row or checkbox            | Toggles selection on the clicked node.                                 |
| Search            | Type in search input             | Filters tree to show only matching nodes and their ancestors. Auto-expands ancestor nodes of matches. |
| Lazy load         | Expand node with `hasChildren` but no `children` | Calls `loadChildrenTool` via `callTool` with `{ nodeId }`. Shows loading spinner during the call. |

### 5.2 Server Calls (callServerTool)

Triggered by expanding a node that has `hasChildren: true` but no `children` array, when `loadChildrenTool` is configured.

```typescript
// Configuration
{ "loadChildrenTool": "get-tree-children" }

// Node
{ "id": "lazy-node", "label": "More...", "hasChildren": true }

// Resolved call
callTool("get-tree-children", { nodeId: "lazy-node" })
```

---

## 6. Animation

| Element            | Variant          | Description                              |
|--------------------|------------------|------------------------------------------|
| Toolbar            | `fadeIn`         | Fades in on mount.                       |
| Children container | `collapseExpand` | Animates height between 0 and auto when expanding/collapsing. Uses `AnimatePresence` for exit animations. |
| Chevron            | CSS transform    | Rotates 90deg clockwise when expanded.   |

---

## 7. Streaming

Not implemented. The component renders a complete tree from the full `TreeContent` payload. Incremental updates require a full re-render.

---

## 8. Composition

### 8.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the `postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook. The tree view registers with `type: "tree"` and `version: "1.0"`.

### 8.2 As Parent

Not applicable. The tree view does not embed child views.

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
  "type": "tree",
  "version": "1.0",
  "roots": [{ "id": "root", "label": "Root" }]
}
```

**Expected:** Renders a single root node labeled "Root" with a file icon. No expand chevron (no children). No toolbar, no footer.

#### TC-S02: All optional fields present

```json
{
  "type": "tree",
  "version": "1.0",
  "title": "File Explorer",
  "roots": [{
    "id": "src",
    "label": "src",
    "icon": "\uD83D\uDCC1",
    "badge": { "label": "3 files", "color": "#3b82f6" },
    "hasChildren": true,
    "disabled": false,
    "metadata": { "path": "/src" },
    "children": [{ "id": "app", "label": "App.tsx" }]
  }],
  "selection": "multi",
  "searchable": true,
  "expandDepth": 2,
  "loadChildrenTool": "load-children"
}
```

**Expected:** Toolbar with title "File Explorer" and search input. Root node with folder icon, badge "3 files" in blue, expand chevron. Checkboxes visible on all nodes. Footer shows "0 selected".

#### TC-S03: Invalid type field

```json
{
  "type": "unknown",
  "version": "1.0",
  "roots": []
}
```

**Expected:** `useView("tree", "1.0")` does not match. Component remains in the empty/fallback state.

#### TC-S04: Missing required roots field

```json
{
  "type": "tree",
  "version": "1.0"
}
```

**Expected:** Schema validation fails. Component degrades gracefully.

#### TC-S05: Empty roots array

```json
{
  "type": "tree",
  "version": "1.0",
  "roots": []
}
```

**Expected:** Renders an empty tree area. If title is provided, toolbar still shows.

---

### 12.2 Recursive Nesting

#### TC-R01: Deeply nested tree (4 levels)

```json
{
  "type": "tree",
  "version": "1.0",
  "roots": [{
    "id": "a",
    "label": "A",
    "children": [{
      "id": "b",
      "label": "B",
      "children": [{
        "id": "c",
        "label": "C",
        "children": [{ "id": "d", "label": "D" }]
      }]
    }]
  }]
}
```

**Expected:** Four levels of indentation, each 16px deeper. All nodes initially collapsed (expandDepth defaults to 0). Expanding each level reveals the next.

---

### 12.3 Selection

#### TC-SEL01: Single selection

**Scenario:** `selection: "single"`, click node A, then click node B.

**Expected:** Node A gets `bg-primary/10` on click. When B is clicked, A is deselected and B becomes selected.

#### TC-SEL02: Multi selection

**Scenario:** `selection: "multi"`, click nodes A, B, C.

**Expected:** All three nodes become selected. Checkboxes shown. Footer shows "3 selected".

#### TC-SEL03: Deselect in multi mode

**Scenario:** `selection: "multi"`, click node A twice.

**Expected:** First click selects A, second click deselects A. Footer updates accordingly.

#### TC-SEL04: Disabled node

**Scenario:** Node has `disabled: true`, click on it.

**Expected:** Node appears at 50% opacity. Click has no effect on selection.

---

### 12.4 Expand/Collapse

#### TC-EX01: Auto-expand to depth

**Scenario:** `expandDepth: 2` with a 3-level tree.

**Expected:** On mount, first two levels of nodes with children are expanded. Third level remains collapsed.

#### TC-EX02: Manual expand/collapse

**Scenario:** Click chevron on a collapsed node.

**Expected:** Children animate in via `collapseExpand` variant. Chevron rotates 90deg.

#### TC-EX03: Collapse expanded node

**Scenario:** Click chevron on an expanded node.

**Expected:** Children animate out. Chevron rotates back to 0deg.

---

### 12.5 Search

#### TC-SRCH01: Search filters nodes

**Scenario:** `searchable: true`, type "app" into search.

**Expected:** Only nodes with "app" in their label are visible, along with their ancestor nodes. Ancestors are auto-expanded.

#### TC-SRCH02: Clear search restores tree

**Scenario:** Clear the search input after filtering.

**Expected:** All nodes become visible again. Expand state returns to what it was before search.

---

### 12.6 Lazy Loading

#### TC-LL01: Expand lazy node

**Scenario:** Node has `hasChildren: true` but no `children`. `loadChildrenTool: "get-children"`.

**Expected:** Clicking the expand chevron shows a loading spinner. Calls `onCallTool("get-children", { nodeId: "..." })`.

#### TC-LL02: Lazy loading in pure renderer mode

**Scenario:** `TreeRenderer` used without `onCallTool` (e.g., Storybook).

**Expected:** Expanding a lazy node simply expands it. No crash. No spinner if there is no tool to call.

---

### 12.7 Composition

#### TC-COMP01: Embedded in dashboard

**Scenario:** The tree view is loaded inside a dashboard container via an iframe.

**Expected:** `useView` establishes communication. Tree renders correctly within the allocated space.

#### TC-COMP02: Embedded in split view

**Scenario:** Tree view alongside another view in a split container.

**Expected:** Each view independently connects. Tree fills its allocated space with scrolling.

---

### 12.8 Edge Cases

#### TC-E01: Single root, no children

```json
{
  "type": "tree",
  "version": "1.0",
  "roots": [{ "id": "solo", "label": "Lonely Node" }]
}
```

**Expected:** Single row rendered. No chevron. File icon displayed.

#### TC-E02: Node with badge but no color

```json
{
  "type": "tree",
  "version": "1.0",
  "roots": [{ "id": "a", "label": "A", "badge": { "label": "new" } }]
}
```

**Expected:** Badge rendered with default text styling. No colored background.

#### TC-E03: Many root nodes (100+)

**Expected:** Scrollable tree area. Performance remains acceptable with virtualized rendering via ScrollArea.

#### TC-E04: Node with special characters in label

```json
{
  "type": "tree",
  "version": "1.0",
  "roots": [{ "id": "a", "label": "<script>alert('xss')</script>" }]
}
```

**Expected:** Label rendered as text, not HTML. No script execution. React's default escaping handles this.

---

## 13. Storybook Stories

Story file: `apps/tree/src/Tree.stories.tsx`

| Story      | Description                                                                  |
|------------|------------------------------------------------------------------------------|
| FileSystem | Nested directory tree (3 levels: src > components > *.tsx), file/folder icons, single select, expandDepth 1 |
| OrgChart   | Organization tree (CEO > VPs > teams), badges for department/headcount, expandDepth 2 |
| Taxonomy   | Multi-select product categories with checkboxes, search enabled, badges for item counts |
