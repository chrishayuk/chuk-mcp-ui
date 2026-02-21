import { z } from "zod";

export const sankeyNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

export const sankeyLinkSchema = z.object({
  source: z.string(),
  target: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

export const sankeySchema = z.object({
  type: z.literal("sankey"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  nodes: z.array(sankeyNodeSchema),
  links: z.array(sankeyLinkSchema),
});

export type SankeyContent = z.infer<typeof sankeySchema>;
export type SankeyNode = z.infer<typeof sankeyNodeSchema>;
export type SankeyLink = z.infer<typeof sankeyLinkSchema>;
