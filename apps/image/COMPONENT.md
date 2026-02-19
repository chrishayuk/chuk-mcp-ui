# Component Spec: @chuk/view-image

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-image`                                                    |
| Type        | `image`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Zoomable image viewer with annotation overlays. Supports single or multi-image galleries with thumbnail navigation, SVG annotation layers (circle, rect, point, text), mouse-wheel zoom, pan when zoomed, double-click zoom, and fullscreen mode. |

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

### 3.1 Root -- `ImageContent`

```typescript
interface ImageContent {
  type: "image";
  version: "1.0";
  title?: string;
  images: ImageItem[];
  activeIndex?: number;
  annotations?: ImageAnnotation[];
  controls?: ImageControls;
}
```

### 3.2 `ImageItem`

```typescript
interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}
```

### 3.3 `ImageAnnotation`

```typescript
interface ImageAnnotation {
  id: string;
  imageId: string;
  type: "circle" | "rect" | "point" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  label?: string;
  color?: string;
  description?: string;
}
```

### 3.4 `ImageControls`

```typescript
interface ImageControls {
  zoom?: boolean;
  fullscreen?: boolean;
  thumbnails?: boolean;
}
```

### 3.5 Defaults

| Field                  | Default                                        |
|------------------------|------------------------------------------------|
| `title`                | `undefined` (toolbar shows zoom controls only) |
| `activeIndex`          | `0`                                            |
| `annotations`          | `[]` (no annotation overlay)                   |
| `controls.zoom`        | `true`                                         |
| `controls.fullscreen`  | `true`                                         |
| `controls.thumbnails`  | `true` (only shown when multiple images exist) |
| `ImageAnnotation.color`| `"#ff3333"`                                    |

---

## 4. Rendering

### 4.1 Layout

The root container is a full-height flex column (`h-full flex flex-col font-sans text-foreground bg-background`).

**Toolbar** (top): A horizontal flex bar with the title (if provided), zoom controls (-, percentage, +, Fit buttons using `Button variant="outline" size="sm"`), and a fullscreen toggle button. Background uses `bg-muted`, text is `13px`, items separated by `gap-2`.

**Image viewport** (main area): A `flex-1 relative overflow-hidden` container. The image is rendered inside a centred absolute div with CSS `transform: scale(zoom) translate(panX, panY)`. An SVG overlay layer sits on top of the image for annotation shapes.

**Thumbnail strip** (bottom, conditional): Shown only when there are multiple images and `controls.thumbnails` is not `false`. A horizontal flex strip with `60px x 60px` thumbnail images. The active thumbnail has `ring-2 ring-primary`; inactive thumbnails have `opacity-60` with `hover:opacity-100`.

**Caption bar** (bottom): Shown when the active image has a `caption`. Rendered as `text-sm text-muted-foreground` with a top border.

### 4.2 Annotation Rendering

Annotations are rendered as SVG elements layered over the image:

| Type     | SVG Element | Behaviour                                           |
|----------|-------------|-----------------------------------------------------|
| `circle` | `<circle>`  | Stroke-only circle at (x, y) with given radius      |
| `rect`   | `<rect>`    | Stroke-only rectangle at (x, y) with given w/h      |
| `point`  | `<circle>`  | Small filled circle (r=6) with adjacent text label   |
| `text`   | `<text>`    | Positioned text element at (x, y)                    |

All annotations include a `<title>` element for native browser tooltip on hover showing the label and description.

### 4.3 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. Falls back to plain text display of raw content. |
| Populated   | Full image viewer with zoom, pan, annotations, and thumbnails.          |
| No images   | Renders `<Fallback message="No images provided" />`.                    |

### 4.4 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Body text colour.                                |
| `--color-background`         | Container background.                            |
| `--color-muted`              | Toolbar and thumbnail strip background.          |
| `--color-muted-foreground`   | Caption text.                                    |
| `--color-border`             | Toolbar, thumbnail, and caption borders.         |
| `--color-primary`            | Active thumbnail ring highlight.                 |

---

## 5. Interactions

### 5.1 User Actions

| Action           | Trigger                          | Result                                                  |
|------------------|----------------------------------|---------------------------------------------------------|
| Zoom in          | Click + button or scroll up      | Increases zoom by 0.25-0.5x (clamped to 5x max)        |
| Zoom out         | Click - button or scroll down    | Decreases zoom by 0.25-0.5x (clamped to 0.5x min)      |
| Fit              | Click Fit button                 | Resets zoom to 1x and pan to (0, 0)                     |
| Double-click     | Double-click on viewport         | Zooms in 2x at the clicked point                        |
| Pan              | Pointer drag when zoomed > 1x    | Moves the image within the viewport (grab/grabbing cursor) |
| Select image     | Click thumbnail                  | Switches active image, resets zoom and pan               |
| Fullscreen       | Click Fullscreen button          | Toggles browser fullscreen on the viewer container       |
| Annotation hover | Hover over SVG annotation        | Shows label and description via native `<title>` tooltip |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`. No progressive
rendering via `ontoolinputpartial`. Image sources are loaded by the browser
once the URL is set.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers. Receives data via the
`postMessage` protocol implemented by `@chuk/view-shared`'s `useView` hook.
The image view registers with `type: "image"` and `version: "1.0"`.

