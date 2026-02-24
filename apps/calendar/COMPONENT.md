# Component Spec: @chuk/view-calendar

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-calendar`                                                 |
| Type        | `calendar`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 3 -- Compound (Phase 6)                                          |
| Description | Calendar View with month grid and agenda list modes, event pills, navigation, and detail popovers. |

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

### 4.1 Root -- `CalendarContent`

```typescript
interface CalendarContent {
  type: "calendar";
  version: "1.0";
  title?: string;
  events: CalendarEvent[];
  defaultView?: "month" | "week" | "agenda";
  defaultDate?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  description?: string;
}
```

### 4.2 Defaults

| Field          | Default                                      |
|----------------|----------------------------------------------|
| `title`        | `undefined` (falls back to formatted month/year) |
| `defaultView`  | `"month"`                                    |
| `defaultDate`  | Current date (`new Date()`)                  |
| `allDay`       | `undefined` (treated as timed event)         |
| `color`        | Cycles through 8-colour palette by index     |
| `end`          | `undefined` (single point event)             |
| `description`  | `undefined` (not shown in popover)           |

---

## 5. Rendering

### 5.1 Layout

Full-height Card with header containing title, view-mode toggle buttons (Today, Month, Agenda), and month navigation (prev/next chevrons with centred month/year label). Content area switches between:

- **Month Grid**: 7-column grid (Sun-Sat headers) with rows for each week. Each cell shows day number (today highlighted with primary circle) and up to 3 event pills. Overflow shows "+N more" text.
- **Agenda List**: Events for the current month grouped by date, each date section showing full date header and event items with colour bar, title, and time range.

An AnimatePresence-wrapped event popover appears centred on screen when an event is clicked, showing colour dot, title, date/time, and description.

### 5.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `null` while `data` is not available.                           |
| Empty       | Month grid with no event pills; agenda shows "No events this month".    |
| Populated   | Full calendar with event pills/items and interactive navigation.        |

### 5.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--chuk-font-family`         | All text in calendar.                            |
| `--chuk-color-background`    | Card and page background.                        |
| `--chuk-color-text`          | Day numbers, event titles.                       |
| `--chuk-color-text-secondary`| Day-of-week headers, time labels, month label.   |
| `--chuk-color-primary`       | Today highlight circle, selected event ring.      |
| `--chuk-color-surface`       | Card surface, popover background.                |
| `--chuk-color-border`        | Grid cell borders, header border.                |
| `--chuk-border-radius`       | Pill corners, popover corners.                   |

---

## 6. Interactions

### 6.1 User Actions

| Action               | Trigger                    | Result                                    |
|----------------------|----------------------------|-------------------------------------------|
| Click event pill     | Click on month grid pill   | Opens event detail popover                |
| Click agenda item    | Click on agenda list item  | Opens event detail popover                |
| Previous month       | Chevron left button        | Navigates to previous month               |
| Next month           | Chevron right button       | Navigates to next month                   |
| Today                | "Today" button             | Navigates to current month                |
| Switch to Month      | "Month" button             | Switches to month grid view               |
| Switch to Agenda     | "Agenda" button            | Switches to agenda list view              |
| Close popover        | Click backdrop or X button | Closes event detail popover               |

### 6.2 Outbound Events (sendMessage)

None.

### 6.3 Server Calls (callServerTool)

None.

### 6.4 Action Templates

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

Works inside dashboard, split, and tabs containers. No special cross-view event handling.

### 11.2 As Parent

Not applicable.

### 11.3 Cross-View Events

None.

---

## 12. CSP Requirements

None.

---

## 13. Accessibility

- Navigation buttons have `aria-label` ("Previous month", "Next month").
- Event pills are `<button>` elements with `title` attribute showing event name.
- Popover close button is keyboard-accessible.
- Today is visually distinguished with primary background circle on day number.
- Colour is supplemented with text labels (event titles always visible).

---

## 14. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | < 150 KB    | TBD                 |

---

## 15. SSR Entry

- **File:** `apps/calendar/src/ssr-entry.tsx`
- **Renders:** `CalendarRenderer` via `renderToString`
- **Config:** `apps/calendar/vite.config.ssr.ts`
- **Output:** `apps/calendar/dist-ssr/ssr-entry.js`

---

## 16. Test Cases

### Schema Validation

- Accepts minimal valid CalendarContent with empty events array.
- Accepts calendar with multiple events including allDay and timed events.
- Rejects missing `type` field.
- Rejects missing `events` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Month grid renders 7-column layout with correct day headers.
- Today cell is highlighted with primary circle.
- Event pills render with correct colour and title text.
- Cells with more than 3 events show "+N more" overflow text.
- Agenda view groups events by date with correct date headers.
- Agenda view shows "No events this month" for empty months.
- Event popover renders title, date, time, and description.

### Fallback

- Missing `structuredContent` renders null.
- Wrong `type` field renders fallback.
- Default date falls back to current date when not specified.

---

## 17. Storybook Stories

Story file: `apps/calendar/src/CalendarRenderer.stories.tsx`

| Story              | Description                                                      |
|--------------------|------------------------------------------------------------------|
| TeamCalendar       | Engineering team month view with standups, sprints, and holidays |
| ProjectMilestones  | All-day milestone events across multiple months                  |
| AgendaView         | Agenda list mode showing March events grouped by date            |
