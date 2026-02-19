import { z } from "zod";

export const stepSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  status: z.enum(["pending", "active", "completed", "error", "skipped"]).optional(),
  icon: z.string().optional(),
  detail: z.string().optional(),
});

export const stepperSchema = z.object({
  type: z.literal("stepper"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  steps: z.array(stepSchema),
  activeStep: z.number(),
  orientation: z.enum(["horizontal", "vertical"]).optional(),
  allowNavigation: z.boolean().optional(),
  stepTool: z.string().optional(),
});

export type StepperContent = z.infer<typeof stepperSchema>;
export type Step = z.infer<typeof stepSchema>;
