import { z } from "zod";

export const spectrogramDataSchema = z.object({
  sampleRate: z.number(),
  fftSize: z.number(),
  hopSize: z.number(),
  magnitudes: z.array(z.array(z.number())),
});

export const spectrogramSchema = z.object({
  type: z.literal("spectrogram"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  data: spectrogramDataSchema,
  frequencyRange: z
    .object({ min: z.number(), max: z.number() })
    .optional(),
  timeRange: z
    .object({ start: z.number(), end: z.number() })
    .optional(),
  colorMap: z.enum(["viridis", "magma", "inferno", "grayscale"]).optional(),
  showFrequencyAxis: z.boolean().optional(),
  showTimeAxis: z.boolean().optional(),
});

export type SpectrogramContent = z.infer<typeof spectrogramSchema>;
export type SpectrogramData = z.infer<typeof spectrogramDataSchema>;
