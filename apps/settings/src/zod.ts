import { z } from "zod";

export const settingsFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const settingsFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  type: z.enum(["toggle", "select", "text", "number", "slider", "radio", "color"]),
  value: z.unknown(),
  options: z.array(settingsFieldOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  disabled: z.boolean().optional(),
});

export const settingsSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  collapsible: z.boolean().optional(),
  collapsed: z.boolean().optional(),
  fields: z.array(settingsFieldSchema),
});

export const settingsSchema = z.object({
  type: z.literal("settings"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  sections: z.array(settingsSectionSchema),
  saveTool: z.string().optional(),
  autoSave: z.boolean().optional(),
});

export type SettingsContent = z.infer<typeof settingsSchema>;
export type SettingsSection = z.infer<typeof settingsSectionSchema>;
export type SettingsField = z.infer<typeof settingsFieldSchema>;
