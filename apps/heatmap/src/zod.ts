import { z } from "zod";

export const heatmapAnnotationSchema = z.object({
  row: z.number(),
  col: z.number(),
  label: z.string(),
});

export const heatmapSchema = z.object({
  type: z.literal("heatmap"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  rows: z.array(z.string()),
  columns: z.array(z.string()),
  values: z.array(z.array(z.number())),
  colorScale: z.enum(["sequential", "diverging"]).optional(),
  minColor: z.string().optional(),
  maxColor: z.string().optional(),
  midColor: z.string().optional(),
  showValues: z.boolean().optional(),
  annotations: z.array(heatmapAnnotationSchema).optional(),
});

export type HeatmapContent = z.infer<typeof heatmapSchema>;
export type HeatmapAnnotation = z.infer<typeof heatmapAnnotationSchema>;
