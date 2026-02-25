export interface DataTableContent {
  type: "datatable";
  version: "1.0";
  title?: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  actions?: RowAction[];
  /** Server-side pagination: tool name to invoke when changing pages */
  paginationTool?: string;
  /** Total number of rows across all pages (for server-side pagination) */
  totalRows?: number;
  /** Number of rows per page (defaults to 50) */
  pageSize?: number;
  /** Current page number (1-based) */
  currentPage?: number;
  /** App-only tool to reload data (visibility: ["app"]) */
  refreshTool?: string;
  /** App-only tool for server-side export (visibility: ["app"]) */
  exportTool?: string;
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
