export interface FunnelStage {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, string>;
}

export interface FunnelContent {
  type: "funnel";
  version: "1.0";
  title?: string;
  stages: FunnelStage[];
  showConversion?: boolean;
  orientation?: "vertical" | "horizontal";
}
