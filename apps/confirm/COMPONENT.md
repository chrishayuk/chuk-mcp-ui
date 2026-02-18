# Component Spec: @chuk/view-confirm

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-confirm`                                                  |
| Type        | `confirm`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Confirmation dialog View that presents a message with severity-coloured border, optional details, and confirm/cancel buttons that invoke server tools via `callTool`. |

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

### 3.1 Root -- `ConfirmContent`

```typescript
interface ConfirmContent {
  type: "confirm";
  version: "1.0";
  title: string;
  message: string;
  severity?: "info" | "warning" | "danger";
  details?: Array<{ label: string; value: string }>;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTool?: string;
  confirmArgs?: Record<string, unknown>;
  cancelTool?: string;
  cancelArgs?: Record<string, unknown>;
}
```

### 3.2 Defaults

| Field          | Default       |
|----------------|---------------|
| `severity`     | `"info"`      |
| `details`      | `undefined`   |
| `confirmLabel` | `"Confirm"`   |
| `cancelLabel`  | `"Cancel"`    |
| `confirmTool`  | `undefined`   |
| `cancelTool`   | `undefined`   |

---

## 4. Rendering

### 4.1 Layout

Centered Card with max-width 480px. Left border coloured by severity. Badge shows severity level. Message in muted text. Optional details as label-value rows. Button bar at bottom right with cancel (outline) and confirm (default/destructive).

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />`.                        |
| Empty       | Renders `<Fallback content={content} />`.                              |
| Populated   | Full confirmation dialog.                                               |

### 4.3 Severity Styles

| Severity  | Left Border    | Badge Background | Confirm Button  |
|-----------|----------------|------------------|-----------------|
| `info`    | blue-500       | blue-100         | default         |
| `warning` | amber-500      | amber-100        | default         |
| `danger`  | red-500        | red-100          | destructive     |

---

## 5. Interactions

### 5.1 User Actions

| Action   | Trigger        | Result                                      |
|----------|----------------|----------------------------------------------|
| Confirm  | Click confirm  | Calls `callTool(confirmTool, confirmArgs)`.  |
| Cancel   | Click cancel   | Calls `callTool(cancelTool, cancelArgs)`.    |

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

- Buttons are native `<button>` elements with visible labels.
- Severity conveyed by both colour and text badge.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts minimal confirm with title and message.
- Accepts all severity levels.
- Accepts optional details, labels, tool bindings.
- Rejects missing title or message.
- Rejects wrong type.

### Rendering

- Severity border colour matches severity level.
- Badge shows correct severity label.
- Details render as label-value rows.
- Confirm button is destructive variant for danger severity.

### Interaction

- Confirm button calls callTool with confirmTool and confirmArgs.
- Cancel button calls callTool with cancelTool and cancelArgs.

---

## 12. Storybook Stories

Story file: `apps/confirm/src/Confirm.stories.tsx`

| Story        | Description                                     |
|--------------|-------------------------------------------------|
| DangerDelete | Danger severity with details and tool bindings   |
| Warning      | Warning severity with billing details            |
| Info         | Info severity with simple confirmation           |
