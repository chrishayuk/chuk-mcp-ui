import { z } from "zod";

export const videoSchema = z.object({
  type: z.literal("video"),
  version: z.literal("1.0"),
  url: z.string().describe("Video URL or data URI"),
  title: z.string().optional(),
  autoplay: z.boolean().default(false),
  muted: z.boolean().default(false),
  loop: z.boolean().default(false),
  poster: z.string().optional().describe("Poster image URL"),
  startTime: z.number().min(0).optional().describe("Start time in seconds"),
});

export type VideoContent = z.infer<typeof videoSchema>;
