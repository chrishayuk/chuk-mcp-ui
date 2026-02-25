# @chuk/view-sankey

## Identity

- **Name:** @chuk/view-sankey
- **Type:** sankey
- **Version:** 1.0
- **Category:** Tier 3 — Compound
- **Description:** Sankey flow diagram rendering nodes and weighted links as an SVG with a custom topological layout algorithm, interactive hover highlighting, and tooltips.

## Dependencies

- **Runtime:** React 18, framer-motion, @chuk/view-shared, @chuk/view-ui
- **Build:** vite, vite-plugin-singlefile, typescript, @tailwindcss/vite
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

## Schema

### Input (structuredContent)

```typescript
interface SankeyContent {
  type: "sankey";
  version: "1.0";
  title?: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}
```

### Defaults

| Field | Default |
|-------|---------|
| title | `undefined` (title text hidden) |
| node.color | Cycled from a 16-colour palette (`PALETTE` array) |
| link.color | Inherits from the source node colour |

## Rendering

### Layout

Centred card containing an SVG diagram:

- **Container:** Full-height flex centred with `max-w-[900px]`, padding of 1rem.
- **SVG viewport:** Fixed `viewBox="0 0 800 500"` scaled to container width via `w-full`.
- **Title:** Optional centred text above the SVG within the card.

Layout algorithm (`computeLayout`):
1. **Layer assignment:** Topological longest-path from sources (nodes with no incoming links). Nodes without incoming edges start at layer 0; each downstream node is placed at `max(parent_layer + 1)`.
2. **Node sizing:** Each node's height is proportional to its total value (max of incoming/outgoing link sums). Minimum height of 2px.
3. **Node positioning:** Nodes in each layer column are stacked vertically with `NODE_PAD` (12px) spacing. Layer columns are evenly spaced horizontally across the inner width.
4. **Link paths:** Cubic Bezier curves connecting source node right edge to target node left edge. Link stroke width is proportional to link value relative to source node total.
5. **Node labels:** Text positioned to the left for layer-0 nodes (right-aligned), to the right for all others.

Constants:
- `SVG_WIDTH = 800`, `SVG_HEIGHT = 500`
- `NODE_WIDTH = 18`, `NODE_PAD = 12`
- `MARGIN = { top: 20, right: 20, bottom: 20, left: 20 }`

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | Returns `null` until `data` is available from `useView`. |
| **Populated** | Nodes and links rendered as SVG elements with hover interactivity. |
| **Empty** | If `nodes` is empty, `computeLayout` returns empty arrays; SVG renders with no elements. |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text via `font-sans` |
| `--chuk-color-text` | Node labels, tooltip text (`fill-foreground`) |
| `--chuk-color-text-secondary` | Title text, tooltip detail text (`text-muted-foreground`, `fill-muted-foreground`) |
| `--chuk-color-background` | Root container |
| `--chuk-color-surface` | Card background, tooltip background (`fill-popover`) |
| `--chuk-color-border` | Card border, tooltip border (`stroke-border`) |

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Hover node | `mouseenter` on node rect | Highlights node and all connected links; dims unrelated elements; shows tooltip with node label and total value |
| Leave node | `mouseleave` on node rect | Restores all elements to default opacity; hides tooltip |
| Hover link | `mouseenter` on link path | Highlights link and connected source/target nodes; dims unrelated elements; shows tooltip with `source -> target` and value |
| Leave link | `mouseleave` on link path | Restores all elements to default opacity; hides tooltip |

Hover dimming uses opacity transitions (0.2s ease): highlighted elements at full opacity, dimmed elements at 0.1 (links) or 0.3 (nodes) opacity.

### Outbound Events (sendMessage)

None.

### Server Calls (callServerTool)

None.

### Action Templates

None.

## Model Context Updates

None.

## Display Mode

Not applicable. The View stays inline-only.

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

## Streaming

Not implemented. The View only renders on full `ontoolresult`.

## Composition

### As Child

When embedded in a composition container (dashboard, split, tabs), the sankey diagram fills its allocated panel. The SVG scales proportionally via `viewBox` and `w-full`.

### As Parent

Not applicable. `view-sankey` does not embed other Views.

### Cross-View Events

None.

## CSP Requirements

None. Fully self-contained.

## Accessibility

- SVG has `role="img"` and `aria-label` set to the title (or "Sankey diagram" fallback).
- Node labels are rendered as `<text>` elements within the SVG.
- Tooltip is rendered as SVG elements (not a separate DOM layer).
- Interactive elements (nodes, links) have `cursor: pointer` styling.
- Hover state uses opacity transitions rather than colour-only changes.

## Size Budget

**Target:** < 150KB gzip (React + framer-motion + custom layout algorithm + app code)

## SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `SankeyRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

## Test Cases

- **Schema Validation:** Accepts valid `SankeyContent` with nodes and links.
- **Schema Validation:** Rejects missing `type`, `nodes`, or `links` fields.
- **Schema Validation:** Accepts unknown additional fields (forward compatibility).
- **Rendering:** Nodes render as SVG rects at correct layer positions.
- **Rendering:** Links render as cubic Bezier paths between source and target nodes.
- **Rendering:** Node labels render left-aligned for layer-0 nodes and right-aligned for others.
- **Rendering:** Custom node colours override palette defaults.
- **Rendering:** Empty `nodes` array results in empty SVG (no crash).
- **Rendering:** Title renders centred above diagram when present.
- **Fallback:** Returns `null` when `data` is absent.

## Storybook Stories

Story file: `apps/sankey/src/Sankey.stories.tsx`

| Story | Description |
|-------|-------------|
| EnergyFlow | Three-layer energy flow from sources (solar, wind, gas) through electricity/heat to sectors (residential, commercial, industrial) with custom node colours |
| WebsiteTraffic | Three-layer website funnel from traffic sources through pages to outcomes (purchase, signup, bounce) |
| BudgetAllocation | Three-layer budget flow from revenue streams through departments to expense categories |
