import { z } from "zod";

export const kanbanLabelSchema = z.object({
  text: z.string(),
  color: z.string().optional(),
});

export const kanbanCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  assignee: z.string().optional(),
  labels: z.array(kanbanLabelSchema).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  image: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const kanbanColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
  limit: z.number().optional(),
  cards: z.array(kanbanCardSchema),
});

export const kanbanSchema = z.object({
  type: z.literal("kanban"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  columns: z.array(kanbanColumnSchema),
  moveTool: z.string().optional(),
});

export type KanbanContent = z.infer<typeof kanbanSchema>;
export type KanbanColumn = z.infer<typeof kanbanColumnSchema>;
export type KanbanCard = z.infer<typeof kanbanCardSchema>;
export type KanbanLabel = z.infer<typeof kanbanLabelSchema>;
