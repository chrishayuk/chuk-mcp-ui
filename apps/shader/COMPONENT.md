# Component Spec: @chuk/view-shader

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-shader`                                                   |
| Type        | `shader`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Specialist                                                            |
| Description | GLSL fragment shader playground with WebGL canvas rendering, source code display with line numbers, and interactive uniform sliders. |

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
| Runtime  | WebGL (browser API)                     | --            |
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

### 3.1 Root -- `ShaderContent`

```typescript
interface ShaderContent {
  type: "shader";
  version: "1.0";
  title?: string;
  description?: string;
  /** Fragment shader GLSL source */
  fragmentShader: string;
  /** Vertex shader (optional, defaults to fullscreen quad) */
  vertexShader?: string;
  /** Custom uniforms to expose */
  uniforms?: ShaderUniform[];
  /** Canvas width (default: 512) */
  width?: number;
  /** Canvas height (default: 512) */
  height?: number;
  /** Auto-animate with iTime uniform */
  animate?: boolean;
}

interface ShaderUniform {
  name: string;
  type: "float" | "vec2" | "vec3" | "vec4" | "int";
  value: number | number[];
  min?: number;
  max?: number;
  label?: string;
}
```

### 3.2 Defaults

| Field          | Default                              |
|----------------|--------------------------------------|
| `title`        | `undefined` (not rendered)           |
| `description`  | `undefined` (not rendered)           |
| `vertexShader` | fullscreen quad vertex shader        |
| `uniforms`     | `undefined` (no sliders)             |
| `width`        | `512`                                |
| `height`       | `512`                                |
| `animate`      | `true`                               |

---

## 4. Rendering

### 4.1 Layout

Side-by-side layout (stacks vertically on narrow viewports). Left: fragment shader source code with line numbers in a bordered panel. Right: WebGL canvas capped at 512px display size. Below: uniform slider controls in a responsive grid.

### 4.2 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders nothing (`null`) while `data` is not available.                 |
| Error       | Displays shader compilation or link errors in a destructive-styled box. |
| Populated   | Full shader display with canvas, source code, and uniform sliders.      |

### 4.3 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--color-foreground`         | Default text colour.                             |
| `--color-background`         | Container background.                            |
| `--color-muted-foreground`   | Line numbers, description text.                  |
| `--color-border`             | Panel borders, canvas border.                    |
| `--color-destructive`        | Shader error text and background.                |

---

## 5. Interactions

### 5.1 User Actions

| Action          | Effect                                                       |
|-----------------|--------------------------------------------------------------|
| Uniform slider  | Updates the corresponding uniform value in real-time.        |
| Mouse move      | Updates `iMouse` uniform with normalised canvas coordinates. |

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

Works inside dashboard, split, and tabs containers.

### 7.2 As Parent

Not applicable.

### 7.3 Cross-View Events

None.

---

## 8. CSP Requirements

None beyond default. WebGL uses the browser canvas API, no external resources.

---

## 9. Accessibility

- Source code displayed with line numbers for readability.
- Uniform sliders use label elements for screen reader accessibility.
- Error messages displayed in a clearly marked error region.

---

## 10. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | --          | TBD                 |

---

## 10b. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** placeholder (WebGL requires browser canvas)
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `placeholder`

---

## 11. Test Cases

### Schema Validation

- Accepts minimal valid shader with only required fields.
- Accepts full shader with all optional fields populated.
- Rejects wrong type literal.
- Rejects missing type.
- Rejects missing version.
- Rejects missing fragmentShader.
- Accepts all uniform types (float, vec2, vec3, vec4, int).
- Rejects invalid uniform type.
- Accepts unknown additional fields.

### Rendering

- Canvas renders with WebGL context.
- Source code displays with line numbers.
- Uniform sliders update values.
- Error state displays compilation errors.

### Theme

- Uses theme tokens for all colours.

### Composition

- Renders correctly via postMessage from parent View.

### Fallback

- Missing structuredContent renders plain text.
- Disconnected state shows nothing (null return).

---

## 12. Storybook Stories

Story file: `apps/shader/src/Shader.stories.tsx`

| Story         | Description                                          |
|---------------|------------------------------------------------------|
| Gradient      | Simple gradient shader with no uniforms              |
| Animated      | Time-based animation with iTime uniform              |
| WithUniforms  | Custom float uniforms with slider controls           |
