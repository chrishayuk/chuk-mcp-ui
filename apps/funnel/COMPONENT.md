# Component Spec: @chuk/view-funnel

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-funnel`                                                   |
| Type        | `funnel`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 3 -- Compound (Phase 6)                                          |
| Description | SVG funnel visualization with trapezoid stages, optional conversion rates between stages, and metadata display. |

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

### 4.1 Root -- `FunnelContent`

```typescript
interface FunnelContent {
  type: "funnel";
  version: "1.0";
  title?: string;
  stages: FunnelStage[];
  showConversion?: boolean;
  orientation?: "vertical" | "horizontal";
}

interface FunnelStage {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, string>;
}
```

### 4.2 Defaults

| Field            | Default                                      |
|------------------|----------------------------------------------|
| `title`          | `undefined` (not rendered)                   |
| `showConversion` | `false`                                      |
| `orientation`    | `"vertical"` (currently only vertical is rendered) |
| `color`          | Cycles through 8-colour gradient palette     |
| `metadata`       | `undefined` (not rendered)                   |

---

## 5. Rendering

### 5.1 Layout

Centred Card within a flex container, max-width 520px. SVG funnel with viewBox width of 400. Each stage renders as a trapezoid polygon: the top width is proportional to the stage value relative to the first (maximum) stage, and the bottom width matches the next stage's proportional width. Minimum width ratio is 15% to keep the narrowest stage visible.

Stage height is 48px with 6px gaps. Each trapezoid shows centred label text (bold, 12px) and formatted value text below it (10px, 70% opacity). When `showConversion` is true, conversion percentage text appears between consecutive stages.

Below the SVG, if any stage has `metadata`, a metadata section renders key-value pairs grouped by stage label.

### 5.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `null` while `data` is not available.                           |
| Empty       | Empty SVG if stages array is empty.                                     |
| Populated   | Full funnel with trapezoids, labels, values, and optional conversions.  |

### 5.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--chuk-font-family`         | All text in funnel.                              |
| `--chuk-color-background`    | Page background.                                 |
| `--chuk-color-text`          | Stage label and value text (`fill-foreground`).  |
| `--chuk-color-text-secondary`| Title text, conversion rate text, metadata text. |
| `--chuk-color-surface`       | Card surface.                                    |
| `--chuk-color-border`        | Card border.                                     |

---

## 6. Interactions

### 6.1 User Actions

None. The funnel is display-only.

### 6.2 Outbound Events (sendMessage)

None.

### 6.3 Server Calls (callServerTool)

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

Works inside dashboard, split, and tabs containers. Suited for dashboard grid layouts alongside counter and gauge views for conversion metrics.

### 11.2 As Parent

Not applicable.

### 11.3 Cross-View Events

None.

---

## 12. CSP Requirements

None.

---

## 13. Accessibility

- SVG has `role="img"` and `aria-label` set to title or fallback "Funnel chart".
- Values are formatted with `Intl.NumberFormat` for locale-aware number display.
- Colour is supplemented by text labels and values on each stage.

---

## 14. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | < 150 KB    | TBD                 |

---

## 15. SSR Entry

- **File:** `apps/funnel/src/ssr-entry.tsx`
- **Renders:** `FunnelRenderer` via `renderToString`
- **Config:** `apps/funnel/vite.config.ssr.ts`
- **Output:** `apps/funnel/dist-ssr/ssr-entry.js`

---

## 16. Test Cases

### Schema Validation

- Accepts minimal valid FunnelContent with empty stages array.
- Accepts funnel with all fields including showConversion and metadata.
- Rejects missing `type` field.
- Rejects missing `stages` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Trapezoid widths are proportional to stage values.
- First stage is widest, last stage is narrowest.
- Minimum width ratio (15%) prevents invisible stages.
- Conversion percentages render between stages when `showConversion` is true.
- Conversion percentages are hidden when `showConversion` is false or omitted.
- Metadata section renders key-value pairs for stages that have metadata.
- Title renders centred above funnel when provided.
- Values are formatted with locale-aware number formatting.

### Fallback

- Missing `structuredContent` renders null.
- Wrong `type` field renders fallback.

---

## 17. Storybook Stories

Story file: `apps/funnel/src/Funnel.stories.tsx`

| Story              | Description                                                      |
|--------------------|------------------------------------------------------------------|
| SalesConversion    | 5-stage sales funnel with conversion rates enabled               |
| RecruitmentPipeline| Recruitment hiring funnel without conversion rates               |
| WithMetadata       | E-commerce funnel with metadata key-value pairs per stage        |
