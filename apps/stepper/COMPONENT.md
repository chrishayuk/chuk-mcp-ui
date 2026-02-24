# Component Spec: @chuk/view-stepper

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-stepper`                                                  |
| Type        | `stepper`                                                             |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Multi-step progress indicator View with horizontal or vertical layout, step status indicators, active step detail area, and optional step navigation via tool calls. |

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

### 3.1 Root -- `StepperContent`

```typescript
interface StepperContent {
  type: "stepper";
  version: "1.0";
  title?: string;
  steps: Step[];
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  allowNavigation?: boolean;
  stepTool?: string;
}

interface Step {
  id: string;
  label: string;
  description?: string;
  status?: "pending" | "active" | "completed" | "error" | "skipped";
  icon?: string;
  detail?: string;
}
```

### 3.2 Defaults

| Field           | Default        |
|-----------------|----------------|
| `title`         | _(none)_       |
| `orientation`   | `"horizontal"` |
| `allowNavigation` | `false`      |
| `status`        | `"pending"`    |

---

## 4. Rendering

### 4.1 Layout

Card layout with max-width 700px. Optional title at top. Step indicator in either horizontal or vertical orientation. Active step detail area with collapse/expand animation.

### 4.2 Horizontal Mode

Flex row of step circles (32px) connected by horizontal lines (`border-t-2`). Completed steps use emerald connector lines. Labels and optional descriptions appear centered below each circle.

### 4.3 Vertical Mode

Left-aligned column with vertical connector lines (`border-l-2`) between circles. Labels and descriptions appear to the right of each circle. Uses staggered list animation.

### 4.4 Step Circle Indicators

| Status      | Appearance                                      |
|-------------|-------------------------------------------------|
| `completed` | Emerald-500 filled circle with checkmark SVG    |
| `error`     | Red-500 filled circle with X SVG               |
| `active`    | Primary-color filled circle with step number    |
| `skipped`   | Muted filled circle with diagonal line SVG      |
| `pending`   | Border-only outline circle with step number     |

### 4.5 Active Step Detail

When the active step has a `detail` field, a muted-background panel appears below the step indicator with `collapseExpand` animation. Shows step label and detail text.

---

## 5. Interactions

### 5.1 User Actions

| Action       | Trigger         | Result                                                        |
|--------------|-----------------|---------------------------------------------------------------|
| Click step   | Click circle    | Calls `onCallTool(stepTool, { stepId, stepIndex })` when `allowNavigation` and `stepTool` are set. |

### 5.2 Navigation Guard

Step circles use the `pressable` animation variant only when `allowNavigation` is `true` and `stepTool` is provided. Otherwise, circles are non-interactive `<div>` elements.

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

No external resources loaded. All rendering is self-contained with inline SVGs.

---

## 9. Accessibility

- Step indicator uses `role="list"` with `role="listitem"` on each step.
- Active step marked with `aria-current="step"`.
- Interactive step circles are `<button>` elements with descriptive `aria-label`.
- Non-interactive circles are `<div>` elements with `aria-hidden="true"`.
- Status conveyed by both visual indicator (colour/icon) and structural semantics.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/stepper/src/ssr-entry.tsx`
- **Renders:** `StepperRenderer` via `renderToString`
- **Config:** `apps/stepper/vite.config.ssr.ts`
- **Output:** `apps/stepper/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts valid StepperContent with steps array and activeStep.
- Accepts all step status values (pending, active, completed, error, skipped).
- Accepts both orientations (horizontal, vertical).
- Accepts optional title, description, detail, icon, allowNavigation, stepTool.
- Rejects missing steps.
- Rejects missing activeStep.
- Rejects step missing id or label.
- Rejects invalid status value.
- Rejects invalid orientation value.
- Rejects wrong type literal.

### Rendering

- Horizontal mode renders circles connected by lines.
- Vertical mode renders circles with vertical connectors.
- Completed steps show checkmark icon.
- Error steps show X icon.
- Active step detail panel appears with animation.
- Interactive mode renders buttons; non-interactive renders divs.

### Theme

- Uses theme tokens for all colours (bg-background, text-foreground, bg-primary, text-primary-foreground, bg-muted, text-muted-foreground, border-border).
- Dark mode supported via `dark:` variants on status colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/stepper/src/Stepper.stories.tsx`

| Story              | Description                                                         |
|--------------------|---------------------------------------------------------------------|
| HorizontalWizard   | 5 steps (2 completed, 1 active, 2 pending), horizontal layout      |
| VerticalPipeline   | 4 steps with mixed statuses (completed, active, error, pending), vertical layout with descriptions |
| Interactive        | 6 steps, allowNavigation=true with stepTool, all pending except first active |
