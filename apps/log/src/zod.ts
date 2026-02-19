import { z } from "zod";

export const logLevelSchema = z.enum(["debug", "info", "warn", "error", "fatal"]);

export const logEntrySchema = z.object({
  id: z.string().optional(),
  timestamp: z.string(),
  level: logLevelSchema,
  message: z.string(),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const logSchema = z.object({
  type: z.literal("log"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  entries: z.array(logEntrySchema),
  levels: z.array(logLevelSchema).optional(),
  searchable: z.boolean().optional(),
  autoScroll: z.boolean().optional(),
  maxEntries: z.number().optional(),
  showTimestamp: z.boolean().optional(),
  monospace: z.boolean().optional(),
});

export type LogContent = z.infer<typeof logSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;
