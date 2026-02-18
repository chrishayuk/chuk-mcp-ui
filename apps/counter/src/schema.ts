export interface CounterContent {
  type: "counter";
  version: "1.0";
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delta?: CounterDelta;
  sparkline?: number[];
  icon?: string;
  color?: "default" | "success" | "warning" | "danger";
}

export interface CounterDelta {
  value: number;
  label?: string;
}
