import { z } from "zod";

export const speakerInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  avatar: z.string().optional(),
  role: z.string().optional(),
});

export const transcriptEntrySchema = z.object({
  id: z.string(),
  speaker: z.string(),
  text: z.string(),
  /** ISO timestamp or seconds offset */
  timestamp: z.string().optional(),
  /** Duration in seconds */
  duration: z.number().optional(),
  /** Confidence score 0-1 */
  confidence: z.number().optional(),
  /** Language code */
  language: z.string().optional(),
});

export const transcriptSchema = z.object({
  type: z.literal("transcript"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  description: z.string().optional(),
  entries: z.array(transcriptEntrySchema),
  speakers: z.array(speakerInfoSchema).optional(),
  /** Show search bar */
  searchable: z.boolean().optional(),
  /** Show timestamps */
  showTimestamps: z.boolean().optional(),
});

export type TranscriptContent = z.infer<typeof transcriptSchema>;
export type TranscriptEntry = z.infer<typeof transcriptEntrySchema>;
export type SpeakerInfo = z.infer<typeof speakerInfoSchema>;
