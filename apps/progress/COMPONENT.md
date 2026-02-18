# Component Spec: @chuk/view-progress

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-progress`                                                 |
| Type        | `progress`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Multi-track progress View that displays progress bars with status indicators, an optional overall progress bar, and detail text per track. |

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

### 3.1 Root -- `ProgressContent`

```typescript
interface ProgressContent {
  type: "progress";
  version: "1.0";
  title?: string;
  overall?: number;
  tracks: ProgressTrack[];
}

interface ProgressTrack {
  id: string;
  label: string;
  value: number;
  max?: number;
  status?: "active" | "complete" | "error" | "pending";
  detail?: string;
}
```

### 3.2 Defaults

| Field         | Default     |
|---------------|-------------|
| `title`       | `undefined` (not rendered) |
| `overall`     | `undefined` (overall bar not rendered) |
| `track.max`   | `100` |
| `track.status`| `"active"` |
| `track.detail`| `undefined` (not rendered) |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 600px, centered horizontally. Overall progress bar at top (when provided). Track list below with status dot, label, percentage, progress bar, and optional detail text.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />`.                        |
| Empty       | Renders `<Fallback content={content} />`.                              |
| Populated   | Full progress display with animated track list.                         |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Track labels.                                    |
| `--color-background`         | Container background.                            |
| `--color-muted`              | Empty progress bar background.                   |
| `--color-muted-foreground`   | Percentage text, detail text.                    |
| `--color-primary`            | Active status bar and overall bar.               |

### 4.4 Status Colours

| Status    | Bar Colour      | Dot              |
|-----------|-----------------|------------------|
| `active`  | bg-primary      | bg-primary + pulse animation |
| `complete`| bg-emerald-500  | bg-emerald-500   |
| `error`   | bg-red-500      | bg-red-500       |
| `pending` | bg-muted/30     | bg-muted/30      |

---

## 5. Interactions

None. The progress view is display-only. Bar widths animate via CSS `transition: width 0.3s ease`.

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

None.

---

## 9. Accessibility

- Progress bars use semantic div elements with visible percentage text.
- Status indicated by both colour and dot indicator.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts valid ProgressContent with tracks array.
- Accepts all status values.
- Accepts track with custom max.
- Rejects missing tracks.
- Rejects track missing id, label, or value.
- Rejects wrong type.
- Accepts unknown additional fields.

### Rendering

- Overall bar renders when provided.
- Tracks render with correct status colours.
- Progress bars show correct percentage width.
- Detail text renders when provided.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/progress/src/Progress.stories.tsx`

| Story         | Description                                         |
|---------------|-----------------------------------------------------|
| BuildPipeline | Multi-stage build with mixed statuses and overall    |
| FileUpload    | File upload progress with sizes                      |
| WithError     | Migration with error status track                    |
