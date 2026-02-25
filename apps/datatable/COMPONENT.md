# @chuk/view-datatable

## Identity

- **Name:** @chuk/view-datatable
- **Type:** datatable
- **Version:** 1.0
- **Category:** Tier 1 -- Universal
- **Description:** Sortable, filterable data table rendering tabular data with badge columns, CSV export, and row actions.

## Dependencies

- **Runtime:** React 18
- **Build:** vite, vite-plugin-singlefile, typescript
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool, updateModelContext |
| `useViewEvents` | Cross-view event emission (`emitSelect` on row click) |

## Schema

### Input (structuredContent)

```typescript
interface DataTableContent {
  type: "datatable";
  version: "1.0";
  title?: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  actions?: RowAction[];
  paginationTool?: string;
  totalRows?: number;
  pageSize?: number;
  currentPage?: number;
}

interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "boolean" | "link" | "badge";
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  format?: string;
  badgeColors?: Record<string, string>;
}

interface RowAction {
  label: string;
  icon?: string;
  tool: string;
  arguments: Record<string, string>;
  confirm?: string;
}
```

### Defaults

| Field | Default |
|-------|---------|
| sortable | `true` |
| filterable | `true` |
| exportable | `false` |
| selectable | `false` |
| pageSize | `50` |
| currentPage | `1` |
| column.type | `"text"` |
| column.sortable | `true` (inherits from parent `sortable`) |
| column.align | `"left"` |

## Rendering

### Layout

Toolbar at top with optional title (left-aligned), filter input, and export button
(right-aligned). Scrollable table below with sticky header row. Footer at the
bottom showing row count (e.g. "5 of 10 rows (filtered)").

The container fills 100% height using a flex column layout. The table wrapper
takes all remaining vertical space (`flex: 1`) with `overflow: auto` for
scrolling.

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | "Connecting..." fallback displayed via shared `<Fallback>` component. |
| **Empty** | Table renders with a single merged cell containing "No data." in secondary text colour. |
| **Populated** | Full table with sortable headers, filterable rows, and optional action buttons. |
| **Filtered (no match)** | Table renders with a single merged cell containing "No matching rows." in secondary text colour. |
| **Error** | Fallback renders plain text content from `result.content`. |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text (container font-family) |
| `--chuk-color-text` | Table text, filter input text, export button text |
| `--chuk-color-text-secondary` | Footer text, null/empty values ("--"), empty state messages |
| `--chuk-color-background` | Container background |
| `--chuk-color-surface` | Header row background, filter input background, export button background |
| `--chuk-color-border` | Table borders, toolbar bottom border, footer top border, filter input border, button borders |
| `--chuk-color-primary` | Badge default colour, link text colour, action button text colour |
| `--chuk-border-radius` | Filter input corners, export button corners, action button corners |

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Sort column | Click sortable column header | Sorts rows by that column; toggles between ascending and descending on repeated clicks. Sort indicator arrow displayed. |
| Filter | Type in filter input | Filters rows across all columns using case-insensitive substring match. Footer updates to show filtered count. |
| Export CSV | Click "Export CSV" button | Downloads a CSV file named `{title}.csv` (or `export.csv` if no title). Exports all rows, ignoring current filter. |
| Row action | Click action button in row | Resolves template arguments from row data, optionally shows `confirm` dialog, then calls `callServerTool`. |
| Row selection | Click checkbox per row | Toggles row selection state; visual highlight `ring-2 ring-primary`. Select-all checkbox in header selects/deselects all visible rows. |
| Server-side pagination | Click Prev/Next or page number | Calls `callTool(paginationTool, { page, pageSize })`. Page numbers with ellipsis shown for large page counts. |

### Outbound Events (sendMessage)

None currently implemented.

### Server Calls (callServerTool)

Triggered by row action buttons. The View resolves `{key}` template strings
in the action's `arguments` object from the clicked row's data, then calls
`callServerTool` with the action's `tool` name and the resolved arguments.

If the action has a `confirm` string, a browser `window.confirm()` dialog is
shown before making the call.

```typescript
// Action definition
{
  "label": "View Details",
  "tool": "get-employee",
  "arguments": { "id": "{employee_id}" },
  "confirm": "Load employee details?"
}

// Row data
{ "employee_id": "EMP-1234", "name": "Jane Smith", "department": "Engineering" }

// Resolved call
app.callServerTool({
  name: "get-employee",
  arguments: { id: "EMP-1234" }
});
```

### Action Templates

Template syntax: `{key}` -- resolved from the row's data object.

Values are resolved by looking up `key` in the `Record<string, unknown>` row
object. Missing keys resolve to empty string via the shared `resolveTemplates`
utility.

## Model Context Updates

When row selection changes (and at least one row is selected), the datatable
pushes the selection count to the LLM via `updateModelContext`:

```
DataTable: {N} row(s) selected
```

## Display Mode

Not applicable. The datatable view stays inline-only and does not support
`requestDisplayMode()`.

## Cancellation

Default. No special handling beyond shared Fallback behaviour.

## Streaming

