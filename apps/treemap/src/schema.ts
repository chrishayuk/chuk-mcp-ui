export interface TreemapNode {
  id: string;
  label: string;
  value?: number;
  color?: string;
  children?: TreemapNode[];
  metadata?: Record<string, string>;
}

export interface TreemapContent {
  type: "treemap";
  version: "1.0";
  title?: string;
  root: TreemapNode;
  colorField?: string;
  showLabels?: boolean;
  interactive?: boolean;
}
