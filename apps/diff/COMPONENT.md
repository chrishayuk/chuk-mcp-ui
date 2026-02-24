# Component Spec: @chuk/view-diff

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-diff`                                                     |
| Type        | `diff`                                                                |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Unified and split diff rendering View. Displays code diffs with line numbers, hunk headers, add/remove colouring, and a toggle between unified and side-by-side split modes. |

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

### 3.1 Root -- `DiffContent`

```typescript
interface DiffContent {
  type: "diff";
  version: "1.0";
  title?: string;
  language?: string;
  mode?: "unified" | "split";
  fileA?: string;
  fileB?: string;
  hunks: DiffHunk[];
}

interface DiffHunk {
  headerA: string;
  headerB?: string;
  lines: DiffLine[];
}

interface DiffLine {
  type: "context" | "add" | "remove";
  content: string;
  lineA?: number;
  lineB?: number;
}
```

### 3.2 Defaults

| Field      | Default                      |
|------------|------------------------------|
| `title`    | `undefined` (not rendered)   |
| `language` | `undefined` (no badge shown) |
| `mode`     | `"unified"`                  |
| `fileA`    | `undefined` (no file tab)    |
| `fileB`    | `undefined` (no file tab)    |

---

## 4. Rendering

### 4.1 Layout

Full-height container with padding. Header bar with title, language badge, and mode toggle button. Optional file-name tabs rendered below the header. Diff content displayed in a bordered, scrollable area.

**Unified mode**: Single `<table>` with three columns -- lineA number, lineB number, and content with +/- prefix. Added lines have green background (`bg-green-50` / `dark:bg-green-900/10`). Removed lines have red background (`bg-red-50` / `dark:bg-red-900/10`). Context lines have no background.

**Split mode**: Two side-by-side `<table>` elements, each taking 50% width. Left table shows removes and context lines. Right table shows adds and context lines. Empty placeholder rows are inserted when one side has more changes than the other.

Hunk headers appear as separator rows with muted background spanning all columns. Monospace font is used throughout the diff content.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full diff rendering with hunk headers, line numbers, and colour-coded lines. |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background.                            |
| `--color-muted`              | Hunk header background, file-name tab background.|
| `--color-muted-foreground`   | Line numbers, hunk header text, file-name text.  |
| `--color-border`             | Table borders, file-name tab borders.            |

---

## 5. Interactions

### 5.1 User Actions

| Action       | Trigger           | Result                                     |
|--------------|-------------------|--------------------------------------------|
| Toggle mode  | Click mode button | Switches between unified and split display.|
| Scroll       | Mouse wheel       | Scrolls the diff content area.             |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

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

Not implemented. The View renders on full `ontoolresult`.

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

None. All content is inline text.

---

## 9. Accessibility

- Diff content is rendered in `<table>` elements for structural semantics.
- Line numbers are in non-selectable cells (`select-none`).
- Monospace font ensures consistent character alignment.
- Colour is not the sole indicator -- +/- prefixes are shown in unified mode.
- Mode toggle button is keyboard accessible.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/diff/src/ssr-entry.tsx`
- **Renders:** `DiffRenderer` via `renderToString`
- **Config:** `apps/diff/vite.config.ssr.ts`
- **Output:** `apps/diff/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid DiffContent with empty hunks.
- Accepts full DiffContent with all optional fields.
- Accepts both unified and split modes.
- Rejects invalid mode values.
- Rejects missing hunks.
- Rejects missing type.
- Rejects wrong type.
- Rejects missing version.
- Rejects invalid line type.
- Rejects hunk missing headerA.
- Rejects line missing content.
- Rejects line missing type.
- Accepts lines without optional lineA/lineB.
- Accepts unknown additional fields.

### Rendering

- Title renders as h1 when provided.
- Language badge renders when provided.
- File-name tabs render when fileA/fileB provided.
- Hunk headers render as separator rows.
- Added lines have green background and + prefix.
- Removed lines have red background and - prefix.
- Context lines have no special background.
- Line numbers display in gutter columns.
- Split mode renders two side-by-side tables.
- Mode toggle switches between unified and split.

### Theme

- Uses theme tokens for all colours.
- Supports dark mode via `dark:` variants.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/diff/src/Diff.stories.tsx`

| Story         | Description                                              |
|---------------|----------------------------------------------------------|
| SimpleUnified | Basic unified diff with adds, removes, and context lines |
| SplitMode     | Same diff rendered in side-by-side split view            |
| MultiHunk     | Multiple hunks in a single diff                          |
| LargeChange   | Many lines changed with full file replacement            |
