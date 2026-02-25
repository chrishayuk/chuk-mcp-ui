# Component Spec: @chuk/view-compare

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-compare`                                                  |
| Type        | `compare`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 2 -- Media                                                       |
| Description | Before/after image comparison slider View that allows users to drag a divider between two overlaid images to reveal differences. Supports horizontal and vertical orientations, configurable labels, and keyboard accessibility. |

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

### 3.1 Root -- `CompareContent`

```typescript
interface CompareContent {
  type: "compare";
  version: "1.0";
  title?: string;
  before: CompareImage;
  after: CompareImage;
  orientation?: "horizontal" | "vertical";
  initialPosition?: number;
  labels?: {
    before?: string;
    after?: string;
  };
}

interface CompareImage {
  url: string;
  alt?: string;
  caption?: string;
}
```

### 3.2 Defaults

| Field             | Default           |
|-------------------|-------------------|
| `title`           | `undefined` (not rendered) |
| `orientation`     | `"horizontal"`    |
| `initialPosition` | `50`              |
| `labels`          | `undefined` (no labels rendered) |
| `before.alt`      | `"Before"`        |
| `after.alt`       | `"After"`         |
| `before.caption`  | `undefined` (caption bar not rendered) |
| `after.caption`   | `undefined` (caption bar not rendered) |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 900px, centered horizontally with 24px padding. Optional title rendered as h1 above the card. The comparison container holds both images in a relative-positioned wrapper. The after image fills the container as the base layer. The before image is rendered in an absolutely-positioned div clipped via `overflow: hidden` with dynamic width (horizontal) or height (vertical) based on the slider position. A divider line with a circular grab handle (24px, `bg-background`, `border-2 border-primary`) sits at the split point. Labels render as semi-transparent overlay badges. An optional caption bar appears below the images.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full comparison slider with images, divider, and optional labels/captions. |
| Error       | Fallback renders plain text content from `result.content`.              |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background, grab handle fill.          |
| `--color-muted-foreground`   | Caption text.                                    |
| `--color-primary`            | Divider line, grab handle border, handle bars.   |
| `--color-border`             | Caption bar top border.                          |

### 4.4 Slider Mechanics

The slider position is stored as state (0-100). Pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) track drag gestures. `setPointerCapture` ensures smooth dragging even when the pointer leaves the container. Position is calculated as a percentage of the container's width (horizontal) or height (vertical).

---

## 5. Interactions

### 5.1 User Actions

| Action           | Trigger                  | Result                                     |
|------------------|--------------------------|--------------------------------------------|
| Drag divider     | Pointer drag             | Updates split position in real time.        |
| Click container  | Pointer down             | Jumps divider to click position.            |
| Arrow keys       | Left/Right (horizontal)  | Adjusts position by 1%.                     |
| Arrow keys       | Up/Down (vertical)       | Adjusts position by 1%.                     |

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

External network access is required for image URLs. The host application's CSP must allow `img-src` for all image origins referenced by `before.url` and `after.url`.

---

## 9. Accessibility

- Container has `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-orientation`.
- Container is focusable via `tabIndex={0}`.
- Keyboard support: arrow keys adjust position by 1%.
- Cursor changes to `col-resize` (horizontal) or `row-resize` (vertical) to indicate draggable axis.
- Both images have `alt` attributes.
- Images have `draggable={false}` to prevent native drag interference.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `CompareRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid CompareContent with required fields only.
- Accepts full CompareContent with all optional fields.
- Accepts both horizontal and vertical orientations.
- Accepts initialPosition at boundaries (0, 50, 100).
- Rejects initialPosition out of range (>100 or <0).
- Rejects missing before image.
- Rejects missing after image.
- Rejects wrong type.
- Rejects missing version.
- Rejects invalid orientation.
- Accepts labels with only before or only after.
- Accepts unknown additional fields.

### Rendering

- Title renders as h1 when provided.
- Both images render in the container.
- Divider line and grab handle render at position.
- Labels render as overlay badges when provided.
- Caption bar renders when captions are provided.
- Horizontal orientation clips before image width.
- Vertical orientation clips before image height.

### Interaction

- Dragging updates slider position.
- Clicking container jumps to click position.
- Arrow keys adjust position by 1%.
- Position is clamped to 0-100 range.

### Theme

- Uses theme tokens for all colours.
- Grab handle uses `bg-background` and `border-primary`.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/compare/src/Compare.stories.tsx`

| Story         | Description                                              |
|---------------|----------------------------------------------------------|
| BeforeAfter   | Horizontal slider with placeholder images and labels     |
| VerticalSplit | Vertical orientation with labels                         |
| WithCaptions  | Title, captions on both images, and labels               |
