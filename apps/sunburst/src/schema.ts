export interface SunburstNode {
  id: string;
  label: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}

export interface SunburstContent {
  type: "sunburst";
  version: "1.0";
  title?: string;
  root: SunburstNode;
  showLabels?: boolean;
  interactive?: boolean;
}
