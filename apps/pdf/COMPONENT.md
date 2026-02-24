# Component Spec: @chuk/view-pdf

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-pdf`                                                      |
| Type        | `pdf`                                                                 |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | PDF viewer View that renders PDF documents using pdf.js loaded from CDN. Supports page navigation, zoom controls, URL and base64 data URI sources. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | pdf.js (CDN)                            | `4.2.67`      |
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

### 3.1 Root -- `PdfContent`

```typescript
interface PdfContent {
  type: "pdf";
  version: "1.0";
  url: string;
  initialPage?: number;
  title?: string;
}
```

### 3.2 Defaults

| Field         | Default     |
|---------------|-------------|
| `initialPage` | `1`         |
| `title`       | `undefined` (title bar is not rendered) |

---

## 4. Rendering

### 4.1 Layout

Optional title bar at the top (`px-3 py-2`, 15px font-semibold, bottom border).
Below that, a toolbar row with page navigation (Prev/Next buttons, page counter)
and zoom controls (+/- buttons, percentage display). The toolbar has a muted
background with 13px text and wraps on narrow viewports.

Below the toolbar, a flex-1 scrollable area centres the `<canvas>` element
with 16px padding. The canvas dimensions are set dynamically from the pdf.js
viewport at the current scale.

The container uses a flex column layout filling 100% height.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| PDF Loading | Renders `<Fallback message="Loading PDF..." />` while pdf.js and the document are being loaded. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. Falls back to plain text display of raw content. |
| Error       | Renders `<Fallback message={error} />` with the error message from pdf.js. |
| Populated   | Full PDF rendering with page navigation and zoom controls.              |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background.                            |
| `--color-muted`              | Toolbar background.                              |
| `--color-border`             | Title bottom border, toolbar bottom border, toolbar separator. |

### 4.4 PDF Source Handling

The `url` field supports two source formats:

1. **HTTP/HTTPS URL** -- passed directly to `pdfjsLib.getDocument()`.
2. **Base64 data URI** -- a `data:application/pdf;base64,` prefix is detected, the base64 content is decoded to a `Uint8Array`, and passed as `{ data: Uint8Array }` to `pdfjsLib.getDocument()`.

### 4.5 pdf.js Loading

pdf.js is loaded lazily from the CDN (`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67`).
The loader creates a `<script type="module">` element for `pdf.min.mjs` and
configures the worker source to `pdf.worker.min.mjs`. A singleton promise
ensures the library is loaded only once across multiple View instances.

---

## 5. Interactions

### 5.1 User Actions

| Action     | Trigger              | Result                                                      |
|------------|----------------------|-------------------------------------------------------------|
| Prev page  | Click "Prev" button  | Navigates to the previous page. Disabled when on page 1.    |
| Next page  | Click "Next" button  | Navigates to the next page. Disabled when on the last page. |
| Zoom in    | Click "+" button     | Increases scale by 0.25. Maximum scale is 3.0 (300%).       |
| Zoom out   | Click "-" button     | Decreases scale by 0.25. Minimum scale is 0.5 (50%).        |
| Scroll     | Mouse wheel / touch  | Scrolls the canvas area when the rendered page exceeds the container. |

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
rendering via `ontoolinputpartial`. The PDF document is loaded in its entirety
before the first page is rendered.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the
`postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook.
The pdf view registers with `type: "pdf"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The pdf view does not embed child views.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

**External network access required.** The View loads pdf.js from the
cloudflare CDN at runtime:

- `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs`
- `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs`

The host application's CSP must allow `script-src` from
`https://cdnjs.cloudflare.com`.

Additionally, if the `url` field points to an external PDF, the CSP must allow
`connect-src` for that origin (or `default-src`).

---

## 9. Accessibility

- Page navigation buttons are disabled at boundaries (first/last page) to prevent invalid navigation.
- Zoom buttons are disabled at boundaries (50%/300%) to prevent exceeding limits.
- Page counter displays current page and total pages ("Page X of Y").
- Zoom level is displayed as a percentage.
- Button components from `@chuk/view-ui` provide consistent focus and keyboard interaction.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 250 KB    | 692 KB              |
| Gzip         | --          | 191 KB              |

The bundle does not include pdf.js itself (loaded from CDN). The size is
primarily React and the shared UI component library.

---

## 10b. SSR Entry

Not yet implemented. No `ssr-entry.tsx` exists for this view.

---

## 11. Test Cases

### Schema Validation

- Accepts valid PdfContent with `type`, `version`, and `url`.
- Accepts minimal schema: `type`, `version`, `url`.
- Accepts optional `initialPage` field.
- Accepts optional `title` field.
- Rejects missing `type` field.
- Rejects missing `version` field.
- Rejects missing `url` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- PDF renders on canvas at default scale (150%).
- Title renders in header bar when provided.
- Title is omitted when not provided.
- Toolbar displays page counter ("Page 1 of N").
- Toolbar displays zoom percentage ("150%").
- Canvas dimensions match the pdf.js viewport at the current scale.
- PDF loaded from HTTPS URL renders correctly.
- PDF loaded from base64 data URI renders correctly.
- Initial page is respected when `initialPage` is set.
- Initial page is clamped to `numPages` if it exceeds the document length.

### Interaction

- Clicking "Prev" navigates to the previous page.
- Clicking "Next" navigates to the next page.
- "Prev" button is disabled on page 1.
- "Next" button is disabled on the last page.
- Clicking "+" increases zoom by 25%.
- Clicking "-" decreases zoom by 25%.
- "+" button is disabled at 300% zoom.
- "-" button is disabled at 50% zoom.
- Page re-renders when scale changes.
- Canvas scrolls when rendered page exceeds container.

### Theme

- Container background uses `--color-background`.
- Text colour uses `--color-foreground`.
- Toolbar background uses `--color-muted`.
- Borders use `--color-border`.

### Composition

- Renders correctly when receiving structuredContent via postMessage from a parent View.
- Handles re-render when parent sends updated structuredContent.
- Handles URL change by reloading the PDF document.

### Fallback

- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Incompatible `version` renders fallback with best-effort.
- Disconnected state shows "Connecting..." message.
- PDF loading state shows "Loading PDF..." message.
- Failed pdf.js CDN load shows error message.
- Invalid PDF URL shows error message from pdf.js.

### Accessibility

- Navigation buttons are disabled at boundaries.
- Zoom buttons are disabled at boundaries.
- Page counter and zoom percentage are visible.

---

## 12. Storybook Stories

Story file: `apps/pdf/src/Pdf.stories.tsx`

| Story   | Description                                            |
|---------|--------------------------------------------------------|
| Default | Minimal PDF with page navigation and zoom controls     |
