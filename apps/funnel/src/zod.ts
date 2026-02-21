import { z } from "zod";

export const funnelStageSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const funnelSchema = z.object({
  type: z.literal("funnel"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  stages: z.array(funnelStageSchema),
  showConversion: z.boolean().optional(),
  orientation: z.enum(["vertical", "horizontal"]).optional(),
});

export type FunnelContent = z.infer<typeof funnelSchema>;
export type FunnelStage = z.infer<typeof funnelStageSchema>;
