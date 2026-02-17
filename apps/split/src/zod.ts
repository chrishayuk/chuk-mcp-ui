import { z } from "zod";

export const splitPanelSchema = z.object({
  label: z.string().optional(),
  viewUrl: z.string(),
  structuredContent: z.unknown(),
});

export const splitSchema = z.object({
  type: z.literal("split"),
  version: z.literal("1.0"),
  direction: z.enum(["horizontal", "vertical"]).optional(),
  ratio: z.string().optional().describe('Panel ratio, e.g. "50:50" or "30:70"'),
  left: splitPanelSchema,
  right: splitPanelSchema,
});

export type SplitContent = z.infer<typeof splitSchema>;
export type SplitPanel = z.infer<typeof splitPanelSchema>;
