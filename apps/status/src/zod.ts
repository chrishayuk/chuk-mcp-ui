import { z } from "zod";

export const statusItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["ok", "warning", "error", "unknown", "pending"]),
  detail: z.string().optional(),
  lastChecked: z.string().optional(),
  url: z.string().optional(),
});

export const statusSummarySchema = z.object({
  ok: z.number(),
  warning: z.number(),
  error: z.number(),
});

export const statusSchema = z.object({
  type: z.literal("status"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  items: z.array(statusItemSchema),
  summary: statusSummarySchema.optional(),
});

export type StatusContent = z.infer<typeof statusSchema>;
export type StatusItem = z.infer<typeof statusItemSchema>;
export type StatusSummary = z.infer<typeof statusSummarySchema>;