Not implemented. The table renders on full `ontoolresult`. No progressive
rendering via `ontoolinputpartial`.

## Composition

### As Child

When embedded in a `view-dashboard`, `view-split`, or `view-tabs`, the View
receives `structuredContent` via `postMessage` from the parent composition
View. It renders identically to standalone mode.

### As Parent

Not applicable. `view-datatable` does not embed other Views.

### Cross-View Events

| Direction | Event | Payload | When |
|-----------|-------|---------|------|
| **Emit** | `select` | `[rowId]` (field: `"id"`) | Row clicked |
| **Listen** | `feature-click` (postMessage, origin-restricted to `window.location.origin`) | `{ nhle_id, properties }` | Sibling map feature clicked -- highlights matching row |

## CSP Requirements

None -- no external resources loaded. All assets are inlined by
`vite-plugin-singlefile`.

## Accessibility

- Column headers have `aria-sort` attribute (`"ascending"` or `"descending"`) when actively sorted.
- Filter input has `aria-label="Filter table"`.
- Sortable column headers use `cursor: pointer` to indicate interactivity.
- Null/missing values display an em dash ("--") rather than blank space.
- Boolean values display check/cross marks for visual clarity.

## Size Budget

**Target:** < 150KB (React ~130KB + app code ~20KB)

**Actual:** 810 KB / 230 KB gzip (includes Tailwind CSS + shadcn/ui + Framer Motion)

## SSR Entry

- **File:** `apps/datatable/src/ssr-entry.tsx`
- **Renders:** `DataTable` with `onCallTool={noop}`
- **Config:** `apps/datatable/vite.config.ssr.ts`
- **Output:** `apps/datatable/dist-ssr/ssr-entry.js`

## Test Cases

### Schema Validation

- Accepts valid DataTableContent with columns and rows.
- Accepts minimal schema: `type`, `version`, `columns` (one column), `rows` (empty array).
- Rejects missing `type` field.
- Rejects missing `columns` field.
- Rejects missing `version` field.
- Rejects column with missing `key` or `label`.
- Accepts unknown additional fields (forward compatibility).
- Accepts all column types: text, number, date, boolean, link, badge.

### Rendering

- Columns render with correct labels in header row.
- Rows render cell values in correct columns.
- Badge column renders coloured pill with text.
- Badge column uses `badgeColors` mapping when provided.
- Badge column falls back to `--chuk-color-primary` when no colour mapping.
- Boolean column renders check mark for truthy, cross for falsy.
- Link column renders clickable anchor with `target="_blank"`.
- Number column renders with `toLocaleString()` formatting.
- Null/undefined values render as em dash in secondary text colour.
- Column `width` and `align` properties are applied.
- Header row is sticky (stays visible on scroll).
- Empty rows array shows "No data." message in merged cell.
- Title renders in toolbar when provided.
- Title is omitted when not provided.
- Footer shows correct row count.

### Interaction

- Clicking sortable column header sorts rows ascending.
- Clicking same column header again toggles to descending.
- Clicking different column header resets sort to ascending on new column.
- Sort indicator arrow displays on active sort column.
- Column with `sortable: false` does not respond to clicks.
- Parent `sortable: false` disables all column sorting.
- Typing in filter input filters rows across all columns (case-insensitive).
- Filter shows "No matching rows." when no rows match.
- Footer updates to show filtered count (e.g. "3 of 10 rows (filtered)").
- Export CSV downloads file with correct header and data rows.
- Export CSV properly escapes values containing commas and quotes.
- Export CSV uses title as filename when available.
- Export CSV uses "export" as filename when no title.
- Export CSV exports all rows (ignores active filter).
- Export button only appears when `exportable: true`.
- Filter input only appears when `filterable: true` (or default).
- Row action button calls `callServerTool` with resolved template arguments.
- Row action with `confirm` shows dialog before calling.
- Row action with `confirm` does not call when user cancels dialog.

### Theme

- All text uses `--chuk-font-family`.
- Table text uses `--chuk-color-text`.
- Footer and empty states use `--chuk-color-text-secondary`.
- Container background uses `--chuk-color-background`.
- Header and input backgrounds use `--chuk-color-surface`.
- All borders use `--chuk-color-border`.
- Links and action buttons use `--chuk-color-primary`.
- Input and button corners use `--chuk-border-radius`.

### Composition

- Renders correctly when receiving structuredContent via postMessage from a parent View.
- Handles re-render when parent sends updated structuredContent.

### Fallback

- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Incompatible `version` renders fallback with best-effort.
- Disconnected state shows "Connecting..." message.

### Accessibility

- `aria-sort` attribute is present on sorted column header.
- `aria-sort` attribute is absent on unsorted column headers.
- Filter input has `aria-label="Filter table"`.
- Sortable columns have pointer cursor.
- Non-sortable columns have default cursor.

## Storybook Stories

Story file: `apps/datatable/src/DataTable.stories.tsx`

| Story | Description |
|-------|-------------|
| Default | 5 rows with badge column, row actions (Edit, Delete with confirm) |
| Empty | Empty rows array showing empty state |
| ManyRows | 20 programmatically generated rows |
