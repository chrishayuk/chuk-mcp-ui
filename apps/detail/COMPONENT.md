# Component Spec: @chuk/view-detail

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-detail`                                                   |
| Type        | `detail`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Single-record detail View that displays fields with type-aware formatting, optional image, grouped sections, and action buttons via `callTool`. |

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

### 3.1 Root -- `DetailContent`

```typescript
interface DetailContent {
  type: "detail";
  version: "1.0";
  title: string;
  subtitle?: string;
  image?: { url: string; alt?: string };
  fields: DetailField[];
  actions?: DetailAction[];
  sections?: DetailSection[];
}

interface DetailField {
  label: string;
  value: string;
  type?: "text" | "link" | "badge" | "date" | "email";
}

interface DetailAction {
  label: string;
  tool: string;
  args?: Record<string, unknown>;
}

interface DetailSection {
  title: string;
  fields: DetailField[];
}
```

### 3.2 Defaults

| Field       | Default     |
|-------------|-------------|
| `subtitle`  | `undefined` (not rendered) |
| `image`     | `undefined` (not rendered) |
| `actions`   | `undefined` (action bar not rendered) |
| `sections`  | `undefined` (no additional sections) |
| `field.type`| `"text"` (plain text display) |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 700px, centered horizontally with 24px padding. Optional image (80x80px, rounded, object-cover) floats left of title/subtitle. Fields render as label-value rows with 120px min-width labels. Sections separated by `Separator` components. Actions render as a button bar at the bottom.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full detail card with fields, sections, and action buttons.             |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Field labels, subtitle text.                     |
| `--color-primary`            | Link and email field colour.                     |
| `--color-border`             | Separator lines.                                 |

### 4.4 Field Type Rendering

| Type    | Rendering                                            |
|---------|------------------------------------------------------|
| `text`  | Plain text span (default).                           |
| `link`  | `<a>` tag with `target="_blank"`, primary colour.    |
| `email` | `mailto:` link with primary colour.                  |
| `badge` | shadcn `Badge` component with secondary variant.     |
| `date`  | Plain text span.                                     |

---

## 5. Interactions

### 5.1 User Actions

| Action       | Trigger         | Result                                     |
|--------------|-----------------|---------------------------------------------|
| Click action | Click button    | Calls `callTool(action.tool, action.args)`. |
| Click link   | Click link field| Opens URL in new tab.                       |
| Click email  | Click email field| Opens mailto link.                         |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

Action buttons invoke `callTool` with the action's `tool` name and `args` object.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

---

## 8. CSP Requirements

External network access may be required if `image.url` points to an external origin. The host application's CSP must allow `img-src` for image origins.

---

## 9. Accessibility

- Semantic heading structure (h1 for title, h2 for section titles).
- Links include `target="_blank"` and `rel="noopener noreferrer"`.
- Buttons are native `<button>` elements with visible labels.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts valid DetailContent with all required fields.
- Accepts all field types: text, link, badge, date, email.
- Accepts optional subtitle, image, actions, sections.
- Rejects missing title.
- Rejects missing fields.
- Rejects wrong type.
- Rejects missing version.
- Accepts unknown additional fields.

### Rendering

- Title renders as h1.
- Subtitle renders when provided.
- Image renders when provided.
- Fields render with correct type formatting.
- Sections render with separators.
- Actions render as buttons.

### Interaction

- Action buttons call callTool with correct arguments.
- Link fields open in new tab.
- Email fields open mailto.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/detail/src/Detail.stories.tsx`

| Story       | Description                                              |
|-------------|----------------------------------------------------------|
| UserProfile | Full detail with image, typed fields, actions, sections  |
| Minimal     | Simple detail with title and basic fields                |
