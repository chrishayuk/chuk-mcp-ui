import { z } from "zod";

export const gaugeThresholdSchema = z.object({
  value: z.number(),
  color: z.string(),
  label: z.string().optional(),
});

export const gaugeSchema = z.object({
  type: z.literal("gauge"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  value: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  thresholds: z.array(gaugeThresholdSchema).optional(),
  format: z.enum(["number", "percent"]).optional(),
  size: z.enum(["sm", "md", "lg"]).optional(),
  subtitle: z.string().optional(),
});

export type GaugeContent = z.infer<typeof gaugeSchema>;
export type GaugeThreshold = z.infer<typeof gaugeThresholdSchema>;
