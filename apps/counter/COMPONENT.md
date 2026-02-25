# Component Spec: @chuk/view-counter

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-counter`                                                  |
| Type        | `counter`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Numeric KPI counter View that displays a formatted value with optional prefix/suffix, delta indicator, sparkline chart, and colour coding. |

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

### 3.1 Root -- `CounterContent`

```typescript
interface CounterContent {
  type: "counter";
  version: "1.0";
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delta?: { value: number; label?: string };
  sparkline?: number[];
  icon?: string;
  color?: "default" | "success" | "warning" | "danger";
}
```

### 3.2 Defaults

| Field       | Default     |
|-------------|-------------|
| `prefix`    | `undefined` |
| `suffix`    | `undefined` |
| `delta`     | `undefined` (not rendered) |
| `sparkline` | `undefined` (not rendered) |
| `icon`      | `undefined` (not rendered) |
| `color`     | `"default"` |

---

## 4. Rendering

### 4.1 Layout

Centered Card with max-width 320px. Value displayed as 4xl bold text. Label below in sm muted text. Delta below label with up/down triangle indicator. Sparkline as SVG polyline (120x32px) at the bottom.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Populated   | Full counter display with formatted value, delta, and sparkline.        |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Default value text colour.                       |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Label text, delta label text.                    |

### 4.4 Colour Coding

| Color     | Value Text                  | Background                              | Delta                                    |
|-----------|-----------------------------|-----------------------------------------|------------------------------------------|
| `default` | text-foreground             | bg-background                           | text-muted-foreground                    |
| `success` | text-emerald-700            | bg-emerald-50                           | text-emerald-600                         |
| `warning` | text-amber-700              | bg-amber-50                             | text-amber-600                           |
| `danger`  | text-red-700                | bg-red-50                               | text-red-600                             |

---

## 5. Interactions

### 5.1 User Actions

None. The counter is display-only.

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

Works inside dashboard, split, and tabs containers. Particularly suited for dashboard grid layouts.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- Value formatted with `toLocaleString()` for number grouping.
- Delta direction indicated by visual triangle plus colour.
- Sparkline SVG has `role="img"` and `aria-label` for screen reader accessibility.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `CounterRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts valid CounterContent with value and label.
- Accepts all color options.
- Accepts negative value and delta.
- Accepts zero value.
- Rejects missing value.
- Rejects missing label.
- Rejects wrong type.
- Rejects invalid color.
- Accepts unknown additional fields.

### Rendering

- Value displays with prefix and suffix.
- Delta shows with correct direction indicator.
- Sparkline renders as SVG.
- Colour coding applies correct classes.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/counter/src/Counter.stories.tsx`

| Story    | Description                                        |
|----------|----------------------------------------------------|
| Revenue  | Success color with prefix, delta, sparkline        |
| Errors   | Danger color with suffix and negative delta         |
| Simple   | Minimal counter with just value and label           |
