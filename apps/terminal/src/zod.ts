import { z } from "zod";

export const terminalFontSizeSchema = z.enum(["xs", "sm", "md", "lg"]);

export const terminalThemeSchema = z.enum(["dark", "light", "green", "amber"]);

export const terminalLineSchema = z.object({
  text: z.string(),
  timestamp: z.string().optional(),
});

export const terminalSchema = z.object({
  type: z.literal("terminal"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  lines: z.array(terminalLineSchema),
  scrollback: z.number().optional(),
  fontSize: terminalFontSizeSchema.optional(),
  showLineNumbers: z.boolean().optional(),
  theme: terminalThemeSchema.optional(),
});

export type TerminalContent = z.infer<typeof terminalSchema>;
export type TerminalLine = z.infer<typeof terminalLineSchema>;
export type TerminalFontSize = z.infer<typeof terminalFontSizeSchema>;
export type TerminalTheme = z.infer<typeof terminalThemeSchema>;
