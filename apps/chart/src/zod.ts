import { z } from "zod";

export const chartDatasetSchema = z.object({
  label: z.string(),
  values: z.array(z.unknown()).describe("number | {label,value} | {x,y} | {x,y,r}"),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  fill: z.boolean().optional(),
  type: z.string().optional().describe("Override chart type for this dataset"),
  borderWidth: z.number().optional(),
  tension: z.number().optional(),
});

export const axisConfigSchema = z.object({
  label: z.string().optional(),
  type: z.enum(["linear", "logarithmic", "category", "time"]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  stacked: z.boolean().optional(),
});

export const annotationSchema = z.object({
  type: z.enum(["line", "label"]).optional(),
  axis: z.enum(["x", "y"]).optional(),
  value: z.unknown().optional(),
  label: z.string().optional(),
  color: z.string().optional(),
});

export const chartSchema = z.object({
  type: z.literal("chart"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  chartType: z.enum(["bar", "line", "scatter", "pie", "doughnut", "area", "radar", "bubble"]),
  data: z.array(chartDatasetSchema),
  xAxis: axisConfigSchema.optional(),
  yAxis: axisConfigSchema.optional(),
  legend: z.object({
    position: z.enum(["top", "bottom", "left", "right", "none"]).optional(),
  }).optional(),
  annotations: z.array(annotationSchema).optional(),
  interactive: z.boolean().optional(),
});

export type ChartContent = z.infer<typeof chartSchema>;
export type ChartDataset = z.infer<typeof chartDatasetSchema>;
