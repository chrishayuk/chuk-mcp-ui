# Component Spec: @chuk/view-graph

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-graph`                                                    |
| Type        | `graph`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 3 -- Compound (Phase 6)                                          |
| Description | Force-directed graph visualization with nodes and edges, supporting directed/undirected graphs, node groups, edge weights, and hover-based highlight. |

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

---

## 3. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

---

## 4. Schema

### 4.1 Root -- `GraphContent`

```typescript
interface GraphContent {
  type: "graph";
  version: "1.0";
  title?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
}

interface GraphNode {
  id: string;
  label: string;
  color?: string;
  size?: number;
  group?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
  color?: string;
}
```

### 4.2 Defaults

| Field          | Default                                       |
|----------------|-----------------------------------------------|
| `title`        | `undefined` (not rendered)                    |
| `directed`     | `false`                                       |
| `color` (node) | Group-based colour from 8-colour palette, or palette by index |
| `size` (node)  | `20` (radius in pixels)                       |
| `group` (node) | `""` (no group)                               |
| `label` (edge) | `undefined` (not rendered)                    |
| `weight` (edge)| `1`                                           |
| `color` (edge) | `undefined` (uses `stroke-muted-foreground`)  |

---

## 5. Rendering

### 5.1 Layout

Full-height Card with optional title header. The content area is measured via `ResizeObserver` (defaults to 800x600). A custom force-directed simulation runs synchronously for 120 iterations on each render:

- **Repulsion**: Coulomb's law between all node pairs (strength 3000).
- **Attraction**: Spring force along edges, scaled by edge weight (strength 0.005).
- **Centre gravity**: Pulls nodes toward the container centre (strength 0.01).
- **Damping**: 0.9 per iteration.
- **Boundary clamping**: Nodes stay within container with padding equal to radius + 10.

Nodes are initialized in a circular layout around the centre, then converge to equilibrium positions.

### 5.2 Edges

SVG `<line>` elements between node positions. For directed graphs, lines are shortened by the target node's radius + 4px and rendered with SVG arrowhead markers. Edge stroke width scales with weight (clamped 1-4px). Optional labels render at the edge midpoint.

### 5.3 Nodes

SVG `<circle>` elements with fill opacity 0.85. Labels render below nodes (offset by radius + 14). On hover, the node circle expands by 3px with a coloured stroke halo.

### 5.4 Hover Highlight

When a node is hovered, only the hovered node and its directly connected neighbours remain at full opacity; all other nodes and edges fade to 20% opacity.

### 5.5 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `null` while `data` is not available.                           |
| Empty       | Empty SVG if nodes array is empty.                                      |
| Populated   | Full force-directed graph with nodes, edges, and labels.                |

### 5.6 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--chuk-font-family`         | Node labels, edge labels.                        |
| `--chuk-color-background`    | Page and card background.                        |
| `--chuk-color-text`          | Node labels (`fill-foreground`).                 |
| `--chuk-color-text-secondary`| Edge stroke and labels (`stroke-muted-foreground`).|
| `--chuk-color-surface`       | Card surface.                                    |

---

## 6. Interactions

### 6.1 User Actions

| Action          | Trigger                     | Result                                    |
|-----------------|-----------------------------|-------------------------------------------|
| Hover node      | Mouse enter on node circle  | Node expands, connected subgraph highlighted, others dimmed |
| Leave node      | Mouse leave on node circle  | All nodes/edges return to full opacity    |

### 6.2 Outbound Events (sendMessage)

None.

### 6.3 Server Calls (callServerTool)

None.

---

## 7. Model Context Updates

None.

---

## 8. Display Mode

Not applicable. The View stays inline-only.

---

## 9. Cancellation

Default. No special handling beyond shared Fallback behaviour.

---

## 10. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 11. Composition

### 11.1 As Child

Works inside dashboard, split, and tabs containers. Responsive to container resizing via ResizeObserver, re-running the force simulation when dimensions change.

### 11.2 As Parent

Not applicable.

### 11.3 Cross-View Events

None.

---

## 12. CSP Requirements

None.

---

## 13. Accessibility

- Node circles have `cursor-pointer` indicating interactivity.
- Node labels provide textual identification for all nodes.
- Edge labels provide relationship context when present.
- Colour is supplemented by labels and positional grouping.
- Hover highlight uses opacity rather than colour-only differentiation.

---

## 14. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | < 150 KB    | TBD                 |

---

## 15. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `GraphRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 16. Test Cases

### Schema Validation

- Accepts minimal valid GraphContent with empty nodes and edges arrays.
- Accepts graph with nodes, edges, groups, and directed flag.
- Rejects missing `type` field.
- Rejects missing `nodes` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Nodes render as circles at simulation-computed positions.
- Node labels render below each node.
- Edge lines connect correct source and target nodes.
- Directed graph renders arrowhead markers on edges.
- Undirected graph renders edges without arrowheads.
- Edge labels render at midpoints between connected nodes.
- Edge stroke width scales with weight (clamped 1-4).
- Group-based colouring assigns same colour to nodes in same group.
- Hover highlight dims unconnected nodes and edges to 20% opacity.

### Fallback

- Missing `structuredContent` renders null.
- Wrong `type` field renders fallback.

---

## 17. Storybook Stories

Story file: `apps/graph/src/GraphRenderer.stories.tsx`

| Story              | Description                                                      |
|--------------------|------------------------------------------------------------------|
| SocialNetwork      | Undirected social graph with 4 groups and weighted edges         |
| DependencyGraph    | Directed package dependency graph with custom node colours       |
| KnowledgeGraph     | Directed knowledge graph of programming languages with edge labels|
