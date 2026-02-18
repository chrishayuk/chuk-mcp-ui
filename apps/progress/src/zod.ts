import { z } from "zod";

export const progressTrackSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  max: z.number().optional(),
  status: z.enum(["active", "complete", "error", "pending"]).optional(),
  detail: z.string().optional(),
});

export const progressSchema = z.object({
  type: z.literal("progress"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  overall: z.number().optional(),
  tracks: z.array(progressTrackSchema),
});

export type ProgressContent = z.infer<typeof progressSchema>;
export type ProgressTrack = z.infer<typeof progressTrackSchema>;
