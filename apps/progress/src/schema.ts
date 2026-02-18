export interface ProgressContent {
  type: "progress";
  version: "1.0";
  title?: string;
  overall?: number;
  tracks: ProgressTrack[];
}

export interface ProgressTrack {
  id: string;
  label: string;
  value: number;
  max?: number;
  status?: "active" | "complete" | "error" | "pending";
  detail?: string;
}
