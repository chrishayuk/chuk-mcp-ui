import { z } from "zod";

export const alertActionSchema = z.object({
  label: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.string()),
  variant: z.enum(["default", "destructive"]).optional(),
});

export const alertItemSchema = z.object({
  id: z.string(),
  severity: z.enum(["info", "success", "warning", "error", "critical"]),
  title: z.string(),
  message: z.string().optional(),
  source: z.string().optional(),
  category: z.string().optional(),
  timestamp: z.string().optional(),
  dismissible: z.boolean().optional(),
  actions: z.array(alertActionSchema).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const alertSchema = z.object({
  type: z.literal("alert"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  alerts: z.array(alertItemSchema),
  groupBy: z.enum(["severity", "category", "source"]).optional(),
  dismissible: z.boolean().optional(),
});

export type AlertContent = z.infer<typeof alertSchema>;
export type AlertItem = z.infer<typeof alertItemSchema>;
export type AlertAction = z.infer<typeof alertActionSchema>;
