# @chuk/view-swimlane

## Identity

- **Name:** @chuk/view-swimlane
- **Type:** swimlane
- **Version:** 1.0
- **Category:** Tier 3 — Compound
- **Description:** BPMN-style process diagram rendering activities in a lane-by-column grid with status colouring, optional callTool support, and scrollable overflow.

## Dependencies

- **Runtime:** React 18, framer-motion, @chuk/view-shared, @chuk/view-ui
- **Build:** vite, vite-plugin-singlefile, typescript, @tailwindcss/vite
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool |

## Schema

### Input (structuredContent)

```typescript
interface SwimlaneContent {
  type: "swimlane";
  version: "1.0";
  title?: string;
  lanes: SwimlaneLane[];
  columns: SwimlaneColumn[];
  activities: SwimlaneActivity[];
}

interface SwimlaneLane {
  id: string;
  label: string;
  color?: string;
}

interface SwimlaneColumn {
  id: string;
  label: string;
}

interface SwimlaneActivity {
  id: string;
  laneId: string;
  columnId: string;
  label: string;
  description?: string;
  color?: string;
  status?: "pending" | "active" | "completed" | "blocked";
}
```

### Defaults

| Field | Default |
|-------|---------|
| title | `undefined` (title header hidden) |
| lane.color | `undefined` (no colour indicator bar) |
| activity.description | `undefined` (description paragraph hidden) |
| activity.color | `undefined` (no custom border colour) |
| activity.status | `undefined` (no status styling or badge) |

## Rendering

### Layout

Full-height CSS grid with scrollable overflow:

- **Header:** Optional title with bold text and bottom padding.
- **Column headers:** Sticky top row with the first cell empty (lane label column) followed by column labels centred with bottom border.
- **Grid:** `grid-template-columns: 10rem repeat(N, minmax(12rem, 1fr))` where N = number of columns.
- **Lane rows:** Each lane is a grid row. First cell shows lane label with optional colour indicator bar (1px wide rounded pill). Remaining cells contain activity cards for that lane-column intersection.
- **Activity cards:** `Card` components with 4px left border coloured by status. Cards include label, optional description (line-clamped to 2 lines), and optional status badge.

Status colour scheme:
- **pending:** gray left border, gray background tint
- **active:** blue left border, blue background tint
- **completed:** green left border, green background tint
- **blocked:** red left border, red background tint

If `activity.color` is provided and `status` is not set, the custom colour is applied to the left border directly.

Activity lookup: A memoized `Map<laneId, Map<columnId, SwimlaneActivity[]>>` ensures efficient cell rendering.

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | Returns `null` until `data` is available from `useView`. |
| **Populated** | Full grid rendered with lane rows, column headers, and activity cards. |
| **Empty activities** | Grid structure renders with empty cells (minimum 5rem height per cell). |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text via `font-sans` |
| `--chuk-color-text` | Lane labels, activity labels (`text-foreground`) |
| `--chuk-color-text-secondary` | Column headers, descriptions, status badges (`text-muted-foreground`) |
| `--chuk-color-background` | Root container, sticky header background |
| `--chuk-color-surface` | Card backgrounds |
| `--chuk-color-border` | Grid borders, column header borders, lane dividers, cell dividers |
| `--chuk-border-radius` | Card corners |

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Scroll | Scroll within `ScrollArea` | Horizontal and vertical scrolling for large grids |
| Hover activity | Hover over activity card | Card shadow elevates (`hover:shadow-md`) |

### Outbound Events (sendMessage)

None.

### Server Calls (callServerTool)

The View receives `callTool` from `useView` and passes it to the renderer as `onCallTool`. Currently the renderer accepts the prop but does not invoke it in the rendered UI. This is wired for future use (e.g., clicking an activity to trigger a server tool call).

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

When embedded in a composition container (dashboard, split, tabs), the swimlane diagram fills its allocated panel. The CSS grid with `minmax(12rem, 1fr)` columns adapts to available width; horizontal scrolling activates when content overflows.

### As Parent

Not applicable. `view-swimlane` does not embed other Views.

### Cross-View Events

None.

## CSP Requirements

None. Fully self-contained.

## Accessibility

- Column headers use semantic text with `font-semibold` for visual hierarchy.
- Lane labels use `font-semibold` with `whitespace-nowrap` for readability.
- Activity cards use semantic `<span>` elements with appropriate text sizing.
- Status is communicated via both colour (left border) and text label (capitalised status badge), ensuring colour is not the sole indicator.
- Grid cells have minimum height (`min-h-[5rem]`) ensuring usable click/tap targets.
- `ScrollArea` component provides accessible scrollbar controls.
- Lane colour indicators are decorative (supplementary to text labels).

## Size Budget

**Target:** < 150KB gzip (React + framer-motion + app code)

## SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `SwimlaneRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

## Test Cases

- **Schema Validation:** Accepts valid `SwimlaneContent` with lanes, columns, and activities.
- **Schema Validation:** Rejects missing `type`, `lanes`, `columns`, or `activities` fields.
- **Schema Validation:** Accepts unknown additional fields (forward compatibility).
- **Rendering:** Lane labels render in the first column with optional colour indicators.
- **Rendering:** Column headers render sticky at the top of the grid.
- **Rendering:** Activities appear in correct lane-column intersections.
- **Rendering:** Status colours apply correct left-border and background tint.
- **Rendering:** Custom `activity.color` applies when no status is set.
- **Rendering:** Empty cells maintain minimum height.
- **Fallback:** Returns `null` when `data` is absent.

## Storybook Stories

Story file: `apps/swimlane/src/Swimlane.stories.tsx`

| Story | Description |
|-------|-------------|
| SoftwareDelivery | Four-lane (Design, Development, QA, Ops) pipeline with Backlog/In Progress/Review/Done columns and mixed statuses |
| CrossTeamProject | Three-lane (Frontend, Backend, DevOps) tracker with Sprint 1/2/3 columns |
| OrderFulfillment | Three-lane (Sales, Warehouse, Shipping) order process with Received/Processing/Shipped/Delivered columns |
