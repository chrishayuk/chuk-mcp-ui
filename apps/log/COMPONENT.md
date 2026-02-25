# Component Spec: @chuk/view-log

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-log`                                                      |
| Type        | `log`                                                                 |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Streaming log viewer View with level filtering, search, auto-scroll, and expandable metadata. Displays timestamped log entries colour-coded by severity level. |

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

### 3.1 Root -- `LogContent`

```typescript
interface LogContent {
  type: "log";
  version: "1.0";
  title?: string;
  entries: LogEntry[];
  levels?: LogLevel[];
  searchable?: boolean;
  autoScroll?: boolean;
  maxEntries?: number;
  showTimestamp?: boolean;
  monospace?: boolean;
}

interface LogEntry {
  id?: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
```

### 3.2 Defaults

| Field           | Default     |
|-----------------|-------------|
| `title`         | `undefined` (no title shown) |
| `levels`        | All levels visible |
| `searchable`    | `false`     |
| `autoScroll`    | `true`      |
| `showTimestamp`  | `true`      |
| `monospace`     | `false`     |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column. Toolbar at top with title, level filter buttons, search input, clear button, and auto-scroll toggle. Scrollable log area in the centre. Footer with entry count and pause/resume indicator.

### 4.2 Level Colours

| Level   | Text Colour      | Background         |
|---------|------------------|--------------------|
| `debug` | `text-gray-500`  | `bg-gray-500/10`   |
| `info`  | `text-blue-500`  | `bg-blue-500/10`   |
| `warn`  | `text-amber-500` | `bg-amber-500/10`  |
| `error` | `text-red-500`   | `bg-red-500/10`    |
| `fatal` | `text-purple-500`| `bg-purple-500/10` |

### 4.3 Entry Row

Each row displays: `[timestamp] [LEVEL] [source] message`

- Timestamp: `text-xs text-muted-foreground`
- Level: coloured inline span with small background pill
- Source: `text-xs text-muted-foreground` in square brackets
- Message: `text-sm` with word wrap
- Even rows get `bg-muted/30` for alternating backgrounds

### 4.4 Auto-scroll

When enabled, the view scrolls to bottom on new entries. Scrolling up pauses auto-scroll. A "Paused" button in the footer resumes scrolling when clicked.

### 4.5 Search

When `searchable` is true, a search input appears in the toolbar. Matches are highlighted with `<mark>` elements. Both message and source fields are searched.

### 4.6 Metadata Expansion

Clicking an entry expands it to show metadata as formatted JSON below the entry row.

---

## 5. Interactions

### 5.1 User Actions

| Action             | Trigger                | Result                                      |
|--------------------|------------------------|---------------------------------------------|
| Toggle level       | Click level button     | Shows/hides entries of that level            |
| Search             | Type in search input   | Filters entries and highlights matches       |
| Clear search       | Click "Clear" button   | Resets search input                          |
| Toggle auto-scroll | Click auto-scroll button | Enables/disables auto-scroll behaviour     |
| Scroll up          | Scroll log area up     | Pauses auto-scroll                           |
| Resume             | Click "Paused" button  | Resumes auto-scroll and scrolls to bottom    |
| Expand entry       | Click entry row        | Shows entry metadata as formatted JSON       |

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

Supports streaming via `useView` hook. New entries appended to the log trigger auto-scroll when enabled. The `maxEntries` field can be used to limit the number of visible entries.

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

No external resources loaded. All rendering is inline.

---

## 9. Accessibility

- Level filter buttons clearly labelled with level names.
- Search input has `aria-label="Search logs"`.
- Level conveyed by both colour and text label.
- Entry count in footer provides context for filtered view.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `LogRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts valid LogContent with entries array.
- Accepts all log level values.
- Accepts optional title, levels, searchable, autoScroll, maxEntries, showTimestamp, monospace.
- Rejects missing entries.
- Rejects entry missing timestamp, level, or message.
- Rejects invalid level value.
- Rejects wrong type.

### Rendering

- Level filter toggles visibility of entries.
- Search highlights matching text.
- Auto-scroll scrolls to bottom on new entries.
- Scroll-up pauses auto-scroll.
- Click entry expands metadata.
- Footer shows correct entry counts.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/log/src/Log.stories.tsx`

| Story          | Description                                                |
|----------------|------------------------------------------------------------|
| ApplicationLog | 30 entries across all 5 levels with sources and search     |
| ErrorsOnly     | 15 error/fatal entries, pre-filtered to error+fatal levels |
| Minimal        | 10 info entries, no source, no search, monospace enabled   |
