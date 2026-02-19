export interface GaugeThreshold {
  value: number;
  color: string;
  label?: string;
}

export interface GaugeContent {
  type: "gauge";
  version: "1.0";
  title?: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  thresholds?: GaugeThreshold[];
  format?: "number" | "percent";
  size?: "sm" | "md" | "lg";
  subtitle?: string;
}
