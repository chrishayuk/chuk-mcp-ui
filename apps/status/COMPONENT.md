# Component Spec: @chuk/view-status

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-status`                                                   |
| Type        | `status`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | System status board View with traffic-light indicators, health summary bar, and overall health badge. Displays service/component status with optional detail text and timestamps. |

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

### 3.1 Root -- `StatusContent`

```typescript
interface StatusContent {
  type: "status";
  version: "1.0";
  title?: string;
  items: StatusItem[];
  summary?: StatusSummary;
}

interface StatusItem {
  id: string;
  label: string;
  status: "ok" | "warning" | "error" | "unknown" | "pending";
  detail?: string;
  lastChecked?: string;
  url?: string;
}

interface StatusSummary {
  ok: number;
  warning: number;
  error: number;
}
```

### 3.2 Defaults

| Field       | Default     |
|-------------|-------------|
| `title`     | `"System Status"` |
| `summary`   | Auto-computed from items |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 600px. Header with title and overall health badge. Summary bar with coloured dots and counts. Separator. Animated item list with status dot, label, status text, detail, and timestamp.

### 4.2 Status Indicators

| Status    | Dot Colour     | Label         |
|-----------|----------------|---------------|
| `ok`      | emerald-500    | Operational   |
| `warning` | amber-500      | Degraded      |
| `error`   | red-500        | Outage        |
| `unknown` | gray-400       | Unknown       |
| `pending` | blue-500+pulse | Checking...   |

### 4.3 Overall Health

Derived from item statuses: any error → "System Outage" (red badge), any warning → "Degraded Performance" (amber badge), otherwise → "All Systems Operational" (green badge).

---

## 5. Interactions

### 5.1 User Actions

| Action      | Trigger      | Result                              |
|-------------|--------------|--------------------------------------|
| Click label | Click URL    | Opens service URL in new tab.        |

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

If `url` fields are provided, links open in new tabs. No external resources loaded.

---

## 9. Accessibility

- Status conveyed by both colour dot and text label.
- Links include `target="_blank"` and `rel="noopener noreferrer"`.
- Summary provides aggregate count of each status level.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/status/src/ssr-entry.tsx`
- **Renders:** `StatusRenderer` via `renderToString`
- **Config:** `apps/status/vite.config.ssr.ts`
- **Output:** `apps/status/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts valid StatusContent with items array.
- Accepts all status values.
- Accepts optional title, summary.
- Rejects missing items.
- Rejects item missing id, label, or status.
- Rejects invalid status value.

### Rendering

- Health badge reflects overall status.
- Summary bar shows correct counts.
- Items render with correct status dots.
- Detail and timestamp render when provided.
- URL items render as links.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/status/src/Status.stories.tsx`

| Story    | Description                                    |
|----------|------------------------------------------------|
| Healthy  | All services operational                        |
| Degraded | Mix of ok, warning, and pending statuses        |
| Outage   | System outage with errors and unknowns          |
