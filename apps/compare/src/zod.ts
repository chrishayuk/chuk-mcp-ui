import { z } from "zod";

export const compareImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export const compareSchema = z.object({
  type: z.literal("compare"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  before: compareImageSchema,
  after: compareImageSchema,
  orientation: z.enum(["horizontal", "vertical"]).optional(),
  initialPosition: z.number().min(0).max(100).optional(),
  labels: z
    .object({
      before: z.string().optional(),
      after: z.string().optional(),
    })
    .optional(),
});

export type CompareContent = z.infer<typeof compareSchema>;
export type CompareImage = z.infer<typeof compareImageSchema>;
