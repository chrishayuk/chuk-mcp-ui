import { z } from "zod";

export const fieldSchemaZ = z.object({
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
});

export const jsonSchemaFieldSchema = z.object({
  type: z.literal("object"),
  required: z.array(z.string()).optional(),
  properties: z.record(z.string(), fieldSchemaZ),
});

export const fieldUISchema = z.object({
  widget: z.enum([
    "text", "textarea", "select", "radio", "checkbox",
    "slider", "date", "datetime", "color", "password",
    "hidden", "number",
  ]).optional(),
  placeholder: z.string().optional(),
  help: z.string().optional(),
  disabled: z.boolean().optional(),
  readonly: z.boolean().optional(),
});

export const fieldGroupSchema = z.object({
  title: z.string(),
  fields: z.array(z.string()),
  collapsible: z.boolean().optional(),
  collapsed: z.boolean().optional(),
});

export const uiSchemaZ = z.object({
  order: z.array(z.string()).optional(),
  fields: z.record(z.string(), fieldUISchema).optional(),
  groups: z.array(fieldGroupSchema).optional(),
});

export const formSchema = z.object({
  type: z.literal("form"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  description: z.string().optional(),
  schema: jsonSchemaFieldSchema,
  uiSchema: uiSchemaZ.optional(),
  initialValues: z.record(z.string(), z.unknown()).optional(),
  submitTool: z.string(),
  submitLabel: z.string().optional(),
  cancelable: z.boolean().optional(),
  layout: z.enum(["vertical", "horizontal"]).optional(),
});

export type FormContent = z.infer<typeof formSchema>;
