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
  playing: z.boolean().optional().describe("Runtime playback state — true = playing, false = paused"),
  currentTime: z.number().min(0).optional().describe("Seek to this position (seconds)"),
  playbackRate: z.number().min(0.25).max(4).optional().describe("Playback speed multiplier (default 1.0)"),
  volume: z.number().min(0).max(1).optional().describe("Volume level 0.0–1.0"),
});

export type VideoContent = z.infer<typeof videoSchema>;
