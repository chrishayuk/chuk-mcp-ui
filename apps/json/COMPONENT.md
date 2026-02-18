# Component Spec: @chuk/view-json

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-json`                                                     |
| Type        | `json`                                                                |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Interactive JSON tree viewer with collapsible nodes, colour-coded type indicators, configurable expand depth, expand/collapse all controls, and optional text search with highlighting. |

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

### 3.1 Root -- `JsonContent`

```typescript
interface JsonContent {
  type: "json";
  version: "1.0";
  data: unknown;
  title?: string;
  expandDepth?: number;
  searchable?: boolean;
}
```

### 3.2 Defaults

| Field         | Default     |
|---------------|-------------|
| `title`       | `undefined` |
| `expandDepth` | `1`         |
| `searchable`  | `false`     |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column. Toolbar at top with title, search input (when searchable), and expand/collapse buttons. Scrollable tree area below with monospace font and indented nesting with left border guides.

### 4.2 Type Colours

| Type     | Colour                    |
|----------|---------------------------|
| String   | emerald-600 (green)       |
| Number   | blue-600                  |
| Boolean  | amber-600                 |
| Null     | muted-foreground (italic) |
| Key      | purple-600                |

### 4.3 Collapsible Nodes

Objects and arrays are collapsible. When collapsed, shows `{...} (N)` or `[...] (N)` with item count. Click to toggle. Expand/Collapse All buttons affect all nodes.

### 4.4 Search

When `searchable: true`, a search input filters and highlights matching string values with `<mark>` tags (yellow background).

---

## 5. Interactions

| Action         | Trigger           | Result                         |
|----------------|-------------------|--------------------------------|
| Toggle node    | Click bracket     | Expand or collapse node.       |
| Expand All     | Click button      | Open all collapsible nodes.    |
| Collapse All   | Click button      | Close all collapsible nodes.   |
| Search         | Type in search    | Highlight matching strings.    |

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

None.

---

## 9. Accessibility

- Tree rendered with semantic indentation.
- Clickable expand/collapse targets are visible text elements.
- Search highlights use `<mark>` element for native styling.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts any data type (object, array, string, number, boolean, null).
- Accepts optional title, expandDepth, searchable.
- Rejects missing data.
- Rejects wrong type.

### Rendering

- Colour codes string, number, boolean, null values.
- Keys render in purple.
- Objects and arrays are collapsible.
- Empty objects/arrays render inline.
- Nesting uses left border guides.

### Interaction

- Expand All opens all nodes.
- Collapse All closes all nodes.
- Search highlights matching values.

---

## 12. Storybook Stories

Story file: `apps/json/src/Json.stories.tsx`

| Story       | Description                                         |
|-------------|-----------------------------------------------------|
| APIResponse | Nested API response with search enabled              |
| DeepNested  | Server configuration with shallow initial expand     |
| MixedTypes  | All JSON types demonstrated                          |
