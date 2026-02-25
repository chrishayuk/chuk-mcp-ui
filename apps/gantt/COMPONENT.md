# Component Spec: @chuk/view-gantt

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-gantt`                                                    |
| Type        | `gantt`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 3 -- Compound (Phase 6)                                          |
| Description | SVG Gantt chart with task bars, progress indicators, group headers, dependency arrows, date column headers, and hover tooltips. |

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

### 4.1 Root -- `GanttContent`

```typescript
interface GanttContent {
  type: "gantt";
  version: "1.0";
  title?: string;
  tasks: GanttTask[];
  startDate?: string;
  endDate?: string;
}

interface GanttTask {
  id: string;
  label: string;
  start: string;
  end: string;
  progress?: number;
  color?: string;
  dependencies?: string[];
  group?: string;
}
```

### 4.2 Defaults

| Field          | Default                                       |
|----------------|-----------------------------------------------|
| `title`        | `undefined` (not rendered)                    |
| `startDate`    | `undefined` (auto-computed from earliest task)|
| `endDate`      | `undefined` (auto-computed from latest task)  |
| `progress`     | `undefined` (no progress overlay)             |
| `color`        | Cycles through 10-colour palette by row index |
| `dependencies` | `undefined` (no dependency arrows)            |
| `group`        | `undefined` (no group header)                 |

---

## 5. Rendering

### 5.1 Layout

Full-height flex layout with Card containing a ScrollArea. The chart is split into two regions:

- **Left label column** (180px fixed width): Contains "Task" header, group headers (uppercase, bold, muted background), and task labels. Labels highlight on hover to match the hovered task bar.
- **Right chart area** (scrollable SVG): Date column headers at top with dashed vertical grid lines. Task bars rendered as rounded rectangles (4px radius, 22px height) positioned by date. Progress is shown as a full-opacity section of the bar, with the remaining portion rendered with a white overlay at 25% opacity.

Dependency arrows use horizontal-then-vertical dashed paths with arrowhead polygons, connecting the end of a predecessor task to the start of the dependent task.

Day width adapts to the date range: minimum 24px, maximum 40px. Date headers show every 1, 2, or 7 days depending on available space.

### 5.2 Tooltip

On hover over a task bar, a tooltip rectangle appears above the bar showing task label, date range, and optional progress percentage.

### 5.3 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `null` while `data` is not available.                           |
| Empty       | Chart renders with 14-day range at max day width, no task bars.         |
| Populated   | Full Gantt chart with bars, groups, dependencies, and date headers.     |

### 5.4 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--chuk-font-family`         | All text in chart.                               |
| `--chuk-color-background`    | Page background.                                 |
| `--chuk-color-text`          | Task bar labels, tooltip label text.             |
| `--chuk-color-text-secondary`| Date headers, group headers, tooltip dates.      |
| `--chuk-color-surface`       | Card surface, tooltip background (`fill-popover`).|
| `--chuk-color-border`        | Grid lines, tooltip border, label column border. |

---

## 6. Interactions

### 6.1 User Actions

| Action          | Trigger                     | Result                                    |
|-----------------|-----------------------------|-------------------------------------------|
| Hover task bar  | Mouse enter on SVG bar      | Row highlight, tooltip appears, label highlights |
| Leave task bar  | Mouse leave on SVG bar      | Tooltip and highlights clear              |
| Scroll chart    | Horizontal scroll in chart  | Pans the date axis                        |

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

Works inside dashboard, split, and tabs containers. Particularly suited for project management dashboards alongside timeline and status views.

### 11.2 As Parent

Not applicable.

### 11.3 Cross-View Events

None.

---

## 12. CSP Requirements

None.

---

## 13. Accessibility

- SVG has `role="img"` and `aria-label` set to title or fallback "Gantt chart".
- Task bars have cursor pointer indicating interactivity.
- Group headers use uppercase tracking for visual hierarchy.
- Date format uses abbreviated month names (e.g., "Mar 15").
- Colour is supplemented by text labels on bars (when bar width > 40px). Task bar label text uses the `fill-primary-foreground` class instead of a hardcoded `fill="#fff"`.

---

## 14. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | < 150 KB    | TBD                 |

---

## 15. SSR Entry

- **File:** `apps/gantt/src/ssr-entry.tsx`
- **Renders:** `GanttRenderer` via `renderToString`
- **Config:** `apps/gantt/vite.config.ssr.ts`
- **Output:** `apps/gantt/dist-ssr/ssr-entry.js`

---

## 16. Test Cases

### Schema Validation

- Accepts minimal valid GanttContent with empty tasks array.
- Accepts gantt with tasks including progress, dependencies, and groups.
- Rejects missing `type` field.
- Rejects missing `tasks` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Task bars render at correct horizontal position based on start/end dates.
- Progress fill covers correct percentage of bar width.
- Dependency arrows draw dashed paths from predecessor end to dependent start.
- Group headers render above grouped tasks with muted background.
- Date headers show abbreviated month and day.
- Tooltip displays task label, date range, and progress on hover.
- Bar labels truncate with ellipsis when bar is narrow.
- Empty tasks array renders chart area with date range but no bars.

### Fallback

- Missing `structuredContent` renders null.
- Wrong `type` field renders fallback.

---

## 17. Storybook Stories

Story file: `apps/gantt/src/Gantt.stories.tsx`

| Story              | Description                                                      |
|--------------------|------------------------------------------------------------------|
| ProjectPlan        | Multi-phase software project with groups, dependencies, progress |
| SprintTimeline     | Two-week sprint with explicit start/end dates and dependencies   |
| WithProgress       | Planning/Execution/Validation phases with varied progress values |
