import { z } from "zod";

export const markdownSchema = z.object({
  type: z.literal("markdown"),
  version: z.literal("1.0"),
  content: z.string().describe("Raw markdown text"),
  title: z.string().optional(),
});

export type MarkdownContent = z.infer<typeof markdownSchema>;
