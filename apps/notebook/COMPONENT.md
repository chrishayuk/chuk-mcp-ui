# @chuk/view-notebook

## Identity

- **Name:** @chuk/view-notebook
- **Type:** notebook
- **Version:** 1.0
- **Category:** Tier 3 — Compound
- **Description:** Jupyter-like notebook rendering a vertical sequence of typed cells (markdown, code, table, image, counter) with collapsible sections and colour-coded cell type accents.

## Dependencies

- **Runtime:** React 18, framer-motion, marked 15+, @chuk/view-shared, @chuk/view-ui
- **Build:** vite, vite-plugin-singlefile, typescript, @tailwindcss/vite
- **Protocol:** @modelcontextprotocol/ext-apps

## Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

## Schema

### Input (structuredContent)

```typescript
interface NotebookContent {
  type: "notebook";
  version: "1.0";
  title?: string;
  cells: NotebookCell[];
}

type NotebookCell =
  | MarkdownCell
  | CodeCell
  | TableCell
  | ImageCell
  | CounterCell;

interface MarkdownCell {
  cellType: "markdown";
  source: string;
  collapsed?: boolean;
}

interface CodeCell {
  cellType: "code";
  source: string;
  language?: string;
  output?: string;
  collapsed?: boolean;
}

interface TableCell {
  cellType: "table";
  columns: string[];
  rows: string[][];
  caption?: string;
  collapsed?: boolean;
}

interface ImageCell {
  cellType: "image";
  url: string;
  alt?: string;
  caption?: string;
  collapsed?: boolean;
}

interface CounterCell {
  cellType: "counter";
  value: number;
  label?: string;
  collapsed?: boolean;
}
```

### Defaults

| Field | Default |
|-------|---------|
| title | `undefined` (title heading hidden) |
| cell.collapsed | `undefined` (cell is always expanded; collapse toggle hidden) |
| code.language | `undefined` (language badge hidden) |
| code.output | `undefined` (output section hidden) |
| table.caption | `undefined` (caption hidden) |
| image.alt | `""` (empty alt text) |
| image.caption | `undefined` (caption hidden) |
| counter.label | `undefined` (label hidden) |

## Rendering

### Layout

Vertically scrolling notebook centred within the viewport:

- **Container:** `max-w-[900px]` centred with horizontal padding, vertical padding of 1.5rem.
- **Title:** Optional `h1` heading with bold tracking-tight styling.
- **Cells:** Vertical flex column with 1rem gap. Each cell is a `Card` with a 4px coloured left border indicating cell type. Cells with `collapsed` defined get a toggle header button.

Cell type accent colours (left border):
- **markdown:** blue
- **code:** emerald
- **table:** amber
- **image:** purple
- **counter:** rose

Cell rendering details:
- **Markdown:** Parsed via `marked` library with custom renderer (links open in new tab). Output rendered as `dangerouslySetInnerHTML` with scoped `.nb-md-body` CSS styles for headings, paragraphs, code, blockquotes, lists, tables, images, and horizontal rules.
- **Code:** Source in monospace `<pre>/<code>` block with dark background (`bg-zinc-950`). Optional language badge (top-right). Optional output block below with muted background.
- **Table:** Full-width `<table>` with header row (`<thead>`) and striped body rows. Optional caption below.
- **Image:** Centred `<img>` with `max-w-full` and rounded corners. Optional caption below.
- **Counter:** Large centred number (`text-4xl font-bold`) formatted with `toLocaleString()`. Optional label below.

### States

| State | Behaviour |
|-------|-----------|
| **Loading** | Returns `null` until `data` is available from `useView`. |
| **Populated** | All cells rendered in order with staggered entrance animation. |
| **Empty cells** | Renders title only (if present) with no cell content. |

### Theme Integration

| CSS Variable | Usage |
|-------------|-------|
| `--chuk-font-family` | All text via `font-sans`; code cells use monospace |
| `--chuk-color-text` | Cell text, headings (`text-foreground`, `--color-foreground`) |
| `--chuk-color-text-secondary` | Captions, labels, language badges, collapse labels (`text-muted-foreground`) |
| `--chuk-color-background` | Root container |
| `--chuk-color-surface` | Markdown code blocks, table headers, blockquote bg (`--color-surface`) |
| `--chuk-color-border` | Cell card borders, table borders, markdown `hr` and heading underlines (`--color-border`) |
| `--chuk-color-primary` | Markdown links, blockquote left border (`--color-primary`) |
| `--chuk-border-radius` | Card corners, code block corners, image corners |

## Interactions

### User Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Toggle cell collapse | Click chevron header on collapsible cells | Expands or collapses cell content |
| Scroll | Scroll within `ScrollArea` | Navigate through notebook cells |

### Outbound Events (sendMessage)

None.

### Server Calls (callServerTool)

None.

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

When embedded in a composition container (dashboard, split, tabs), the notebook fills its allocated panel. The `max-w-[900px]` constraint and `ScrollArea` adapt to the available height.

### As Parent

Not applicable. `view-notebook` does not embed other Views.

### Cross-View Events

None.

## CSP Requirements

None. Fully self-contained. (Image cells and markdown images may reference external URLs but no specific domains are required by the view itself.)

## Accessibility

- Markdown cells render semantic HTML (headings, lists, tables, blockquotes) via `marked`.
- Table cells use proper `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` elements.
- Images include `alt` attribute from schema (defaults to empty string).
- Collapse toggle buttons are keyboard-accessible `<button>` elements.
- Chevron icon provides visual state indication for collapsed/expanded.
- Code blocks use `<pre>/<code>` semantic elements with monospace font.
- Counter values use `toLocaleString()` for screen-reader-friendly number formatting.
- Links in markdown open in new tab with `rel="noopener noreferrer"`.

## Size Budget

**Target:** < 150KB gzip (React + framer-motion + marked ~30KB + app code)

## SSR Entry

- **File:** `apps/notebook/src/ssr-entry.tsx`
- **Renders:** `NotebookRenderer` via `renderToString`
- **Config:** `apps/notebook/vite.config.ssr.ts`
- **Output:** `apps/notebook/dist-ssr/ssr-entry.js`

## Test Cases

- **Schema Validation:** Accepts valid `NotebookContent` with mixed cell types.
- **Schema Validation:** Rejects missing `type` or `cells` field.
- **Schema Validation:** Accepts unknown additional fields and unknown `cellType` values (forward compatibility).
- **Rendering:** Markdown cell parses and renders HTML from `source` string.
- **Rendering:** Code cell displays source in monospace block; language badge shown when specified.
- **Rendering:** Code cell output section shown when `output` is present.
- **Rendering:** Table cell renders correct number of columns and rows with optional caption.
- **Rendering:** Image cell renders `<img>` with correct `src`, `alt`, and optional caption.
- **Rendering:** Counter cell displays formatted number with optional label.
- **Rendering:** Collapsible cells show toggle header; content hidden when collapsed.
- **Fallback:** Returns `null` when `data` is absent.

## Storybook Stories

Story file: `apps/notebook/src/Notebook.stories.tsx`

| Story | Description |
|-------|-------------|
| DataAnalysis | Sales analysis notebook with markdown, table, counter, and code cells |
| TutorialNotebook | React tutorial with markdown, code (with output), and image cells |
| ResearchNotes | Archaeological survey with markdown, image, table (collapsed markdown), and counter cells |
