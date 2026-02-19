import { z } from "zod";

export const embedSchema = z.object({
  type: z.literal("embed"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  url: z.string().describe("URL to embed in the iframe"),
  sandbox: z.string().optional().describe("iframe sandbox attribute value"),
  allow: z.string().optional().describe("iframe allow attribute value"),
  aspectRatio: z.string().optional().describe("CSS aspect-ratio for proportional embeds"),
  toolbar: z.boolean().default(false).describe("Show URL toolbar with refresh and open-in-new-tab"),
  fallbackText: z.string().optional().describe("Text shown when iframe fails to load"),
});

export type EmbedContent = z.infer<typeof embedSchema>;
