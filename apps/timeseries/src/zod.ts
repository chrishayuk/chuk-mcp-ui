import { z } from "zod";

export const timeseriesDataPointSchema = z.object({
  t: z.string().describe("ISO 8601 timestamp or date string"),
  v: z.number().describe("Numeric value at this timestamp"),
});

export const timeseriesSeriesSchema = z.object({
  label: z.string(),
  data: z.array(timeseriesDataPointSchema),
  color: z.string().optional(),
  fill: z.boolean().optional(),
  type: z.enum(["line", "bar", "area"]).optional(),
});

export const timeseriesXAxisSchema = z.object({
  label: z.string().optional(),
  min: z.string().optional().describe("ISO 8601 minimum bound"),
  max: z.string().optional().describe("ISO 8601 maximum bound"),
});

export const timeseriesYAxisSchema = z.object({
  label: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  type: z.enum(["linear", "logarithmic"]).optional(),
});

export const timeseriesAnnotationSchema = z.object({
  type: z.enum(["line", "range"]),
  start: z.string().describe("ISO 8601 start timestamp"),
  end: z.string().optional().describe("ISO 8601 end timestamp (required for range)"),
  label: z.string().optional(),
  color: z.string().optional(),
});

export const timeseriesSchema = z.object({
  type: z.literal("timeseries"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  series: z.array(timeseriesSeriesSchema),
  xAxis: timeseriesXAxisSchema.optional(),
  yAxis: timeseriesYAxisSchema.optional(),
  annotations: z.array(timeseriesAnnotationSchema).optional(),
  zoom: z.boolean().optional(),
});

export type TimeseriesContent = z.infer<typeof timeseriesSchema>;
export type TimeseriesSeries = z.infer<typeof timeseriesSeriesSchema>;
export type TimeseriesAnnotation = z.infer<typeof timeseriesAnnotationSchema>;
