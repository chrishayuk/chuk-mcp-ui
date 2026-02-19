export interface TimelineContent {
  type: "timeline";
  version: "1.0";
  title?: string;
  events: TimelineEvent[];
  groups?: TimelineGroup[];
  orientation?: "vertical" | "horizontal";
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  group?: string;
  icon?: string;
  color?: string;
  severity?: "info" | "success" | "warning" | "error";
  tags?: string[];
  action?: TimelineAction;
  details?: TimelineDetail[];
}

export interface TimelineGroup {
  id: string;
  label: string;
  color?: string;
}

export interface TimelineAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}

export interface TimelineDetail {
  label: string;
  value: string;
}
