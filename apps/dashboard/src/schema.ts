export interface DashboardContent {
  type: "dashboard";
  version: "1.0";
  title?: string;
  layout: "split-horizontal" | "split-vertical" | "grid";
  panels: Panel[];
  gap?: string;
}

export interface Panel {
  id: string;
  label?: string;
  viewUrl: string;
  structuredContent: unknown;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
}
