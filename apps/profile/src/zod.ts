import { z } from "zod";

export const profilePointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const profileMarkerSchema = z.object({
  x: z.number(),
  label: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const profileSchema = z.object({
  type: z.literal("profile"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  points: z.array(profilePointSchema),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  fill: z.boolean().optional(),
  color: z.string().optional(),
  markers: z.array(profileMarkerSchema).optional(),
});

export type ProfileContent = z.infer<typeof profileSchema>;
export type ProfilePoint = z.infer<typeof profilePointSchema>;
export type ProfileMarker = z.infer<typeof profileMarkerSchema>;
