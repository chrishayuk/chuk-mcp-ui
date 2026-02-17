import { z } from "zod";

export const panelSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  viewUrl: z.string(),
  structuredContent: z.unknown(),
  width: z.string().optional(),
  height: z.string().optional(),
  minWidth: z.string().optional(),
  minHeight: z.string().optional(),
});

export const dashboardSchema = z.object({
  type: z.literal("dashboard"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  layout: z.enum(["split-horizontal", "split-vertical", "grid"]),
  panels: z.array(panelSchema),
  gap: z.string().optional(),
});

export type DashboardContent = z.infer<typeof dashboardSchema>;
export type Panel = z.infer<typeof panelSchema>;
