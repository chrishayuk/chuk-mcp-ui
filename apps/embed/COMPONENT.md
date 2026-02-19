# Component Spec: @chuk/view-embed

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-embed`                                                    |
| Type        | `embed`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Generic iframe wrapper View that embeds external URLs with an optional toolbar, sandbox controls, loading spinner, error fallback, and aspect-ratio support. |

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

## 3. Schema

### 3.1 Root -- `EmbedContent`

```typescript
interface EmbedContent {
  type: "embed";
  version: "1.0";
  title?: string;
  url: string;
  sandbox?: string;
  allow?: string;
  aspectRatio?: string;
  toolbar?: boolean;
  fallbackText?: string;
}
```

### 3.2 Defaults

| Field          | Default                              |
|----------------|--------------------------------------|
| `title`        | `undefined` (title bar not rendered) |
| `sandbox`      | `"allow-scripts allow-same-origin"`  |
| `allow`        | `undefined` (no iframe permissions)  |
| `aspectRatio`  | `undefined` (iframe fills remaining flex space) |
| `toolbar`      | `false` (toolbar not shown)          |
| `fallbackText` | `"Unable to load embedded content."` |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column container. Optional title bar at the top (`px-3 py-2`,
15px font-semibold, bottom border). Optional toolbar below the title with a
read-only URL Input, Refresh Button, and Open-in-new-tab Button. The iframe
fills the remaining space with `w-full flex-1 border-0`.

When `aspectRatio` is provided, the iframe container uses CSS `aspect-ratio`
for proportional sizing instead of flex-1.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Spinner overlay (`animate-spin`) displayed over the iframe while it loads. Spinner disappears on `onLoad`. |
| Populated   | Full iframe with embedded content visible.                              |
| Error       | Fallback card with `fallbackText` and a Retry button.                   |
| Connecting  | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour via `text-foreground`.          |
| `--color-background`         | Container background via `bg-background`.        |
| `--color-muted-foreground`   | Fallback text via `text-muted-foreground`.       |
| `--color-muted`              | Toolbar background via `bg-muted`.               |
| `--color-border`             | Title and toolbar borders via `border-border`.   |
| `--color-primary`            | Spinner accent via `border-t-primary`.           |

### 4.4 Sandbox Handling

The `sandbox` attribute defaults to `"allow-scripts allow-same-origin"` when
not explicitly provided. This allows embedded pages to run JavaScript while
restricting form submission, popups, and other potentially dangerous behaviours.
The host application can override this by passing a custom `sandbox` string.

### 4.5 Refresh Mechanism

The iframe is keyed with a numeric `iframeKey` state. Clicking the Refresh
button increments this key, which causes React to unmount and remount the
iframe element, forcing a full reload. The loading spinner reappears during
the reload.

---

## 5. Interactions

### 5.1 User Actions

| Action         | Trigger                    | Result                                               |
|----------------|----------------------------|------------------------------------------------------|
| Refresh        | Click Refresh button       | Reloads the iframe by toggling the key prop.         |
| Open in tab    | Click Open button          | Opens the URL in a new browser tab.                  |
| Retry          | Click Retry button         | Reloads the iframe after an error state.             |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`. No progressive
rendering via `ontoolinputpartial`. The iframe source URL is set once and
content loading is handled natively by the browser.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the
`postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook.
The embed view registers with `type: "embed"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The embed view does not embed child MCP views (though it
does embed arbitrary external content via an iframe).

---

## 8. CSP Requirements

**External network access required.** The `url` field points to an external
page loaded in an iframe. The host application's CSP must allow `frame-src`
(or `default-src`) for the embedded content origin.

If the `allow` attribute grants permissions such as `fullscreen`, `camera`,
or `microphone`, the host CSP must also permit those features.

The `sandbox` attribute provides an additional layer of restriction on the
embedded content regardless of CSP.

---

## 9. Accessibility

- The `<iframe>` element includes a `title` attribute derived from the `title` field (falls back to "Embedded content").
- Toolbar buttons have visible text labels ("Refresh", "Open").
- Read-only URL input provides context about the embedded page.
- Loading state uses a visible spinner with sufficient contrast.
- Error state provides a clear message and actionable Retry button.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 150 KB    | TBD                 |
| Gzip         | --          | TBD                 |

The bundle is primarily React and the shared UI component library. No
additional iframe-related libraries are included since the View relies
entirely on the native HTML5 `<iframe>` element.

---

## 11. Test Cases

### Schema Validation

- Accepts valid EmbedContent with `type`, `version`, and `url`.
- Accepts minimal schema: `type`, `version`, `url`.
- Accepts all optional fields: `title`, `sandbox`, `allow`, `aspectRatio`, `toolbar`, `fallbackText`.
- Rejects missing `url` field.
- Rejects missing `type` field.
- Rejects wrong `type` value.
- Rejects wrong `version` value.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- iframe renders with `src` attribute matching `data.url`.
- iframe has sandbox attribute defaulting to "allow-scripts allow-same-origin".
- Title renders in header bar when provided.
- Title is omitted when not provided.
- Toolbar renders with URL input, Refresh, and Open buttons when `toolbar` is true.
- Toolbar is omitted when `toolbar` is false or undefined.
- Loading spinner appears before iframe loads.
- Loading spinner disappears after iframe `onLoad` fires.
- Error state shows fallback text and Retry button.
- Aspect ratio is applied to container when `aspectRatio` is provided.

### Interaction

- Refresh button increments iframe key, causing remount.
- Open button calls `window.open` with the URL.
- Retry button in error state triggers reload.

### Theme

- Container background uses `--color-background`.
- Text colour uses `--color-foreground`.
- Toolbar background uses `--color-muted`.
- Border uses `--color-border`.
- Spinner accent uses `--color-primary`.

### Composition

- Renders correctly when receiving structuredContent via postMessage from a parent View.
- Handles re-render when parent sends updated structuredContent.
- Handles URL change by updating the iframe source.

### Fallback

- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Disconnected state shows "Connecting..." message.

### Accessibility

- iframe has `title` attribute.
- Toolbar buttons have visible text labels.
- Read-only input shows URL for context.

---

## 12. Storybook Stories

Story file: `apps/embed/src/Embed.stories.tsx`

| Story       | Description                                                |
|-------------|------------------------------------------------------------|
| WithToolbar | Embedded page with toolbar showing URL, refresh, and open  |
| Minimal     | Bare iframe embed with no toolbar and no title             |
| AspectRatio | Proportional embed with 16/9 aspect ratio and title        |
