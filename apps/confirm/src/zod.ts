import { z } from "zod";

export const confirmDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const confirmSchema = z.object({
  type: z.literal("confirm"),
  version: z.literal("1.0"),
  title: z.string(),
  message: z.string(),
  severity: z.enum(["info", "warning", "danger"]).optional(),
  details: z.array(confirmDetailSchema).optional(),
  confirmLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  confirmTool: z.string().optional(),
  confirmArgs: z.record(z.string(), z.unknown()).optional(),
  cancelTool: z.string().optional(),
  cancelArgs: z.record(z.string(), z.unknown()).optional(),
});

export type ConfirmContent = z.infer<typeof confirmSchema>;
export type ConfirmDetail = z.infer<typeof confirmDetailSchema>;
