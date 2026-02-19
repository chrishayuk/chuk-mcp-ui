import { z } from "zod";

export const colorScaleSchema = z.object({
  min: z.string(),
  max: z.string(),
});

export const crosstabAnnotationSchema = z.object({
  row: z.number(),
  col: z.number(),
  label: z.string().optional(),
  highlight: z.boolean().optional(),
});

export const crosstabSchema = z.object({
  type: z.literal("crosstab"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  rowHeaders: z.array(z.string()),
  columnHeaders: z.array(z.string()),
  values: z.array(z.array(z.number())),
  formatting: z.enum(["none", "heatmap", "bars", "percentage"]).optional(),
  colorScale: colorScaleSchema.optional(),
  showTotals: z.boolean().optional(),
  annotations: z.array(crosstabAnnotationSchema).optional(),
});

export type CrosstabContent = z.infer<typeof crosstabSchema>;
export type ColorScale = z.infer<typeof colorScaleSchema>;
export type CrosstabAnnotation = z.infer<typeof crosstabAnnotationSchema>;
