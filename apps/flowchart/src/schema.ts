export interface FlowchartContent {
  type: "flowchart";
  version: "1.0";
  title?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  direction?: "TB" | "LR";
}

export interface FlowchartNode {
  id: string;
  label: string;
  shape?: "rect" | "diamond" | "ellipse" | "parallelogram";
  color?: string;
}

export interface FlowchartEdge {
  source: string;
  target: string;
  label?: string;
  style?: "solid" | "dashed";
}
