import { z } from "zod";

export const pivotValueSchema = z.object({
  field: z.string(),
  aggregate: z.enum(["sum", "count", "avg", "min", "max"]),
  label: z.string().optional(),
  format: z.enum(["number", "percent", "currency"]).optional(),
});

export const pivotSchema = z.object({
  type: z.literal("pivot"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  data: z.array(z.record(z.string(), z.unknown())),
  rows: z.array(z.string()),
  columns: z.array(z.string()),
  values: z.array(pivotValueSchema),
  sortable: z.boolean().optional(),
  showTotals: z.boolean().optional(),
});

export type PivotContent = z.infer<typeof pivotSchema>;
export type PivotValue = z.infer<typeof pivotValueSchema>;
