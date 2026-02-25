# Component Spec: @chuk/view-neural

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-neural`                                                   |
| Type        | `neural`                                                              |
| Version     | `1.0`                                                                 |
| Category    | Tier 3 -- Compound (Phase 6)                                          |
| Description | SVG neural network architecture diagram showing layers as columns of nodes with inter-layer connections, layer type labels, and activation functions. |

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

---

## 3. Hook Dependencies

| Hook | Purpose |
|------|---------|
| `useView` | MCP protocol connection, data, theme |

---

## 4. Schema

### 4.1 Root -- `NeuralContent`

```typescript
interface NeuralContent {
  type: "neural";
  version: "1.0";
  title?: string;
  layers: NeuralLayer[];
  showWeights?: boolean;
}

interface NeuralLayer {
  name: string;
  type: "input" | "dense" | "conv" | "pooling" | "dropout" | "output";
  units: number;
  activation?: string;
  color?: string;
}
```

### 4.2 Defaults

| Field          | Default                                       |
|----------------|-----------------------------------------------|
| `title`        | `undefined` (not rendered)                    |
| `showWeights`  | `false`                                       |
| `activation`   | `undefined` (not rendered)                    |
| `color`        | Type-based: input=#3b82f6, dense=#22c55e, conv=#8b5cf6, pooling=#f59e0b, dropout=#6b7280, output=#ef4444 |

---

## 5. Rendering

### 5.1 Layout

Centred Card within a flex container, max-width 700px. SVG with dynamic viewBox based on number of layers and maximum visible nodes. Layers are arranged left-to-right with 100px gaps (`LAYER_GAP`). Each layer displays up to 8 visible nodes (`MAX_VISIBLE_NODES`) as circles with 10px radius and 28px vertical gap.

Layers with more than 8 units show the top half of visible nodes, an ellipsis ("..."), and the bottom half. All layers are vertically centred relative to the tallest layer.

### 5.2 Connections

SVG `<line>` elements connect every non-ellipsis node in layer N to every non-ellipsis node in layer N+1 (fully connected). Connection stroke width is 0.5 at 20% opacity normally, or 1.5 at 40% opacity when `showWeights` is true.

### 5.3 Labels

Below each column of nodes, three lines of text:
1. Layer name (10px, bold)
2. Layer type and unit count, e.g., "dense (128)" (9px, muted)
3. Activation function if provided, e.g., "relu" (8px, italic, muted)

### 5.4 Type Colours

| Layer Type | Default Colour |
|-----------|---------------|
| input     | `#3b82f6`     |
| dense     | `#22c55e`     |
| conv      | `#8b5cf6`     |
| pooling   | `#f59e0b`     |
| dropout   | `#6b7280`     |
| output    | `#ef4444`     |

### 5.5 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | Renders `null` while `data` is not available.                           |
| Empty       | Empty SVG if layers array is empty.                                     |
| Populated   | Full neural network diagram with nodes, connections, and labels.        |

### 5.6 Theme

| CSS Variable                 | Usage                                           |
|------------------------------|-------------------------------------------------|
| `--chuk-font-family`         | All text in diagram.                             |
| `--chuk-color-background`    | Page background.                                 |
| `--chuk-color-text`          | Layer name text (`fill-foreground`).             |
| `--chuk-color-text-secondary`| Type/units text, activation text, connections, ellipsis (`fill-muted-foreground`). |
| `--chuk-color-surface`       | Card surface.                                    |
| `--chuk-color-border`        | Card border.                                     |

---

## 6. Interactions

### 6.1 User Actions

None. The neural network diagram is display-only.

### 6.2 Outbound Events (sendMessage)

None.

### 6.3 Server Calls (callServerTool)

None.

---

## 7. Model Context Updates

None.

---

## 8. Display Mode

Not applicable. The View stays inline-only.

---

## 9. Cancellation

Default. No special handling beyond shared Fallback behaviour.

---

## 10. Streaming

Not implemented. The View renders on full `ontoolresult`.

---

## 11. Composition

### 11.1 As Child

Works inside dashboard, split, and tabs containers. Suited for ML model documentation dashboards.

### 11.2 As Parent

Not applicable.

### 11.3 Cross-View Events

None.

---

## 12. CSP Requirements

None.

---

## 13. Accessibility

- SVG has `role="img"` and `aria-label` set to title or fallback "Neural network diagram".
- Layer labels provide textual context for each column (name, type, unit count).
- Activation functions are displayed as italic text below type labels.
- Colour is supplemented by type labels and positional information.

---

## 14. Size Budget

| Metric       | Target      | Actual              |
|--------------|-------------|---------------------|
| Raw          | < 800 KB    | TBD                 |
| Gzip         | < 150 KB    | TBD                 |

---

## 15. SSR Entry

- **Module:** `packages/ssr/src/ssr-entry.tsx`
- **Renders:** `NeuralRenderer` via `renderToString`
- **Build:** `pnpm run build:ssr`
- **Output:** `packages/ssr/dist/ssr-entry.js`
- **Mode:** `full`

---

## 16. Test Cases

### Schema Validation

- Accepts minimal valid NeuralContent with empty layers array.
- Accepts neural network with all layer types and activations.
- Rejects missing `type` field.
- Rejects missing `layers` field.
- Accepts unknown additional fields (forward compatibility).

### Rendering

- Each layer renders as a column of circles with correct type colour.
- Layers with > 8 units show ellipsis ("...") in the middle.
- Connections draw lines between all visible (non-ellipsis) nodes of adjacent layers.
- `showWeights=true` renders thicker, more opaque connection lines.
- Layer labels show name, type with unit count, and activation function.
- Layers are vertically centred relative to the tallest layer.
- Title renders centred above the diagram when provided.
- Custom layer colour overrides the type-based default.

### Fallback

- Missing `structuredContent` renders null.
- Wrong `type` field renders fallback.

---

## 17. Storybook Stories

Story file: `apps/neural/src/Neural.stories.tsx`

| Story              | Description                                                      |
|--------------------|------------------------------------------------------------------|
| SimpleClassifier   | 4-layer MNIST classifier (784-128-64-10)                         |
| CNN                | 7-layer CNN with conv, pooling, dense, and showWeights enabled   |
| WithActivations    | 6-layer network with relu, tanh, softmax activations and dropout |
