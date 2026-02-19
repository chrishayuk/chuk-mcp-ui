export interface KanbanContent {
  type: "kanban";
  version: "1.0";
  title?: string;
  columns: KanbanColumn[];
  moveTool?: string;
}

export interface KanbanColumn {
  id: string;
  label: string;
  color?: string;
  limit?: number;
  cards: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  labels?: KanbanLabel[];
  priority?: "low" | "medium" | "high" | "critical";
  image?: string;
  metadata?: Record<string, string>;
}

export interface KanbanLabel {
  text: string;
  color?: string;
}
