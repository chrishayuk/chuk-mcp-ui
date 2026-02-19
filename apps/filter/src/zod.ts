import { z } from "zod";

export const filterOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().optional(),
});

export const filterFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum([
    "text",
    "select",
    "multi-select",
    "date-range",
    "number-range",
    "toggle",
    "checkbox-group",
  ]),
  placeholder: z.string().optional(),
  options: z.array(filterOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  defaultValue: z.unknown().optional(),
});

export const filterSchema = z.object({
  type: z.literal("filter"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  filters: z.array(filterFieldSchema),
  layout: z.enum(["horizontal", "vertical", "wrap"]).optional(),
  submitMode: z.enum(["instant", "button"]).optional(),
  resetLabel: z.string().optional(),
});

export type FilterContent = z.infer<typeof filterSchema>;
export type FilterField = z.infer<typeof filterFieldSchema>;
export type FilterOption = z.infer<typeof filterOptionSchema>;