### 7.2 As Parent

Not applicable. The image view does not embed child views.

---

## 8. CSP Requirements

**External network access required.** The `url` fields in `images` typically
point to external image files. The host application's CSP must allow `img-src`
(or `default-src`) for the image source origins.

---

## 9. Accessibility

- Images include `alt` attributes when provided in the schema.
- Thumbnail buttons are focusable and clickable via keyboard.
- Annotation labels are exposed via SVG `<title>` elements for screen readers and browser tooltips.
- Zoom controls use semantic `<button>` elements with visible labels.
- Active thumbnail is visually indicated with a ring highlight.
- The fullscreen toggle provides clear text labels for both states.

---

## 10. Size Budget

| Metric       | Target      |
|--------------|-------------|
| Raw          | < 200 KB    |
| Gzip         | < 60 KB     |

The bundle includes React, framer-motion, and the shared UI component library.
No additional image processing libraries are included since the View relies
on the native `<img>` element and SVG for annotations.

---

## 11. Test Cases

### Schema Validation

- Accepts valid ImageContent with `type`, `version`, and `images`.
- Accepts minimal schema: single image with `id` and `url`.
- Accepts full schema with all optional fields populated.
- Accepts all four annotation types: circle, rect, point, text.
- Accepts multiple images with `activeIndex`.
- Rejects missing `type` field.
- Rejects missing `version` field.
- Rejects missing `images` field.
- Rejects wrong `type` value.
- Rejects wrong `version` value.
- Rejects image item missing `id`.
- Rejects image item missing `url`.
- Rejects annotation missing required fields (`imageId`, `type`, `x`, `y`).
- Rejects invalid annotation `type` value.

### Rendering

- Image element renders with `src` matching active image URL.
- Image element includes `alt` attribute when provided.
- Title renders in toolbar when provided.
- Title is omitted when not provided.
- Zoom controls display current percentage.
- SVG annotations render for the active image only.
- Circle annotation renders as SVG `<circle>` with stroke.
- Rect annotation renders as SVG `<rect>` with stroke.
- Point annotation renders as filled circle with text label.
- Text annotation renders as SVG `<text>` element.
- Thumbnail strip renders when multiple images are present.
- Active thumbnail has `ring-2 ring-primary`.
- Caption bar renders when active image has a caption.

### Interaction

- Mouse wheel changes zoom level.
- Double-click zooms in at the clicked point.
- Pointer drag pans the image when zoomed > 1x.
- Fit button resets zoom to 1x and pan to (0, 0).
- Clicking a thumbnail switches the active image.
- Switching images resets zoom and pan.
- Fullscreen button toggles browser fullscreen.

### Theme

- Container background uses `--color-background`.
- Text colour uses `--color-foreground`.
- Toolbar uses `--color-muted` background.
- Caption text uses `--color-muted-foreground`.

### Composition

- Renders correctly when receiving structuredContent via postMessage from a parent View.
- Handles re-render when parent sends updated structuredContent.
- Handles image list changes by resetting active index.

### Fallback

- Missing `structuredContent` renders plain text from `content`.
- Wrong `type` field renders fallback.
- Incompatible `version` renders fallback with best-effort.
- Disconnected state shows "Connecting..." message.
- Empty images array shows "No images provided" fallback.

### Accessibility

- Images include `alt` attributes.
- Annotations expose labels via `<title>` elements.
- Thumbnail buttons are keyboard-focusable.
- Zoom controls use semantic button elements.

---

## 12. Storybook Stories

Story file: `apps/image/src/Image.stories.tsx`

| Story              | Description                                                         |
|--------------------|---------------------------------------------------------------------|
| AerialPhotography  | Single image with 3 annotations (circle, rect, point) and captions  |
| PhotoGallery       | 5 images with thumbnail strip navigation, captions, no annotations  |
| Annotated          | Single image with 4 annotations of all types, zoom controls enabled |
