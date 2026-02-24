# Component Spec: @chuk/view-terminal

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-terminal`                                                 |
| Type        | `terminal`                                                            |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Terminal with ANSI Colors View. Monospace output with SGR escape code rendering, theme presets, auto-scroll, and optional line numbers. |

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

### 3.1 Root -- `TerminalContent`

```typescript
interface TerminalContent {
  type: "terminal";
  version: "1.0";
  title?: string;
  lines: TerminalLine[];
  scrollback?: number;
  fontSize?: "xs" | "sm" | "md" | "lg";
  showLineNumbers?: boolean;
  theme?: "dark" | "light" | "green" | "amber";
}

interface TerminalLine {
  text: string;
  timestamp?: string;
}
```

### 3.2 Defaults

| Field            | Default  |
|------------------|----------|
| `title`          | none     |
| `scrollback`     | unlimited |
| `fontSize`       | `"sm"`   |
| `showLineNumbers`| `false`  |
| `theme`          | `"dark"` |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column with monospace `<pre>` in a ScrollArea. Optional header with title. Footer with line count and pause indicator.

### 4.2 ANSI SGR Parser

Custom parser (~80 lines) converts ANSI escape codes to styled `<span>` elements using Tailwind classes. Supports:

- Standard foreground colours (30-37, 90-97)
- Standard background colours (40-47, 100-107)
- Bold (1), dim (2), italic (3), underline (4)
- Reset (0) and individual attribute resets (22, 23, 24, 39, 49)

### 4.3 Theme Presets

| Theme   | Background | Text         |
|---------|-----------|--------------|
| `dark`  | black     | gray-200     |
| `light` | white     | gray-900     |
| `green` | black     | green-400    |
| `amber` | black     | amber-400    |

### 4.4 Auto-Scroll

Auto-scrolls to bottom when new lines arrive. Pauses when user scrolls up (>32px from bottom). Resume button shown in footer when paused.

### 4.5 Line Numbers

Optional gutter with right-aligned line numbers. Gutter width adjusts to accommodate the total line count.

---

## 5. Interactions

### 5.1 User Actions

| Action       | Trigger       | Result                              |
|--------------|---------------|--------------------------------------|
| Scroll up    | Mouse/touch   | Pauses auto-scroll                   |
| Resume       | Click button  | Resumes auto-scroll, scrolls to end  |

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

Auto-scroll behaviour supports streaming: new lines appended to the `lines` array cause automatic scroll-to-bottom unless the user has scrolled up.

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

No external resources loaded. All rendering is inline.

---

## 9. Accessibility

- Monospace `<pre>` preserves whitespace formatting.
- Line numbers use `select-none` to prevent copy.
- Footer provides line count context.
- Colour information in ANSI output is decorative; text content remains readable without colour.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **File:** `apps/terminal/src/ssr-entry.tsx`
- **Renders:** `TerminalRenderer` via `renderToString`
- **Config:** `apps/terminal/vite.config.ssr.ts`
- **Output:** `apps/terminal/dist-ssr/ssr-entry.js`

---

## 11. Test Cases

### Schema Validation

- Accepts valid TerminalContent with lines array.
- Accepts all fontSize values.
- Accepts all theme values.
- Accepts lines with and without timestamps.
- Rejects missing lines.
- Rejects line missing text.
- Rejects invalid fontSize/theme values.

### Rendering

- Lines render in monospace pre block.
- ANSI escape codes render as coloured spans.
- Theme classes applied to container.
- Line numbers shown when enabled.
- Scrollback limits visible lines.
- Auto-scroll works on new lines.

### Theme

- Uses theme tokens via Tailwind classes.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/terminal/src/Terminal.stories.tsx`

| Story          | Description                                         |
|----------------|-----------------------------------------------------|
| BasicOutput    | Build output with basic ANSI formatting             |
| AnsiColors     | Full demonstration of ANSI colour and style codes   |
| GreenTheme     | Green-on-black retro theme with system monitor      |
| AmberTheme     | Amber-on-black retro mainframe theme                |
| LightTheme     | Light theme with test results output                |
| WithScrollback | Scrollback-limited output with many lines           |
