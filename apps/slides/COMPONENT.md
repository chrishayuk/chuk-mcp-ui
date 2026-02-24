# Component Spec: @chuk/view-slides

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-slides`                                                   |
| Type        | `slides`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 2 -- Specialist                                                  |
| Description | Slide deck presentation View with keyboard navigation, animated transitions (fade, slide, none), and multiple layout modes (default, center, split, image). |

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

---

## 2b. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme, callTool, requestDisplayMode |

---

## 3. Schema

### 3.1 Root -- `SlidesContent`

```typescript
interface SlidesContent {
  type: "slides";
  version: "1.0";
  title?: string;
  slides: Slide[];
  transition?: "fade" | "slide" | "none";
}

interface Slide {
  title?: string;
  content: string;
  notes?: string;
  background?: string;
  layout?: "default" | "center" | "split" | "image";
  image?: string;
}
```

### 3.2 Defaults

| Field        | Default     |
|--------------|-------------|
| `title`      | `undefined` |
| `transition` | `"fade"`    |
| `layout`     | `"default"` |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column:

1. **Title bar** (conditional): Deck title in muted text.
2. **Slide area**: Fills remaining space. Animated slide transitions via `AnimatePresence`.
3. **Bottom bar**: Previous/Next buttons, navigation dots, and slide counter (e.g., "3 / 10").

### 4.2 Slide Layouts

| Layout    | Description |
|-----------|-------------|
| `default` | Title top-left, content below. Full padding. |
| `center`  | Title and content centered vertically and horizontally. |
| `split`   | Two-column grid: text on left, image on right. |
| `image`   | Full-bleed background image with dark overlay, white text centered. |

### 4.3 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | `<Fallback message="Connecting..." />`                                  |
| Empty       | `<Fallback content={content} />`                                        |
| No slides   | Centered "No slides to display" in muted text.                          |
| Populated   | Full slide deck with navigation controls.                               |

---

## 5. Interactions

| Action           | Trigger                  | Result                                   |
|------------------|--------------------------|------------------------------------------|
| Next slide       | Click "Next" or ArrowRight / Space | Advances to next slide with transition animation. |
| Previous slide   | Click "Previous" or ArrowLeft | Returns to previous slide with transition animation. |
| Go to slide      | Click navigation dot     | Jumps to specific slide.                  |

---

## 5b. Model Context Updates

None. The slides view does not call `updateModelContext`.

---

## 5c. Display Mode

Fullscreen toggle button in top-right corner (`absolute top-2 right-2 z-[1000]`).
Uses semi-transparent background (`bg-background/80 backdrop-blur-sm`).
Toggles between `"inline"` and `"fullscreen"` via `requestDisplayMode()`.
Button label shows "Fullscreen" or "Exit Fullscreen". Only rendered when
`onRequestDisplayMode` is available (host supports it).

---

## 5d. Cancellation

Default. No special handling beyond the shared Fallback behaviour.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Requires full container
height (`html, body, #root { height: 100% }`) for correct slide area sizing.

### 7.2 As Parent

Not applicable. The slides view does not embed other Views.

### 7.3 Cross-View Events

None. The slides view does not emit ViewBus events or listen for messages
from sibling Views.

---

## 8. CSP Requirements

External network access may be required if slide `image` URLs point to
external origins. The host application's CSP must allow `img-src` for
image origins.

---

## 9. Accessibility

- Navigation buttons are native `<button>` elements.
- Navigation dots have `aria-label="Go to slide N"`.
- Keyboard navigation via ArrowLeft, ArrowRight, and Space keys.
- Disabled state on Previous (first slide) and Next (last slide) buttons.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/slides/src/ssr-entry.tsx`
- **Renders:** `SlidesRenderer` via `renderToString`
- **Config:** `apps/slides/vite.config.ssr.ts`
- **Output:** `apps/slides/dist-ssr/ssr-entry.js`

---

## 11. Storybook Stories

Story file: `apps/slides/src/Slides.stories.tsx`

| Story              | Description                                               |
|--------------------|-----------------------------------------------------------|
| Default            | Basic deck with default layout slides                     |
| CenterLayout       | Slides using center layout for key messages               |
| SplitLayout        | Slides with split layout showing text and images          |
| ImageLayout        | Full-bleed image slides with overlay text                 |
