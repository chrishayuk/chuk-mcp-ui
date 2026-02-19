import { z } from "zod";

export const audioRegionSchema = z.object({
  id: z.string(),
  start: z.number().min(0).describe("Region start time in seconds"),
  end: z.number().min(0).describe("Region end time in seconds"),
  label: z.string().optional(),
  color: z.string().optional().describe("CSS color for the region overlay"),
});

export const audioSchema = z.object({
  type: z.literal("audio"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  url: z.string().describe("Audio URL or data URI"),
  waveform: z
    .array(z.number().min(0).max(1))
    .optional()
    .describe("Amplitude values 0-1 for waveform visualization"),
  duration: z.number().min(0).optional().describe("Duration in seconds"),
  regions: z.array(audioRegionSchema).optional(),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
});

export type AudioContent = z.infer<typeof audioSchema>;
export type AudioRegion = z.infer<typeof audioRegionSchema>;
