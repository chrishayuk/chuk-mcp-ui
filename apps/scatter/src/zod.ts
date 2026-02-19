import { z } from "zod";

export const scatterPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  r: z.number().optional(),
  label: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const scatterDatasetSchema = z.object({
  label: z.string(),
  points: z.array(scatterPointSchema),
  color: z.string().optional(),
  pointStyle: z.enum(["circle", "cross", "rect", "triangle", "star"]).optional(),
  pointRadius: z.number().optional(),
});

export const axisConfigSchema = z.object({
  label: z.string().optional(),
  type: z.enum(["linear", "logarithmic"]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const scatterSchema = z.object({
  type: z.literal("scatter"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  datasets: z.array(scatterDatasetSchema),
  xAxis: axisConfigSchema.optional(),
  yAxis: axisConfigSchema.optional(),
  legend: z.object({
    position: z.enum(["top", "bottom", "left", "right", "none"]).optional(),
  }).optional(),
  zoom: z.boolean().optional(),
});

export type ScatterContent = z.infer<typeof scatterSchema>;
export type ScatterDataset = z.infer<typeof scatterDatasetSchema>;
export type ScatterPoint = z.infer<typeof scatterPointSchema>;
