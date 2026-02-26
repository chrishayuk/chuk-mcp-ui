import { z } from "zod";

export const wizardFieldSchemaSchema = z.object({
  type: z.enum(["string", "number", "integer", "boolean"]),
  title: z.string().optional(),
  description: z.string().optional(),
  default: z.unknown().optional(),
  enum: z.array(z.union([z.string(), z.number()])).optional(),
  enumLabels: z.array(z.string()).optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  widget: z
    .enum([
      "text",
      "textarea",
      "select",
      "radio",
      "checkbox",
      "slider",
      "date",
      "password",
      "number",
    ])
    .optional(),
  placeholder: z.string().optional(),
  help: z.string().optional(),
});

export const stepConditionSchema = z.object({
  field: z.string(),
  op: z.enum(["eq", "neq", "in", "gt", "lt"]),
  value: z.unknown(),
});

export const wizardStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.record(z.string(), wizardFieldSchemaSchema),
  required: z.array(z.string()).optional(),
  condition: stepConditionSchema.optional(),
});

export const wizardSchema = z.object({
  type: z.literal("wizard"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(wizardStepSchema),
  initialValues: z.record(z.string(), z.unknown()).optional(),
  submitTool: z.string(),
  submitLabel: z.string().optional(),
  allowNavigation: z.boolean().optional(),
});

export type WizardContent = z.infer<typeof wizardSchema>;
export type WizardStep = z.infer<typeof wizardStepSchema>;
export type WizardFieldSchema = z.infer<typeof wizardFieldSchemaSchema>;
export type StepCondition = z.infer<typeof stepConditionSchema>;
