export interface ScatterContent {
  type: "scatter";
  version: "1.0";
  title?: string;
  subtitle?: string;
  datasets: ScatterDataset[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: { position: "top" | "bottom" | "left" | "right" | "none" };
  zoom?: boolean;
}

export interface ScatterDataset {
  label: string;
  points: ScatterPoint[];
  color?: string;
  pointStyle?: "circle" | "cross" | "rect" | "triangle" | "star";
  pointRadius?: number;
}

export interface ScatterPoint {
  x: number;
  y: number;
  r?: number;
  label?: string;
  metadata?: Record<string, string>;
}

export interface AxisConfig {
  label?: string;
  type?: "linear" | "logarithmic";
  min?: number;
  max?: number;
}
