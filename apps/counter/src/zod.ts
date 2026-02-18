import { z } from "zod";

export const counterDeltaSchema = z.object({
  value: z.number(),
  label: z.string().optional(),
});

export const counterSchema = z.object({
  type: z.literal("counter"),
  version: z.literal("1.0"),
  value: z.number(),
  label: z.string(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  delta: counterDeltaSchema.optional(),
  sparkline: z.array(z.number()).optional(),
  icon: z.string().optional(),
  color: z.enum(["default", "success", "warning", "danger"]).optional(),
});

export type CounterContent = z.infer<typeof counterSchema>;
export type CounterDelta = z.infer<typeof counterDeltaSchema>;
