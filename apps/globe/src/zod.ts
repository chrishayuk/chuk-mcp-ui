import { z } from "zod";

export const globePointSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lon: z.number(),
  label: z.string(),
  color: z.string().optional(),
  size: z.number().optional(),
});

export const globeArcSchema = z.object({
  from: z.string(),
  to: z.string(),
  color: z.string().optional(),
  label: z.string().optional(),
});

export const globeSchema = z.object({
  type: z.literal("globe"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  points: z.array(globePointSchema),
  arcs: z.array(globeArcSchema).optional(),
  rotation: z.object({
    lat: z.number(),
    lon: z.number(),
  }).optional(),
});

export type GlobeContent = z.infer<typeof globeSchema>;
export type GlobePoint = z.infer<typeof globePointSchema>;
export type GlobeArc = z.infer<typeof globeArcSchema>;
