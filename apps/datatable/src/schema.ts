export interface DataTableContent {
  type: "datatable";
  version: "1.0";
  title?: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  actions?: RowAction[];
}

export interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "boolean" | "link" | "badge";
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  format?: string;
  badgeColors?: Record<string, string>;
}

export interface RowAction {
  label: string;
  icon?: string;
  tool: string;
  arguments: Record<string, string>;
  confirm?: string;
}
