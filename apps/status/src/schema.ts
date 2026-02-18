export interface StatusContent {
  type: "status";
  version: "1.0";
  title?: string;
  items: StatusItem[];
  summary?: StatusSummary;
}

export interface StatusItem {
  id: string;
  label: string;
  status: "ok" | "warning" | "error" | "unknown" | "pending";
  detail?: string;
  lastChecked?: string;
  url?: string;
}

export interface StatusSummary {
  ok: number;
  warning: number;
  error: number;
}
