# Component Spec: @chuk/view-markdown

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-markdown`                                                 |
| Type        | `markdown`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Markdown renderer View that converts Markdown text to styled HTML using the `marked` library. Supports headings, paragraphs, lists, tables, blockquotes, code blocks, links, and images. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | marked                                  | `^15.0.0`     |
| Runtime  | dompurify                               | `^3.2.0`      |
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
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

### 3.1 Root -- `MarkdownContent`

```typescript
interface MarkdownContent {
  type: "markdown";
  version: "1.0";
  content: string;
  title?: string;
}
```

### 3.2 Defaults

| Field   | Default     |
|---------|-------------|
| `title` | `undefined` (title bar is not rendered) |

---

## 4. Rendering

### 4.1 Layout

Optional title bar at the top (`px-3 py-2`, 15px font-semibold, bottom border).
Below that, a scrollable container (`overflow-auto`) with a `.md-body` div
(`px-6 py-4`, max-width 800px) containing the rendered HTML output.

The container fills 100% height with `h-full overflow-auto`.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. Falls back to plain text display of raw content. |
| Populated   | Full Markdown rendering via `marked.parse()` with styled HTML output.   |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Heading text colour, body text colour.           |
| `--color-background`         | Container background.                            |
| `--color-surface`            | Inline code background, pre/code block background, blockquote background, table header background. |
| `--color-border`             | H1/H2 bottom border, pre border, table cell borders, horizontal rules. |
| `--color-primary`            | Blockquote left border, link text colour.        |
| `--radius-md`                | Pre block border radius, image border radius.    |

### 4.4 Markdown Features

The `marked` library is configured with `breaks: true` (line breaks converted
to `<br>`). A custom renderer overrides link rendering so that all `<a>` tags
include `target="_blank" rel="noopener noreferrer"` to open links in a new tab.

Supported Markdown elements:

- Headings (h1--h4) with graduated sizing and h1/h2 bottom borders
- Paragraphs with 1.6 line-height
- Bold and italic inline formatting
- Inline code with surface background and monospace font
- Fenced code blocks with border and surface background
- Blockquotes with primary-coloured left border
- Ordered and unordered lists
- Tables with full borders and header styling
- Images (max-width 100%, rounded corners)
- Links (primary colour, open in new tab)
- Horizontal rules

---

## 5. Interactions

### 5.1 User Actions

| Action       | Trigger         | Result                                     |
|--------------|-----------------|--------------------------------------------|
| Click link   | Click `<a>` tag | Opens URL in new tab via `target="_blank"`. |
| Scroll       | Mouse wheel / touch | Scrolls the content area vertically.     |

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

Not implemented. The View renders on full `ontoolresult`. No progressive
rendering via `ontoolinputpartial`. The `marked.parse()` call is memoized
with `useMemo` keyed on `data.content`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the
`postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook.
The markdown view registers with `type: "markdown"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The markdown view does not embed child views.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None. The component is bundled as a single HTML file via `vite-plugin-singlefile`
and requires no external network requests at runtime. All `marked` library code
and assets are inlined.

**Note:** The use of `dangerouslySetInnerHTML` means the rendered HTML output
from `marked` is injected directly into the DOM. The output of `marked.parse()`
is sanitized with `DOMPurify.sanitize()` before rendering via
`dangerouslySetInnerHTML` to prevent XSS attacks.

---

## 9. Accessibility

- Links include `rel="noopener noreferrer"` for security.
- Semantic HTML structure is preserved from Markdown (headings, lists, tables, blockquotes).
- Content area has a max-width of 800px for comfortable reading line length.
- Tables use proper `<th>` elements for header rows.
- Images include `max-width: 100%` to prevent overflow.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 250 KB    | 583 KB              |
| Gzip         | --          | 157 KB              |

The overshoot is due to the `marked` library being bundled inline alongside
React.

---

## 10b. SSR Entry

- **File:** `apps/markdown/src/ssr-entry.tsx`
- **Renders:** `MarkdownRenderer` via `renderToString`
- **Config:** `apps/markdown/vite.config.ssr.ts`
- **Output:** `apps/markdown/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts valid MarkdownContent with `type`, `version`, and `content`.
- Accepts minimal schema: `type`, `version`, `content` (empty string).
- Accepts optional `title` field.
- Rejects missing `type` field.
- Rejects missing `version` field.
- Rejects missing `content` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Headings h1--h4 render with correct sizing and styling.
- H1 and h2 render with bottom border.
- Paragraphs render with 1.6 line-height and 0.8em vertical margins.
- Bold and italic text render correctly.
- Inline code renders with surface background and monospace font.
- Fenced code blocks render with surface background, border, and 16px padding.
- Blockquotes render with primary-coloured left border and surface background.
- Ordered and unordered lists render with correct indentation.
- Tables render with full borders, header styling, and 100% width.
- Images render with max-width 100% and rounded corners.
- Links render with primary colour.
- Horizontal rules render as 1px top border with 2em margin.
- Title renders in header bar when provided.
- Title is omitted when not provided.
- Content area is constrained to max-width 800px.

### Interaction

- Clicking a link opens in a new tab (`target="_blank"`).
- Links include `rel="noopener noreferrer"`.
- Content scrolls when it overflows the container.

### Theme

- Container background uses `--color-background`.
- Text colour uses `--color-foreground`.
- Code and blockquote backgrounds use `--color-surface`.
- Borders use `--color-border`.
- Links and blockquote accent use `--color-primary`.
- Rounded corners use `--radius-md`.

### Composition

- Renders correctly when receiving structuredContent via postMessage from a parent View.
- Handles re-render when parent sends updated structuredContent.

### Fallback

- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Incompatible `version` renders fallback with best-effort.
- Disconnected state shows "Connecting..." message.

### Accessibility

- Semantic HTML headings are preserved from Markdown source.
- Table headers use `<th>` elements.
- Links have `rel="noopener noreferrer"`.
- Content max-width supports readable line length.

---

## 12. Storybook Stories

Story file: `apps/markdown/src/Markdown.stories.tsx`

| Story       | Description                                              |
|-------------|----------------------------------------------------------|
| Basic       | Headings, paragraphs with bold/italic                    |
| RichContent | Lists, table, blockquote, links, image                   |
| CodeBlocks  | Inline code plus fenced blocks in JS, TS, Python, JSON   |
