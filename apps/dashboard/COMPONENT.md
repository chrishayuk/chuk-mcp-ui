# @chuk/view-dashboard

## Identity
- **Name:** @chuk/view-dashboard
- **Type:** dashboard
- **Version:** 1.0
- **Category:** Tier 2 — Composition
- **Description:** Composition View embedding multiple child Views in configurable layouts with cross-View message routing.

## Dependencies
- **Runtime:** React 18
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Schema
```typescript
interface DashboardContent {
  type: "dashboard";
  version: "1.0";
  title?: string;
  layout: "split-horizontal" | "split-vertical" | "grid";
  panels: Panel[];
  gap?: string;
}

interface Panel {
  id: string;
  label?: string;
  viewUrl: string;
  structuredContent: unknown;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
}
```

## Defaults
| Field | Default |
|-------|---------|
| gap | `"8px"` |
| layout | required |
| panel.width | flex: 1 (equal distribution) |

## Rendering
- Optional title bar at top
- Panels in flex layout (horizontal, vertical, or wrapping grid)
- Each panel: optional label header + iframe embedding child View
- Sends structuredContent to children via postMessage on iframe load

## Cross-View Communication
- Children emit messages with `__chuk_panel_id`
- Dashboard broadcasts to all other panels with `__chuk_source_panel` added
- This enables e.g. clicking a row in a datatable to highlight a feature on a map

## Interactions
| Action | Trigger | Result |
|--------|---------|--------|
| Panel loaded | iframe onLoad | postMessage structuredContent to child |
| Child message | message event | Broadcast to all other children |

## Composition
- **As Child:** Can be embedded in other composition Views
- **As Parent:** Manages multiple child Views via iframes

## CSP
Depends on child Views' CSP requirements.

## Size Budget
Target: < 150KB. Actual: 538KB / 142KB gzip

## Test Cases

### Schema Validation
- MUST reject payload missing required `layout` field
- MUST reject payload with empty `panels` array
- MUST reject panel missing required `id` or `viewUrl`
- MUST accept valid payload with all required fields
- MUST accept payload with optional `title`, `gap`, and panel dimension fields

### Layout Rendering
- MUST render panels in a horizontal flex row when layout is `"split-horizontal"`
- MUST render panels in a vertical flex column when layout is `"split-vertical"`
- MUST render panels in a wrapping grid when layout is `"grid"`
- MUST apply custom `gap` value between panels when provided
- MUST default gap to `"8px"` when not specified
- MUST distribute panels equally (flex: 1) when no width is specified
- MUST apply custom `width`, `height`, `minWidth`, `minHeight` when provided on a panel
- MUST render title bar when `title` is provided
- MUST omit title bar when `title` is absent
- MUST render panel label header when `label` is provided on a panel
- MUST omit panel label header when `label` is absent

### Message Routing
- MUST postMessage structuredContent to child iframe on iframe load event
- MUST listen for messages from child iframes
- MUST broadcast child message to all other panels (not back to sender)
- MUST attach `__chuk_source_panel` to broadcasted messages
- MUST NOT broadcast messages from unknown origins

### Composition
- MUST render each panel as an iframe with the panel's `viewUrl` as src
- MUST support being embedded as a child in another composition View
- MUST handle dynamic panel count (1 panel, many panels)
- MUST isolate child Views within their own iframe contexts
