import { z } from "zod";

export const detailFieldSchema = z.object({
  label: z.string(),
  value: z.string(),
  type: z.enum(["text", "link", "badge", "date", "email"]).optional(),
});

export const detailActionSchema = z.object({
  label: z.string(),
  tool: z.string(),
  args: z.record(z.string(), z.unknown()).optional(),
});

export const detailSectionSchema = z.object({
  title: z.string(),
  fields: z.array(detailFieldSchema),
});

export const detailSchema = z.object({
  type: z.literal("detail"),
  version: z.literal("1.0"),
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.object({
    url: z.string(),
    alt: z.string().optional(),
  }).optional(),
  fields: z.array(detailFieldSchema),
  actions: z.array(detailActionSchema).optional(),
  sections: z.array(detailSectionSchema).optional(),
});

export type DetailContent = z.infer<typeof detailSchema>;
export type DetailField = z.infer<typeof detailFieldSchema>;
export type DetailAction = z.infer<typeof detailActionSchema>;
export type DetailSection = z.infer<typeof detailSectionSchema>;
