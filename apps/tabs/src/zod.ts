import { z } from "zod";

export const tabSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  viewUrl: z.string(),
  structuredContent: z.unknown(),
});

export const tabsSchema = z.object({
  type: z.literal("tabs"),
  version: z.literal("1.0"),
  activeTab: z.string().optional(),
  tabs: z.array(tabSchema),
});

export type TabsContent = z.infer<typeof tabsSchema>;
export type Tab = z.infer<typeof tabSchema>;
