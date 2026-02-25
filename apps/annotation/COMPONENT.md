# Component Spec: @chuk/view-annotation

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-annotation`                                               |
| Type        | `annotation`                                                          |
| Version     | `1.0`                                                                 |
| Category    | Tier 3 -- Compound (Phase 6)                                          |
| Description | SVG-based image annotation View that overlays circles, rectangles, arrows, and text labels on a source image. |

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

## 3. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

---

## 4. Schema

### 4.1 Root -- `AnnotationContent`

```typescript
interface AnnotationContent {
  type: "annotation";
  version: "1.0";
  title?: string;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  annotations: Annotation[];
}

type Annotation =
  | CircleAnnotation
  | RectAnnotation
  | ArrowAnnotation
  | TextAnnotation;

interface CircleAnnotation {
  kind: "circle";
  id: string;
  cx: number;
  cy: number;
  r: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

interface RectAnnotation {
  kind: "rect";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

interface ArrowAnnotation {
  kind: "arrow";
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}

interface TextAnnotation {
  kind: "text";
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
  fontSize?: number;
}
```

### 4.2 Defaults

| Field               | Default                                      |
|---------------------|----------------------------------------------|
| `title`             | `undefined` (not rendered)                   |
| `imageWidth`        | `undefined` (derived from natural image size)|
| `imageHeight`       | `undefined` (derived from natural image size)|
| `color` (all kinds) | `var(--chuk-color-primary, #3b82f6)`         |
| `strokeWidth`       | `2`                                          |
| `fontSize` (text)   | `16`                                         |

---

## 5. Rendering

### 5.1 Layout

Full-height Card with optional title header. Image is displayed centered with `max-w-full max-h-full`. An SVG overlay is positioned absolutely over the image, using a viewBox matching the image dimensions. Annotations render as SVG shapes (circles, rects, lines with arrowhead markers, text elements) on top of the image. The SVG uses `preserveAspectRatio="xMidYMid meet"` so annotations scale proportionally with the image.

If `imageWidth` and `imageHeight` are provided in the schema, the SVG overlay renders immediately. Otherwise, the overlay waits for the image `onLoad` event to read `naturalWidth`/`naturalHeight`.

### 5.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `null` while `data` is not available.                           |
| Empty       | Image loads without overlay if no annotations provided.                 |
| Populated   | Image with all annotation shapes rendered as SVG overlay.               |
| Pre-load    | If no explicit dimensions, SVG overlay waits for image load.            |

### 5.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--chuk-color-primary`       | Default annotation colour for all shape types.   |
| `--chuk-font-family`         | Font for text annotations and labels.            |
| `--chuk-color-background`    | Card background.                                 |
| `--chuk-color-text`          | Card title text (`text-foreground`).             |
| `--chuk-color-border`        | Card header border.                              |

---

## 6. Interactions

### 6.1 User Actions

None. The annotation view is display-only. Annotations are non-interactive (`pointer-events-none` on SVG overlay).

### 6.2 Outbound Events (sendMessage)

None.

### 6.3 Server Calls (callServerTool)

None.

### 6.4 Action Templates

None.

---

## 7. Model Context Updates

None.

---

## 8. Display Mode

Not applicable. The View stays inline-only.

---

## 9. Cancellation

Default. No special handling beyond shared Fallback behaviour.

---

## 10. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 11. Composition

### 11.1 As Child

Works inside dashboard, split, and tabs containers. No special cross-view event handling.

### 11.2 As Parent

Not applicable.

### 11.3 Cross-View Events

None.

---

## 12. CSP Requirements

Requires `img-src` allowance for the domain hosting the source image specified in `imageUrl`. If images are served from the same origin or data URIs, no additional CSP is needed.

---

## 13. Accessibility

- Image has `alt` attribute set to `title` or fallback "Annotated image".
- SVG overlay has `role="img"` and `aria-label` describing the annotation layer. It is `pointer-events-none` and decorative.
- Labels on annotations provide textual context for visual shapes.
- Colour is supplemented by labels and shape types, not used as sole indicator.

---

## 14. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | < 150 KB    | TBD                 |

---

## 15. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `AnnotationRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 16. Test Cases

### Schema Validation

- Accepts minimal valid AnnotationContent with imageUrl and empty annotations array.
- Accepts content with all annotation kinds (circle, rect, arrow, text).
- Rejects missing `type` field.
- Rejects missing `imageUrl` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Image renders with correct src attribute.
- SVG overlay viewBox matches provided imageWidth/imageHeight.
- Circle annotation renders at correct cx/cy/r with colour.
- Rect annotation renders at correct x/y/width/height.
- Arrow annotation renders line with arrowhead marker.
- Text annotation renders at correct position with fontSize.
- Labels render above shapes (circle label above circle, rect label above rect).

### Fallback

- Missing `structuredContent` renders null.
- Wrong `type` field renders fallback.
- Without imageWidth/imageHeight, SVG overlay appears after image loads.

---

## 17. Storybook Stories

Story file: `apps/annotation/src/Annotation.stories.tsx`

| Story              | Description                                                      |
|--------------------|------------------------------------------------------------------|
| MedicalScan        | Chest X-ray with circle and rect annotations plus text labels    |
| ArchitecturalPlan  | Floor plan with room rects, arrow connections, and text notes    |
| SatelliteImagery   | Satellite image with circles, arrows, and coordinate text        |
