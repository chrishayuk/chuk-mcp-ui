export interface ChartContent {
  type: "chart";
  version: "1.0";
  title?: string;
  subtitle?: string;
  chartType: ChartType;
  data: ChartDataset[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: { position: "top" | "bottom" | "left" | "right" | "none" };
  annotations?: Annotation[];
  interactive?: boolean;
}

export type ChartType =
  | "bar"
  | "line"
  | "scatter"
  | "pie"
  | "doughnut"
  | "area"
  | "radar"
  | "bubble";

export interface ChartDataset {
  label: string;
  values: DataPoint[];
  color?: string;
  backgroundColor?: string;
  fill?: boolean;
  type?: ChartType;
  borderWidth?: number;
  tension?: number;
}

export type DataPoint =
  | number
  | { x: number | string; y: number }
  | { label: string; value: number }
  | { x: number; y: number; r: number };

export interface AxisConfig {
  label?: string;
  type?: "linear" | "logarithmic" | "category" | "time";
  min?: number;
  max?: number;
  stacked?: boolean;
}

export interface Annotation {
  type: "line" | "label";
  axis?: "x" | "y";
  value?: number | string;
  label?: string;
  color?: string;
}
