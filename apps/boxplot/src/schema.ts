export interface BoxplotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  mean?: number;
}

export interface BoxplotGroup {
  label: string;
  color?: string;
  stats: BoxplotStats;
}

export interface BoxplotContent {
  type: "boxplot";
  version: "1.0";
  title?: string;
  groups: BoxplotGroup[];
  orientation?: "vertical" | "horizontal";
  showOutliers?: boolean;
  yAxis?: { label?: string; min?: number; max?: number };
}
