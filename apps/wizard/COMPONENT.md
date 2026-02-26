# Component Spec: @chuk/view-wizard

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-wizard`                                                   |
| Type        | `wizard`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Interactive                                                           |
| Description | Multi-step conditional form wizard with step indicators, animated transitions, per-step validation, conditional step visibility, and submit via callTool + sendMessage. |

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
| `useView` | MCP protocol connection, data, theme, callTool, sendMessage |
| `useViewEvents` | Emits submit event with form values |

---

## 3. Schema

### 3.1 Root -- `WizardContent`

```typescript
interface WizardContent {
  type: "wizard";
  version: "1.0";
  title?: string;
  description?: string;
  steps: WizardStep[];
  initialValues?: Record<string, unknown>;
  submitTool: string;
  submitLabel?: string;
  allowNavigation?: boolean;
}
```

### 3.2 `WizardStep`

```typescript
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  fields: Record<string, WizardFieldSchema>;
  required?: string[];
  condition?: StepCondition;
}
```

### 3.3 `WizardFieldSchema`

```typescript
interface WizardFieldSchema {
  type: "string" | "number" | "integer" | "boolean";
  title?: string;
  description?: string;
  default?: unknown;
  enum?: (string | number)[];
  enumLabels?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  widget?: "text" | "textarea" | "select" | "radio"
         | "checkbox" | "slider" | "date" | "password" | "number";
  placeholder?: string;
  help?: string;
}
```

### 3.4 `StepCondition`

```typescript
interface StepCondition {
  field: string;
  op: "eq" | "neq" | "in" | "gt" | "lt";
  value: unknown;
}
```

### 3.5 Defaults

| Field             | Default                  |
|-------------------|--------------------------|
| `title`           | `undefined`              |
| `description`     | `undefined`              |
| `initialValues`   | `{}`                     |
| `submitLabel`     | `"Submit"`               |
| `allowNavigation` | `false`                  |

---

## 4. Rendering

### 4.1 Layout

Max-width 640px centered container with padding. Title and description at the top. Step indicator row with numbered circles connected by progress bars. Animated form panel below with `AnimatePresence` for step transitions (slide left/right). Navigation buttons (Back / Next / Submit) at the bottom. Step counter text ("Step N of M") below buttons.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Returns `null` while `data` is not yet available from `useView`.        |
| Populated   | Full wizard display with step indicators, form fields, and navigation.  |
| Submitting  | Submit button shows "Submitting..." and is disabled.                    |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Default text colour.                             |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Description text, help text, step counter.        |
| `--color-primary`            | Active/completed step indicator, progress bar.    |
| `--color-primary-foreground` | Step number text on active/completed steps.       |
| `--color-muted`              | Inactive step indicator background.               |
| `--color-border`             | Incomplete progress bar segments.                 |
| `--color-destructive`        | Required asterisk, validation error text.         |

---

## 5. Interactions

### 5.1 User Actions

| Action            | Behaviour                                                              |
|-------------------|------------------------------------------------------------------------|
| Next              | Validates current step fields; advances to next visible step if valid.  |
| Back              | Returns to previous step (no validation).                               |
| Submit            | Validates final step, calls `submitTool` via `callTool`, sends summary via `sendMessage`. |
| Step click        | If `allowNavigation` is true, jumps to any previously completed step.   |
| Field input       | Updates values state, clears field-specific error on change.            |

### 5.2 Outbound Events (sendMessage)

On submit, sends a user message summarising all form values:
```
User completed wizard "<title>": field1: value1, field2: value2, ...
```

### 5.3 Server Calls (callServerTool)

On submit, calls the tool specified by `submitTool` with the collected form values as arguments.

---

## 5b. Model Context Updates

Emits `submit` event via `useViewEvents.emitSubmit(values, submitTool)`.

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

Works inside dashboard, split, and tabs containers. Best suited for focused single-panel layouts.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None.

---

## 9. Accessibility

- Step indicators use numbered buttons with disabled state for future steps.
- Required fields marked with asterisk and appropriate validation messages.
- Form fields use `htmlFor` / `id` pairing for label association.
- Step transitions animated with `AnimatePresence` for visual context.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `WizardRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid wizard (type, version, steps, submitTool).
- Accepts wizard with all root options (title, description, initialValues, submitLabel, allowNavigation).
- Accepts wizard with conditional steps (StepCondition).
- Accepts all field types (string, number, integer, boolean).
- Accepts all widget types (text, textarea, select, radio, checkbox, slider, date, password, number).
- Accepts all condition operators (eq, neq, in, gt, lt).
- Accepts fields with defaults.
- Rejects wrong type.
- Rejects missing type.
- Rejects missing version.
- Rejects missing steps.
- Rejects missing submitTool.
- Rejects step missing id.
- Rejects step missing title.
- Rejects step missing fields.
- Rejects field with invalid type.
- Rejects field with invalid widget.
- Rejects condition with invalid operator.
- Accepts unknown additional fields.

### Rendering

- Step indicators show numbered circles with progress bars.
- Active step animates in with slide transition.
- Back button disabled on first step.
- Submit button appears on last step.
- Conditional steps hidden when condition not met.

### Validation

- Required fields show error on empty submit.
- Number range validation (minimum/maximum).
- String length validation (minLength/maxLength).
- Pattern validation.
- Errors clear on field change.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

---

## 12. Storybook Stories

Story file: `apps/wizard/src/Wizard.stories.tsx`

| Story             | Description                                                  |
|-------------------|--------------------------------------------------------------|
| Registration      | Multi-step user registration with conditional admin step      |
| Survey            | Simple survey wizard with radio and textarea fields           |
| Settings          | Configuration wizard with sliders and checkboxes              |
