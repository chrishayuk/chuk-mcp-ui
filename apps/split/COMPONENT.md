# @chuk/view-split

## Identity
- **Name:** @chuk/view-split
- **Type:** split
- **Version:** 1.0
- **Category:** Tier 2 — Composition
- **Description:** Two-panel composition View with configurable direction and ratio for side-by-side or stacked child Views.

## Dependencies
- **Runtime:** React 18
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |
| `ViewBusProvider` | Provides message bus context for child views |
| `useViewBusContainer` | Manages iframe-to-iframe message routing |

## Schema
```typescript
interface SplitContent {
  type: "split";
  version: "1.0";
  direction?: "horizontal" | "vertical";
  ratio?: string;
  left: SplitPanel;
  right: SplitPanel;
}

interface SplitPanel {
  label?: string;
  viewUrl: string;
  structuredContent: unknown;
}
```

## Defaults
| Field | Default |
|-------|---------|
| direction | `"horizontal"` |
| ratio | `"50:50"` |

## Rendering
- Two panels in flex layout
- Ratio parsed from "N:M" string to flex values
- Each panel: optional label header + iframe
- Sends structuredContent via postMessage on load

## Interactions
| Action | Trigger | Result |
|--------|---------|--------|
| Panel loaded | iframe onLoad | postMessage structuredContent to child |

## Model Context Updates

None.

## Display Mode

Not applicable. The view stays inline-only.

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

## Composition
- **As Child:** Can be embedded in dashboard/tabs
- **As Parent:** Two child Views via iframes

### Cross-View Events

None.

## CSP
Depends on child Views.

## Size Budget
Target: < 150KB. Actual: 691 KB / 191 KB gzip (includes Tailwind CSS + shadcn/ui)

## SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `Split` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

## Test Cases

### Schema Validation
- MUST reject payload missing required `left` panel
- MUST reject payload missing required `right` panel
- MUST reject panel missing required `viewUrl`
- MUST accept valid payload with only required fields (left, right with viewUrl)
- MUST accept payload with optional `direction`, `ratio`, and panel `label` fields
- MUST accept ratio strings in "N:M" format (e.g. "30:70", "50:50", "75:25")

### Layout Rendering
- MUST render two panels side-by-side when direction is `"horizontal"`
- MUST render two panels stacked when direction is `"vertical"`
- MUST default to `"horizontal"` when direction is not specified
- MUST parse ratio `"50:50"` into equal flex values
- MUST parse ratio `"30:70"` into proportional flex values (3:7)
- MUST default ratio to `"50:50"` when not specified
- MUST render panel label header when `label` is provided
- MUST omit panel label header when `label` is absent

### Message Delivery
- MUST postMessage structuredContent to left iframe on load
- MUST postMessage structuredContent to right iframe on load
- MUST send the correct structuredContent to each respective panel

### Composition
- MUST render left panel as an iframe with its `viewUrl` as src
- MUST render right panel as an iframe with its `viewUrl` as src
- MUST support being embedded as a child in dashboard or tabs Views
- MUST isolate child Views within their own iframe contexts

## Storybook Stories

Story file: `apps/split/src/Split.stories.tsx`

| Story | Description |
|-------|-------------|
| Horizontal | 60:40 horizontal split |
| Vertical | 50:50 vertical split |
