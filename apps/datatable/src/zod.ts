import { z } from "zod";

export const columnSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["text", "number", "date", "boolean", "link", "badge"]).optional(),
  sortable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  width: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  format: z.string().optional(),
  badgeColors: z.record(z.string(), z.string()).optional(),
});

export const rowActionSchema = z.object({
  label: z.string(),
  icon: z.string().optional(),
  tool: z.string(),
  arguments: z.record(z.string(), z.string()),
  confirm: z.string().optional(),
});

export const dataTableSchema = z.object({
  type: z.literal("datatable"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  columns: z.array(columnSchema),
  rows: z.array(z.record(z.string(), z.unknown())),
  sortable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  exportable: z.boolean().optional(),
  selectable: z.boolean().optional(),
  actions: z.array(rowActionSchema).optional(),
  paginationTool: z.string().optional(),
  totalRows: z.number().optional(),
  pageSize: z.number().optional(),
  currentPage: z.number().optional(),
  refreshTool: z.string().optional(),
  exportTool: z.string().optional(),
});

export type DataTableContent = z.infer<typeof dataTableSchema>;
export type Column = z.infer<typeof columnSchema>;
export type RowAction = z.infer<typeof rowActionSchema>;
