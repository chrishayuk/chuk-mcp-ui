export interface SankeyContent {
  type: "sankey";
  version: "1.0";
  title?: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}
