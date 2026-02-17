import { z } from "zod";

export const pdfSchema = z.object({
  type: z.literal("pdf"),
  version: z.literal("1.0"),
  url: z.string().describe("PDF URL or base64 data URI"),
  initialPage: z.number().int().min(1).default(1).describe("Initial page number"),
  title: z.string().optional(),
});

export type PdfContent = z.infer<typeof pdfSchema>;
