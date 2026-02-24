# Component Spec: @chuk/view-filter

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-filter`                                                   |
| Type        | `filter`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Standalone filter bar View for MCP Apps. Renders a configurable bar of filter controls (text, select, multi-select, date-range, number-range, toggle, checkbox-group) with layout modes, instant or deferred submit, reset capability, and cross-view bus broadcasting via `useViewFilter`. |

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
| `useViewFilter` | Cross-view filter bus broadcasting |

---

## 3. Schema

### 3.1 Root -- `FilterContent`

```typescript
interface FilterContent {
  type: "filter";
  version: "1.0";
  title?: string;
  filters: FilterField[];
  layout?: "horizontal" | "vertical" | "wrap";
  submitMode?: "instant" | "button";
  resetLabel?: string;
}

interface FilterField {
  id: string;
  label: string;
  type: "text" | "select" | "multi-select" | "date-range" | "number-range" | "toggle" | "checkbox-group";
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  defaultValue?: unknown;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
```

### 3.2 Defaults

| Field        | Default                       |
|--------------|-------------------------------|
| `title`      | none (header omitted)         |
| `layout`     | `"horizontal"`                |
| `submitMode` | `"instant"`                   |
| `resetLabel` | `"Reset"`                     |
| `defaultValue` | type-specific (empty string, false, empty array, `{from:"",to:""}`) |

---

## 4. Rendering

### 4.1 Layout

Root container uses `h-full font-sans text-foreground bg-background p-4`. Content is wrapped in a single Card. Optional title renders as an `h2` within the card. Filter controls are laid out according to the `layout` property.

### 4.2 Layout Modes

| Mode         | CSS                                |
|--------------|------------------------------------|
| `horizontal` | `flex flex-row items-end`          |
| `vertical`   | `flex flex-col`                    |
| `wrap`       | `flex flex-row flex-wrap items-end` |

### 4.3 Controls

| Field Type       | Control Component(s)                                         |
|------------------|--------------------------------------------------------------|
| `text`           | `Input` (type="text")                                        |
| `select`         | `Select` + `SelectTrigger` + `SelectContent` + `SelectItem`  |
| `multi-select`   | Multiple `Checkbox` components with labels                    |
| `date-range`     | Two `Input` (type="date") with "to" separator                |
| `number-range`   | `Slider` (if min/max provided) or two `Input` (type="number")|
| `toggle`         | `Checkbox` (styled as toggle)                                |
| `checkbox-group` | Multiple `Checkbox` components with labels                    |

Options with a `count` property render a Badge alongside the label.

### 4.4 Submit Modes

- **instant**: Every onChange immediately broadcasts via `useViewFilter`. No Apply button shown.
- **button**: Changes accumulate locally. An "Apply" button commits them and broadcasts. Reset reverts to defaults.

### 4.5 Reset

The reset button (label configurable via `resetLabel`) clears all filter values back to their defaults and calls `clearAll` on the bus.

### 4.6 Animation

The filter bar fades in using the `fadeIn` variant from `@chuk/view-ui/animations`.

---

## 5. Interactions

### 5.1 User Actions

| Action           | Trigger             | Result                                              |
|------------------|---------------------|-----------------------------------------------------|
| Change filter    | Interact with control | Updates local state; broadcasts if instant mode.    |
| Apply filters    | Click Apply button    | Commits pending values and broadcasts (button mode).|
| Reset filters    | Click Reset button    | Restores defaults and broadcasts clearAll.          |

### 5.2 Cross-View Bus

The connected `FilterView` uses `useViewFilter` from `@chuk/view-shared` to broadcast filter changes. Each filter field's `id` maps to a bus field name. Sibling Views can subscribe to `filter` messages to react to changes.

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

The filter view broadcasts filter changes via `useViewFilter` on the cross-view
bus. Sibling views can subscribe to `filter` messages to react to value changes.

---

## 8. CSP Requirements

No external resources loaded. No iframes or scripts.

---

## 9. Accessibility

- All controls use semantic elements (Input, Select, Checkbox, Slider).
- Labels are associated with controls via the Label component.
- Date inputs use native `type="date"` for built-in accessibility.
- Badge counts provide additional context for option selection.
- Reset and Apply buttons use the Button component with clear labels.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/filter/src/ssr-entry.tsx`
- **Renders:** `FilterRenderer` via `renderToString`
- **Config:** `apps/filter/vite.config.ssr.ts`
- **Output:** `apps/filter/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation (AJV)

- Accepts minimal valid FilterContent with one text filter.
- Accepts all filter field types (text, select, multi-select, date-range, number-range, toggle, checkbox-group).
- Accepts all top-level optional properties (title, layout, submitMode, resetLabel).
- Accepts select field with options and counts.
- Accepts number-range with min/max.
- Accepts field with defaultValue.
- Rejects missing filters array.
- Rejects filter field missing id, label, or type.
- Rejects invalid filter field type.
- Rejects wrong type literal.
- Rejects invalid layout value.
- Rejects invalid submitMode value.
- Accepts unknown additional fields.
- Accepts all three layout values.

### Zod Validation

- Accepts minimal valid filter.
- Accepts all top-level options.
- Accepts all filter field types.
- Accepts select with options and counts.
- Rejects missing filters, wrong type literal, invalid field type, missing id/label, invalid layout.

### Rendering

- Filter controls render correctly for each field type.
- Layout modes apply correct flex classes.
- Instant mode broadcasts on each change.
- Button mode shows Apply button and defers broadcast.
- Reset restores all defaults.
- Title renders when provided.
- Badge counts appear on options with count property.

### Theme

- Uses theme tokens for all colours (bg-background, text-foreground, text-muted-foreground, border-border).

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/filter/src/Filter.stories.tsx`

| Story          | Description                                              |
|----------------|----------------------------------------------------------|
| SearchFilters  | Text + select + toggle in horizontal layout              |
| ProductFilters | Multi-select + number range (slider) in wrap layout      |
| DateFilters    | Date range + checkbox group in vertical layout           |
| ButtonSubmit   | submitMode="button" with deferred apply and custom reset |
