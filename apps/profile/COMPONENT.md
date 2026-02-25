# Component Spec: @chuk/view-profile

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-profile`                                                  |
| Type        | `profile`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Elevation/Cross-Section profile View with filled line chart, linear axes, and vertical dashed marker annotations. Suitable for terrain profiles, river cross-sections, geological strata, and any x/y profile data. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | chart.js                                | `^4.4.0`      |
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

### 3.1 Root -- `ProfileContent`

```typescript
interface ProfileContent {
  type: "profile";
  version: "1.0";
  title?: string;
  points: ProfilePoint[];
  xLabel?: string;
  yLabel?: string;
  fill?: boolean;
  color?: string;
  markers?: ProfileMarker[];
}

interface ProfilePoint {
  x: number;
  y: number;
}

interface ProfileMarker {
  x: number;
  label: string;
  color?: string;
  icon?: string;
}
```

### 3.2 Defaults

| Field       | Default           |
|-------------|-------------------|
| `title`     | none              |
| `fill`      | `true`            |
| `color`     | `"#3388ff"`       |
| `xLabel`    | none              |
| `yLabel`    | none              |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 800px. Chart.js line chart rendered into a canvas via `useRef` + `useEffect`. Linear scales on both axes. Points sorted by x-value before rendering.

### 4.2 Profile Line

Filled area chart with 0.2 alpha background. Line tension 0.2 for smooth curves. Point radius 0 (hover radius 4). Border width 2.

### 4.3 Markers

Vertical dashed lines drawn at marker x-positions via a custom Chart.js plugin. Label text rendered above the chart area. Optional icon rendered above the label.

### 4.4 Tooltip

Custom tooltip showing both x and y values with their axis labels.

---

## 5. Interactions

### 5.1 User Actions

| Action      | Trigger        | Result                                   |
|-------------|----------------|------------------------------------------|
| Hover       | Mouse move     | Tooltip shows x/y values at cursor.      |

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

Not implemented.

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

No external resources loaded. Chart.js renders to canvas.

---

## 9. Accessibility

- Chart title displayed via Chart.js title plugin.
- Axis labels provide context for the data.
- Marker labels provide textual annotation of key points.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** Placeholder ("Loading profile...") — Chart.js requires canvas
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `placeholder`

---

## 11. Test Cases

### Schema Validation

- Accepts valid ProfileContent with points array.
- Accepts optional title, xLabel, yLabel, fill, color, markers.
- Rejects missing points.
- Rejects point missing x or y.
- Rejects marker missing x or label.
- Rejects wrong type value.

### Rendering

- Chart renders with correct number of data points.
- Fill area appears when fill is true.
- Markers draw vertical dashed lines.
- Axis labels match xLabel and yLabel.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/profile/src/Profile.stories.tsx`

| Story              | Description                                         |
|--------------------|-----------------------------------------------------|
| MountainPass       | Elevation profile with summit and rest stop markers  |
| RiverCrossSection  | River bed cross-section with deepest point marker    |
| MinimalProfile     | Bare minimum profile without title or markers        |
| GeologicalStratum  | Subsurface geological section with borehole markers  |
