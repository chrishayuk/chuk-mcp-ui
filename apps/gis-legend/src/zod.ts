import { z } from "zod";

export const gisLegendGradientStopSchema = z.object({
  value: z.string(),
  color: z.string(),
});

export const gisLegendItemSchema = z.object({
  type: z.enum(["point", "line", "polygon", "gradient", "icon"]),
  label: z.string(),
  color: z.string().optional(),
  fillColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  size: z.number().optional(),
  icon: z.string().optional(),
  gradientStops: z.array(gisLegendGradientStopSchema).optional(),
});

export const gisLegendSectionSchema = z.object({
  title: z.string().optional(),
  items: z.array(gisLegendItemSchema),
});

export const gisLegendSchema = z.object({
  type: z.literal("gis-legend"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  sections: z.array(gisLegendSectionSchema),
  orientation: z.enum(["vertical", "horizontal"]).optional(),
}).and(z.record(z.string(), z.unknown()));

export type GisLegendContent = z.infer<typeof gisLegendSchema>;
export type GisLegendSection = z.infer<typeof gisLegendSectionSchema>;
export type GisLegendItem = z.infer<typeof gisLegendItemSchema>;
export type GisLegendGradientStop = z.infer<typeof gisLegendGradientStopSchema>;
