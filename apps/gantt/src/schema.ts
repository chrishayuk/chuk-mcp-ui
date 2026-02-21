export interface GanttContent {
  type: "gantt";
  version: "1.0";
  title?: string;
  tasks: GanttTask[];
  startDate?: string;
  endDate?: string;
}

export interface GanttTask {
  id: string;
  label: string;
  start: string;
  end: string;
  progress?: number;
  color?: string;
  dependencies?: string[];
  group?: string;
}
