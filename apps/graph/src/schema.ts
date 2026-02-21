export interface GraphContent {
  type: "graph";
  version: "1.0";
  title?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  color?: string;
  size?: number;
  group?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
  color?: string;
}
