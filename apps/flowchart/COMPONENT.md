# Component Spec: @chuk/view-flowchart

## 1. Identity

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Name        | `@chuk/view-flowchart`                                                |
| Type        | `flowchart`                                                           |
| Version     | `1.0`                                                                 |
| Category    | Tier 2 -- Specialist                                                  |
| Description | Directed graph flowchart View with auto-layout, multiple node shapes, and edge routing. Pure SVG rendering with Sugiyama-like layered layout. |

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

## 3. Schema

### 3.1 Root -- `FlowchartContent`

```typescript
interface FlowchartContent {
  type: "flowchart";
  version: "1.0";
  title?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  direction?: "TB" | "LR";
}

interface FlowchartNode {
  id: string;
  label: string;
  shape?: "rect" | "diamond" | "ellipse" | "parallelogram";
  color?: string;
}

interface FlowchartEdge {
  source: string;
  target: string;
  label?: string;
  style?: "solid" | "dashed";
}
```

### 3.2 Defaults

| Field        | Default      |
|--------------|--------------|
| `title`      | `undefined`  |
| `direction`  | `"TB"`       |
| `shape`      | `"rect"`     |
| `color`      | shape-based  |
| `style`      | `"solid"`    |

---

## 4. Rendering

### 4.1 Layout

Auto-layout using a simplified Sugiyama algorithm: nodes are assigned to layers via longest-path from roots, then positioned within each layer with even spacing. Supports TB (top-to-bottom) and LR (left-to-right) directions.

### 4.2 Node Shapes

- **rect**: Rounded rectangle (process step)
- **diamond**: Diamond/rhombus (decision point)
- **ellipse**: Oval (start/end terminal)
- **parallelogram**: Skewed rectangle (I/O operation)

### 4.3 Edges

SVG line segments with arrowhead markers. Dashed style available. Optional labels positioned at edge midpoints.

### 4.4 States

| State       | Behaviour                                                               |
|-------------|-------------------------------------------------------------------------|
| Loading     | `<Fallback message="Connecting..." />`                                  |
| Empty       | `<Fallback content={content} />`                                        |
| Populated   | Full flowchart with auto-layout nodes and edges                         |

---

## 5. Interactions

Display-only. No user interactions currently implemented.

---

## 6. Storybook Stories

| Story            | Description                                                    |
|------------------|----------------------------------------------------------------|
| LoginFlow        | User login flow with decision diamonds and error handling      |
| DataPipeline     | LR data processing pipeline: ingest to report                  |
| ApprovalProcess  | Multi-step document approval with parallel rejection paths     |
