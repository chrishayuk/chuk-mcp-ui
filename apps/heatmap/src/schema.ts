export interface HeatmapAnnotation {
  row: number;
  col: number;
  label: string;
}

export interface HeatmapContent {
  type: "heatmap";
  version: "1.0";
  title?: string;
  rows: string[];
  columns: string[];
  values: number[][];
  colorScale?: "sequential" | "diverging";
  minColor?: string;
  maxColor?: string;
  midColor?: string;
  showValues?: boolean;
  annotations?: HeatmapAnnotation[];
}
