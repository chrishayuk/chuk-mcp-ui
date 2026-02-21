import { z } from "zod";

export const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
  size: z.number().optional(),
  group: z.string().optional(),
});

export const graphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
});

export const graphSchema = z.object({
  type: z.literal("graph"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
  directed: z.boolean().optional(),
});

export type GraphContent = z.infer<typeof graphSchema>;
export type GraphNode = z.infer<typeof graphNodeSchema>;
export type GraphEdge = z.infer<typeof graphEdgeSchema>;
