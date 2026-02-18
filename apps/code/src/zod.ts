import { z } from "zod";

export const codeSchema = z.object({
  type: z.literal("code"),
  version: z.literal("1.0"),
  code: z.string(),
  language: z.string().optional(),
  title: z.string().optional(),
  lineNumbers: z.boolean().optional(),
  highlightLines: z.array(z.number()).optional(),
});

export type CodeContent = z.infer<typeof codeSchema>;
