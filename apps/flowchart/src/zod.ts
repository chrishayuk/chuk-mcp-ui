import { z } from "zod";

export const flowchartNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  shape: z.enum(["rect", "diamond", "ellipse", "parallelogram"]).optional(),
  color: z.string().optional(),
});

export const flowchartEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  style: z.enum(["solid", "dashed"]).optional(),
});

export const flowchartSchema = z.object({
  type: z.literal("flowchart"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  nodes: z.array(flowchartNodeSchema),
  edges: z.array(flowchartEdgeSchema),
  direction: z.enum(["TB", "LR"]).optional(),
});

export type FlowchartContent = z.infer<typeof flowchartSchema>;
export type FlowchartNode = z.infer<typeof flowchartNodeSchema>;
export type FlowchartEdge = z.infer<typeof flowchartEdgeSchema>;
