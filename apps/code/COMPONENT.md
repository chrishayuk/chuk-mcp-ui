# Component Spec: @chuk/view-code

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-code`                                                     |
| Type        | `code`                                                                |
| Version     | `1.0`                                                                 |
| Category    | Tier 1 -- Universal                                                   |
| Description | Syntax-highlighted code viewer powered by Shiki. Supports language detection, line numbers, line highlighting, copy-to-clipboard, and theme-aware rendering. |

---

## 2. Dependencies

| Kind     | Dependency                              | Version       |
|----------|-----------------------------------------|---------------|
| Runtime  | React                                   | `^18.3.0`     |
| Runtime  | react-dom                               | `^18.3.0`     |
| Runtime  | `@chuk/view-shared`                     | `workspace:*` |
| Runtime  | `@chuk/view-ui`                         | `workspace:*` |
| Runtime  | shiki                                   | `^3.0.0`      |
| Runtime  | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |
| Build    | vite                                    | `^6.0.0`      |
| Build    | vite-plugin-singlefile                  | `^2.0.0`      |
| Build    | typescript                              | `^5.7.0`      |
| Build    | `@vitejs/plugin-react`                  | `^4.3.0`      |
| Protocol | `@modelcontextprotocol/ext-apps`        | `^1.0.0`      |

---

## 3. Schema

### 3.1 Root -- `CodeContent`

```typescript
interface CodeContent {
  type: "code";
  version: "1.0";
  code: string;
  language?: string;
  title?: string;
  lineNumbers?: boolean;
  highlightLines?: number[];
}
```

### 3.2 Defaults

| Field           | Default     |
|-----------------|-------------|
| `language`      | `"text"` (plain text, no highlighting) |
| `title`         | `undefined` (language badge only in header) |
| `lineNumbers`   | `false` |
| `highlightLines`| `undefined` (no lines highlighted) |

---

## 4. Rendering

### 4.1 Layout

Full-height flex column. Header bar with title, language badge, and copy button. Scrollable code area below. Optional line number gutter on the left (56px wide).

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `<Fallback message="Connecting..." />` while `isConnected` is `false`. |
| Empty       | Renders `<Fallback content={content} />` when connected but `data` is `null`. |
| Highlighting| Shows plain `<pre>` fallback while Shiki loads asynchronously.          |
| Populated   | Full syntax-highlighted code with Shiki HTML output.                    |

### 4.3 Theme

Shiki theme is selected based on `prefers-color-scheme` media query:
- Light: `github-light`
- Dark: `github-dark`

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Header text.                                     |
| `--color-background`         | Container background.                            |
| `--color-muted`              | Language badge background.                       |
| `--color-muted-foreground`   | Line numbers, language badge text.               |
| `--color-border`             | Header bottom border.                            |
| `--color-primary`            | Highlighted line background (10% opacity).       |

---

## 5. Interactions

### 5.1 User Actions

| Action     | Trigger           | Result                                     |
|------------|-------------------|--------------------------------------------|
| Copy code  | Click Copy button | Copies code to clipboard via `navigator.clipboard.writeText()`. Button text changes to "Copied!" for 2 seconds. |
| Scroll     | Mouse wheel       | Scrolls the code area.                     |

### 5.2 Outbound Events (sendMessage)

None currently implemented.

### 5.3 Server Calls (callServerTool)

None currently implemented.

---

## 6. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 7. Composition

### 7.1 As Child

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

---

## 8. CSP Requirements

None. Shiki grammars and themes are bundled inline via `vite-plugin-singlefile`.

---

## 9. Accessibility

- Code is rendered in a `<pre>` element with monospace font.
- Copy button provides clipboard access without manual text selection.
- Line numbers are in a separate non-selectable column.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 1500 KB   | TBD                 |
| Gzip         | --          | TBD                 |

Note: Shiki grammar bundles significantly increase raw size.

---

## 11. Test Cases

### Schema Validation

- Accepts valid CodeContent with code string.
- Accepts optional language, title, lineNumbers, highlightLines.
- Accepts empty code string.
- Rejects missing code.
- Rejects wrong type.
- Rejects missing version.
- Accepts unknown additional fields.

### Rendering

- Code renders in `<pre>` element.
- Shiki highlighting applies when language is provided.
- Line numbers display when enabled.
- Highlighted lines have accent background.
- Title and language badge render in header.
- Copy button shows "Copied!" feedback.

### Theme

- Selects github-light or github-dark based on colour scheme preference.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows "Connecting...".

---

## 12. Storybook Stories

Story file: `apps/code/src/Code.stories.tsx`

| Story      | Description                                       |
|------------|---------------------------------------------------|
| TypeScript | TypeScript code with line numbers                  |
| Python     | Python code with line numbers and highlighted lines|
| JSON       | JSON without line numbers                          |
