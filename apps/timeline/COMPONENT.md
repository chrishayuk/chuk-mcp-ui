# Component Spec: @chuk/view-timeline

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-timeline`                                                 |
| Type        | `timeline`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Events timeline View with expandable event cards, severity-coloured dots, group filtering, and date grouping. Displays chronological events along a vertical timeline with optional action buttons and detail key-value pairs. |

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

### 3.1 Root -- `TimelineContent`

```typescript
interface TimelineContent {
  type: "timeline";
  version: "1.0";
  title?: string;
  events: TimelineEvent[];
  groups?: TimelineGroup[];
  orientation?: "vertical" | "horizontal";
}

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  group?: string;
  icon?: string;
  color?: string;
  severity?: "info" | "success" | "warning" | "error";
  tags?: string[];
  action?: TimelineAction;
  details?: TimelineDetail[];
}

interface TimelineGroup {
  id: string;
  label: string;
  color?: string;
}

interface TimelineAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}

interface TimelineDetail {
  label: string;
  value: string;
}
```

### 3.2 Defaults

| Field         | Default                                 |
|---------------|-----------------------------------------|
| `title`       | None (header hidden if absent)          |
| `severity`    | `"info"`                                |
| `orientation` | `"vertical"`                            |
| `groups`      | No filtering when absent                |

---

## 4. Rendering

### 4.1 Layout

Root container: `h-full flex flex-col font-sans text-foreground bg-background`. Header section with title and group filter badges. ScrollArea for the timeline body. Central vertical line with positioned event cards.

### 4.2 Timeline Line

A `border-l-2 border-border` vertical line positioned at `left: 17px` running the full height of the timeline content area. Event dots are positioned on this line.

### 4.3 Date Group Headers

When events span multiple months, bold uppercase date group headers (`text-xs font-bold uppercase tracking-wider text-muted-foreground`) appear above each month's events.

### 4.4 Event Cards

Each event renders as a Card positioned to the right of the timeline dot:

- **Dot**: 12px circle on the timeline line, coloured by severity (info=blue, success=green, warning=amber, error=red) or custom `color`. Has a ring effect using severity colour at 30% opacity.
- **First row**: Optional icon + title (truncated), optional group badge.
- **Date**: Formatted date in `text-xs text-muted-foreground`. Shows date range with en-dash if `endDate` present.
- **Tags**: Rendered as secondary Badges below the date.
- **Expandable**: Click card to expand/collapse. Uses `collapseExpand` animation variant from `@chuk/view-ui/animations`.
  - Description paragraph.
  - Details as key-value rows (label in muted, value in default).
  - Action button (outline variant) at bottom.

### 4.5 Severity Indicators

| Severity  | Dot Colour    | Ring Colour       |
|-----------|---------------|-------------------|
| `info`    | blue-500      | blue-500/30       |
| `success` | emerald-500   | emerald-500/30    |
| `warning` | amber-500     | amber-500/30      |
| `error`   | red-500       | red-500/30        |

### 4.6 Animations

- Root: `fadeIn` variant.
- Event list: `listContainer` + `listItem` stagger animation.
- Expand/collapse: `collapseExpand` variant with `AnimatePresence`.

---

## 5. Interactions

### 5.1 User Actions

| Action          | Trigger               | Result                                         |
|-----------------|-----------------------|------------------------------------------------|
| Toggle expand   | Click event card      | Expands/collapses description, details, action |
| Filter group    | Click group badge     | Toggles group visibility in timeline           |
| Invoke action   | Click action button   | Calls `callTool` with action's tool and args   |

### 5.2 State

| State           | Type              | Default                        |
|-----------------|-------------------|--------------------------------|
| `expandedIds`   | `Set<string>`     | Empty set                      |
| `visibleGroups` | `Set<string>`     | All group IDs                  |

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

Not implemented.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

No external resources loaded. Action buttons invoke MCP tools via `callTool`.

---

## 9. Accessibility

- Event cards are clickable with cursor-pointer indication.
- Severity conveyed by both colour dot and visual ring.
- Group filter badges provide clear active/inactive visual states.
- Tags and details use semantic text hierarchy.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `TimelineRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts valid TimelineContent with events array.
- Accepts all severity values.
- Accepts both orientation values.
- Accepts optional title, groups, details, action, tags.
- Rejects missing events.
- Rejects event missing id, title, or date.
- Rejects invalid severity value.
- Rejects group missing id or label.
- Rejects wrong type.

### Rendering

- Timeline line renders full height.
- Events render with correct severity dots.
- Date group headers appear for multi-month timelines.
- Expand/collapse toggles detail visibility.
- Group filter badges toggle event visibility.
- Action buttons invoke callTool.
- Tags render as badges.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/timeline/src/Timeline.stories.tsx`

| Story           | Description                                                        |
|-----------------|--------------------------------------------------------------------|
| ProjectHistory  | 8 events across 3 months, mixed severities, expandable details     |
| HeritageSurvey  | 6 events with 3 groups (Fieldwork, Analysis, Publication), actions |
| SystemIncidents | 5 error/warning events with severity colours and tags              |
