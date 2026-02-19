import { z } from "zod";

export const boxplotStatsSchema = z.object({
  min: z.number(),
  q1: z.number(),
  median: z.number(),
  q3: z.number(),
  max: z.number(),
  outliers: z.array(z.number()).optional(),
  mean: z.number().optional(),
});

export const boxplotGroupSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
  stats: boxplotStatsSchema,
});

export const boxplotSchema = z.object({
  type: z.literal("boxplot"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  groups: z.array(boxplotGroupSchema).min(1),
  orientation: z.enum(["vertical", "horizontal"]).optional(),
  showOutliers: z.boolean().optional(),
  yAxis: z
    .object({
      label: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

export type BoxplotContent = z.infer<typeof boxplotSchema>;
export type BoxplotGroup = z.infer<typeof boxplotGroupSchema>;
export type BoxplotStats = z.infer<typeof boxplotStatsSchema>;
