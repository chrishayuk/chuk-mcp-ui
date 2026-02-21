import { z } from "zod";

export const swimlaneLaneSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

export const swimlaneColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const swimlaneActivitySchema = z.object({
  id: z.string(),
  laneId: z.string(),
  columnId: z.string(),
  label: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["pending", "active", "completed", "blocked"]).optional(),
});

export const swimlaneSchema = z.object({
  type: z.literal("swimlane"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  lanes: z.array(swimlaneLaneSchema),
  columns: z.array(swimlaneColumnSchema),
  activities: z.array(swimlaneActivitySchema),
});

export type SwimlaneContent = z.infer<typeof swimlaneSchema>;
export type SwimlaneLane = z.infer<typeof swimlaneLaneSchema>;
export type SwimlaneColumn = z.infer<typeof swimlaneColumnSchema>;
export type SwimlaneActivity = z.infer<typeof swimlaneActivitySchema>;
