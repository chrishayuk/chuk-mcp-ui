# Component Spec: @chuk/view-alert

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-alert`                                                    |
| Type        | `alert`                                                               |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Notification/alert cards View with severity-coded card stack, dismiss animation, action buttons, and optional grouping. Displays alerts with coloured left borders indicating severity level. |

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

### 3.1 Root -- `AlertContent`

```typescript
interface AlertContent {
  type: "alert";
  version: "1.0";
  title?: string;
  alerts: AlertItem[];
  groupBy?: "severity" | "category" | "source";
  dismissible?: boolean;
}

interface AlertItem {
  id: string;
  severity: "info" | "success" | "warning" | "error" | "critical";
  title: string;
  message?: string;
  source?: string;
  category?: string;
  timestamp?: string;
  dismissible?: boolean;
  actions?: AlertAction[];
  metadata?: Record<string, string>;
}

interface AlertAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
  variant?: "default" | "destructive";
}
```

### 3.2 Defaults

| Field         | Default                          |
|---------------|----------------------------------|
| `title`       | None (no header rendered)        |
| `groupBy`     | None (flat list)                 |
| `dismissible` | `false`                          |
| `variant`     | `"default"`                      |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column. Header with title and summary counter badges. Separator. ScrollArea with staggered animated card stack. Each card has a coloured left border indicating severity.

### 4.2 Severity Indicators

| Severity   | Left Border     | Dot Colour           | Badge Style                    |
|------------|-----------------|----------------------|--------------------------------|
| `info`     | blue-500        | blue-500             | blue-100/blue-800              |
| `success`  | emerald-500     | emerald-500          | emerald-100/emerald-800        |
| `warning`  | amber-500       | amber-500            | amber-100/amber-800            |
| `error`    | red-500         | red-500              | red-100/red-800                |
| `critical` | red-600         | red-600 + pulse      | red-200/red-900                |

### 4.3 Summary Badges

Counter badges at the top show the count of visible alerts per severity level. Ordered: critical, error, warning, info, success. Only shown when count > 0.

### 4.4 Grouping

When `groupBy` is set, alerts are grouped under uppercase label headers. Group keys: severity uses display labels, category/source use raw values.

### 4.5 Card Structure

Each alert card contains:
- Severity dot (left)
- Title + severity badge (top row)
- Message text (optional)
- Source + timestamp (optional, dot-separated)
- Metadata key-value pairs (optional)
- Action buttons row (optional)
- Dismiss X button (right, when dismissible)

---

## 5. Interactions

### 5.1 User Actions

| Action         | Trigger               | Result                                    |
|----------------|-----------------------|-------------------------------------------|
| Dismiss alert  | Click X button        | Alert collapses out via AnimatePresence    |
| Invoke action  | Click action button   | Calls `callTool(action.tool, action.arguments)` |

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

No external resources loaded. Action buttons invoke MCP tools via postMessage.

---

## 9. Accessibility

- Severity conveyed by both colour indicator and text badge label.
- Dismiss button includes `aria-label` with alert title.
- Summary badges provide aggregate count of each severity level.
- SVG close icon uses stroke-based rendering for screen reader compatibility.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/alert/src/ssr-entry.tsx`
- **Renders:** `AlertRenderer` via `renderToString`
- **Config:** `apps/alert/vite.config.ssr.ts`
- **Output:** `apps/alert/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal AlertContent with alerts array.
- Accepts all severity values.
- Accepts all groupBy values.
- Accepts optional title, dismissible, actions, metadata.
- Rejects missing alerts.
- Rejects missing type.
- Rejects missing version.
- Rejects alert missing id.
- Rejects invalid severity value.
- Accepts unknown additional fields.

### Rendering

- Summary badges reflect visible alert counts.
- Cards render with correct severity border colours.
- Dismiss removes alert from visible list.
- Action buttons trigger callTool.
- Grouping renders group headers.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/alert/src/Alert.stories.tsx`

| Story           | Description                                                 |
|-----------------|-------------------------------------------------------------|
| SystemAlerts    | 6 alerts across all severities with actions and metadata    |
| HeritageAtRisk  | 4 warning/critical alerts about heritage sites with actions |
| Dismissible     | 5 dismissible alerts grouped by severity                    |
