# Component Spec: @chuk/view-settings

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-settings`                                                 |
| Type        | `settings`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Configuration panel View with grouped setting sections, typed field controls (toggle, select, text, number, slider, radio, color), collapsible sections with animated expand/collapse, save/reset footer with dirty state tracking, and optional auto-save mode. |

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

### 3.1 Root -- `SettingsContent`

```typescript
interface SettingsContent {
  type: "settings";
  version: "1.0";
  title?: string;
  sections: SettingsSection[];
  saveTool?: string;
  autoSave?: boolean;
}

interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  fields: SettingsField[];
}

interface SettingsField {
  id: string;
  label: string;
  description?: string;
  type: "toggle" | "select" | "text" | "number" | "slider" | "radio" | "color";
  value: unknown;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}
```

### 3.2 Defaults

| Field       | Default                     |
|-------------|-----------------------------|
| `title`     | none (header omitted)       |
| `autoSave`  | `false`                     |
| `collapsed` | `false`                     |
| `min`       | `0` (for slider)            |
| `max`       | `100` (for slider)          |
| `step`      | `1` (for slider)            |

---

## 4. Rendering

### 4.1 Layout

Root container uses `h-full flex flex-col font-sans text-foreground bg-background`. Optional title header at top. ScrollArea wraps the section cards for overflow. Each section renders as a Card with CardHeader (title, description) and CardContent with field rows. Footer bar with Save/Reset buttons is pinned at the bottom (hidden when `autoSave` is true).

### 4.2 Section Cards

Each section is a Card. Collapsible sections show a chevron indicator in the header. Clicking the header toggles collapse. Collapse/expand is animated using `AnimatePresence` with the `collapseExpand` variant from `@chuk/view-ui/animations`.

### 4.3 Field Rows

Each field row has label and optional description on the left, and the appropriate control on the right. Fields are separated by a `Separator` component.

### 4.4 Controls

| Field Type | Control Component                        |
|------------|------------------------------------------|
| `toggle`   | `Checkbox`                               |
| `select`   | `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` |
| `text`     | `Input` (type="text")                    |
| `number`   | `Input` (type="number")                  |
| `slider`   | `Slider` with numeric value display      |
| `radio`    | `RadioGroup` + `RadioGroupItem`          |
| `color`    | Native `<input type="color" />`          |

### 4.5 Footer

When `autoSave` is false, a footer bar is displayed with Save and Reset buttons. Save is disabled when there are no unsaved changes or when saving is in progress. An "Unsaved changes" indicator is shown when the form is dirty. Save calls `onCallTool(saveTool, allValues)`.

### 4.6 Auto-Save

When `autoSave` is true, changes are debounced (500ms) and automatically sent via `onCallTool(saveTool, allValues)`. The footer is hidden.

---

## 5. Interactions

### 5.1 User Actions

| Action             | Trigger              | Result                                          |
|--------------------|----------------------|-------------------------------------------------|
| Change field       | Interact with control | Updates local state; triggers auto-save if enabled. |
| Toggle section     | Click section header  | Collapses/expands section (if collapsible).      |
| Save               | Click Save button     | Calls `onCallTool(saveTool, allValues)`.         |
| Reset              | Click Reset button    | Restores all fields to their initial values.     |

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

No external resources loaded. Native color input is used for the color picker. No iframes or scripts.

---

## 9. Accessibility

- All controls use semantic elements (Checkbox, Select, RadioGroup, Input, Slider).
- Labels are associated with controls via adjacent layout.
- Collapsible sections use cursor pointer and chevron indicator for affordance.
- Disabled fields use the `disabled` attribute on native controls.
- Colour is never the sole indicator of state.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid SettingsContent with one section and one field.
- Accepts all field types (toggle, select, text, number, slider, radio, color).
- Accepts optional title, saveTool, autoSave, description, collapsible, collapsed.
- Rejects missing sections.
- Rejects section missing id, title, or fields.
- Rejects field missing id, label, type, or value.
- Rejects invalid field type value.
- Rejects wrong type literal.
- Accepts unknown additional fields.

### Rendering

- Sections render as separate cards with correct titles and descriptions.
- Collapsible sections toggle between expanded and collapsed states.
- Each field type renders the correct control widget.
- Dirty state indicator appears when values differ from initial.
- Save button calls onCallTool with current values.
- Reset button restores initial values.
- Auto-save mode hides footer and debounces save calls.

### Theme

- Uses theme tokens for all colours (bg-background, text-foreground, text-muted-foreground, border-border, bg-primary).

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/settings/src/Settings.stories.tsx`

| Story           | Description                                             |
|-----------------|---------------------------------------------------------|
| DisplaySettings | Two collapsible sections (Appearance + Notifications)   |
| MapSettings     | Single section with radio, select, toggle, slider, color |
| AutoSave        | Single section with autoSave=true, no save button       |
