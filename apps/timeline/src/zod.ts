import { z } from "zod";

export const timelineDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const timelineActionSchema = z.object({
  label: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.string()),
});

export const timelineEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  endDate: z.string().optional(),
  group: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  severity: z.enum(["info", "success", "warning", "error"]).optional(),
  tags: z.array(z.string()).optional(),
  action: timelineActionSchema.optional(),
  details: z.array(timelineDetailSchema).optional(),
});

export const timelineGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

export const timelineSchema = z.object({
  type: z.literal("timeline"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  events: z.array(timelineEventSchema),
  groups: z.array(timelineGroupSchema).optional(),
  orientation: z.enum(["vertical", "horizontal"]).optional(),
});

export type TimelineContent = z.infer<typeof timelineSchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type TimelineGroup = z.infer<typeof timelineGroupSchema>;
export type TimelineAction = z.infer<typeof timelineActionSchema>;
export type TimelineDetail = z.infer<typeof timelineDetailSchema>;
