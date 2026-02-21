import { z } from "zod";

export const ganttTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  start: z.string(),
  end: z.string(),
  progress: z.number().optional(),
  color: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  group: z.string().optional(),
});

export const ganttSchema = z.object({
  type: z.literal("gantt"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  tasks: z.array(ganttTaskSchema),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type GanttContent = z.infer<typeof ganttSchema>;
export type GanttTask = z.infer<typeof ganttTaskSchema>;
