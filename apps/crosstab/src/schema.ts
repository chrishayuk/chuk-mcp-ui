export interface CrosstabContent {
  type: "crosstab";
  version: "1.0";
  title?: string;
  rowHeaders: string[];
  columnHeaders: string[];
  values: number[][];
  formatting?: "none" | "heatmap" | "bars" | "percentage";
  colorScale?: ColorScale;
  showTotals?: boolean;
  annotations?: CrosstabAnnotation[];
}

export interface ColorScale {
  min: string;
  max: string;
}

export interface CrosstabAnnotation {
  row: number;
  col: number;
  label?: string;
  highlight?: boolean;
}
