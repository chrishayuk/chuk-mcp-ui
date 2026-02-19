# Component Spec: @chuk/view-carousel

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-carousel`                                                 |
| Type        | `carousel`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Image/Content Carousel View with slide/fade transitions, auto-play, dot indicators, and arrow navigation. Supports images, text content, and action buttons per slide. |

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

### 3.1 Root -- `CarouselContent`

```typescript
interface CarouselContent {
  type: "carousel";
  version: "1.0";
  title?: string;
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  transition?: "slide" | "fade";
}

interface CarouselItem {
  id: string;
  image?: { url: string; alt?: string };
  title?: string;
  description?: string;
  action?: CarouselAction;
}

interface CarouselAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}
```

### 3.2 Defaults

| Field              | Default     |
|--------------------|-------------|
| `autoPlay`         | `false`     |
| `autoPlayInterval` | `5000`      |
| `showDots`         | `true`      |
| `showArrows`       | `true`      |
| `loop`             | `true`      |
| `transition`       | `"slide"`   |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column. Optional title bar at top. Main slide area with overflow hidden. Dot indicators at bottom in a border-top muted bar.

### 4.2 Transitions

| Type    | Mechanism                                                |
|---------|----------------------------------------------------------|
| `slide` | CSS `transform: translateX(-N%)` on the slide track      |
| `fade`  | CSS `opacity` toggle with `transition-opacity` on slides |

### 4.3 Navigation

- Arrow buttons absolutely positioned at left/right center of slide area.
- Dot indicators as small circular buttons below the slide area.
- Both respect `loop` setting for boundary behavior.

### 4.4 Auto-Play

- Uses `setInterval` with configurable interval.
- Pauses on mouse hover over the carousel container.
- Resumes when mouse leaves.

---

## 5. Interactions

### 5.1 User Actions

| Action       | Trigger          | Result                                     |
|--------------|------------------|--------------------------------------------|
| Next slide   | Click right arrow| Advances to next slide (wraps if looping)  |
| Prev slide   | Click left arrow | Goes to previous slide (wraps if looping)  |
| Go to slide  | Click dot        | Jumps directly to the selected slide       |
| Pause auto   | Mouse enter      | Pauses auto-play timer                     |
| Resume auto  | Mouse leave      | Resumes auto-play timer                    |
| Slide action | Click action btn | Triggers the configured tool action        |

---

## 6. Streaming

Not implemented.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

---

## 8. CSP Requirements

If `image.url` fields reference external images, the CSP must allow `img-src` for those domains.

---

## 9. Accessibility

- Dot indicators include `aria-label` for screen readers.
- Images include `alt` text when provided.
- Arrow buttons use HTML entities for clear visual indicators.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts valid CarouselContent with items array.
- Accepts both transition types.
- Accepts optional title, autoPlay, showDots, showArrows, loop.
- Rejects missing items.
- Rejects item missing id.
- Rejects invalid transition value.
- Rejects image missing url.
- Rejects action missing required fields.

### Rendering

- Slide transition uses translateX.
- Fade transition uses opacity.
- Arrows navigate between slides.
- Dots indicate active slide.
- Auto-play advances slides.
- Hover pauses auto-play.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/carousel/src/Carousel.stories.tsx`

| Story            | Description                                        |
|------------------|----------------------------------------------------|
| ImageGallery     | Image carousel with slide transition               |
| FadeTransition   | Image carousel with fade transition and actions    |
| AutoPlay         | Auto-playing carousel with hover pause             |
| ContentOnly      | Text-only slides with action buttons, no loop      |
| MinimalNoControls| Single slide with no dots or arrows                |
