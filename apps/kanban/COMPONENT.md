# Component Spec: @chuk/view-kanban

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-kanban`                                                   |
| Type        | `kanban`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Kanban board View with draggable cards across columns, WIP limit indicators, priority dots, assignee avatars, and label badges. Supports optional MCP tool invocation on card moves. |

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
| `useView` | MCP protocol connection, data, theme, callTool |

---

## 3. Schema

### 3.1 Root -- `KanbanContent`

```typescript
interface KanbanContent {
  type: "kanban";
  version: "1.0";
  title?: string;
  columns: KanbanColumn[];
  moveTool?: string;
}

interface KanbanColumn {
  id: string;
  label: string;
  color?: string;
  limit?: number;
  cards: KanbanCard[];
}

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  labels?: KanbanLabel[];
  priority?: "low" | "medium" | "high" | "critical";
  image?: string;
  metadata?: Record<string, string>;
}

interface KanbanLabel {
  text: string;
  color?: string;
}
```

### 3.2 Defaults

| Field      | Default                                  |
|------------|------------------------------------------|
| `title`    | None (header hidden if absent)           |
| `color`    | Falls back to `var(--border)` for column |
| `limit`    | No WIP limit when absent                 |
| `priority` | No priority indicator when absent        |
| `moveTool` | No tool call on card move when absent    |

---

## 4. Rendering

### 4.1 Layout

Root container: `h-full flex flex-col font-sans text-foreground bg-background`. Optional title header. Horizontal flex of column containers inside an `overflow-x-auto` scrollable area.

### 4.2 Columns

Each column is a `w-72` container with `rounded-lg border bg-muted/30`. Top has a coloured header strip (`h-1.5`) using the column's `color` property. Below that, the column label and a card count Badge. If `limit` is set and `cards.length >= limit`, the Badge switches to `destructive` variant (red).

### 4.3 Cards

Each card renders as a Card component inside a ScrollArea:

- **Image**: Optional cover image displayed above the card content, `h-32 object-cover`.
- **Priority dot**: 8px circle coloured by priority (low=blue, medium=amber, high=orange, critical=red).
- **Title**: `text-sm font-medium` with leading-snug.
- **Description**: `text-xs text-muted-foreground` with `line-clamp-2`.
- **Labels**: Rendered as outline Badges with optional custom border/text colour.
- **Assignee**: Initials avatar circle (deterministic colour from name hash) plus name text, separated by a top border.

### 4.4 Drag and Drop

Uses HTML5 Drag API:

- `onDragStart`: Sets `dataTransfer` with JSON payload containing `cardId` and `sourceColumnId`.
- `onDragOver`: Prevents default, sets drop effect to `move`, highlights target column with `border-primary ring-2 ring-primary/20`.
- `onDragLeave`: Removes highlight.
- `onDrop`: Decodes payload, moves card from source column to target column in state.
- `onDragEnd`: Clears drag-over state.
- When `moveTool` is set, calls `onCallTool(moveTool, { cardId, from, to })` after the move.

### 4.5 Animations

- Root: `fadeIn` variant.
- Card list per column: `listContainer` + `listItem` stagger animation.
- Card add/remove: `AnimatePresence` with `popLayout` mode, exit animation scales down and fades out.
- Card layout changes: `layout` prop on motion.div for smooth reordering.

---

## 5. Interactions

### 5.1 User Actions

| Action          | Trigger                  | Result                                             |
|-----------------|--------------------------|----------------------------------------------------|
| Drag card       | Drag card element        | Shows grab cursor, encodes drag payload            |
| Drop card       | Drop on target column    | Moves card, optionally calls moveTool              |
| Scroll columns  | Horizontal scroll/swipe  | Pans across columns                                |
| Scroll cards    | Vertical scroll in column| Scrolls card list within column                    |

### 5.2 State

| State             | Type              | Default                        |
|-------------------|-------------------|--------------------------------|
| `columns`         | `KanbanColumn[]`  | From `data.columns`            |
| `dragOverColumnId`| `string \| null`  | `null`                         |

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

No external resources loaded unless card `image` URLs point to external origins. MCP tool calls use `callTool` via the app bridge.

---

## 9. Accessibility

- Cards are draggable with `cursor-grab` / `active:cursor-grabbing` visual cues.
- Priority conveyed by both coloured dot and title attribute.
- WIP limit warnings use destructive Badge variant for clear visual distinction.
- Column headers provide semantic structure.
- Label badges use custom colours for visual grouping.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/kanban/src/ssr-entry.tsx`
- **Renders:** `KanbanRenderer` via `renderToString`
- **Config:** `apps/kanban/vite.config.ssr.ts`
- **Output:** `apps/kanban/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal KanbanContent with empty columns.
- Accepts board with all options (title, moveTool, columns with limits, cards with all fields).
- Accepts all priority values (low, medium, high, critical).
- Accepts cards with metadata records.
- Accepts columns with WIP limits.
- Rejects missing columns.
- Rejects column missing id, label, or cards.
- Rejects card missing id or title.
- Rejects wrong type.
- Rejects invalid priority value.
- Rejects label missing text.

### Rendering

- Columns render horizontally with correct headers.
- Cards render with priority dots, labels, and assignee avatars.
- WIP limit badge turns red when exceeded.
- Drag and drop moves cards between columns.
- moveTool is called on card move when configured.
- Images display as card covers.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/kanban/src/Kanban.stories.tsx`

| Story          | Description                                                              |
|----------------|--------------------------------------------------------------------------|
| ProjectBoard   | 4 columns (Todo/InProgress/Review/Done) with various cards, moveTool set |
| WithWipLimits  | 4 columns with WIP limits, one column exceeds its limit                  |
| MinimalBoard   | 2 columns (Open/Closed) with simple title-only cards                     |
| PriorityBoard  | Cards with all priority levels, multiple labels, images, and metadata    |
