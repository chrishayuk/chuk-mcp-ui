import { z } from "zod";

export const threedObjectSchema = z.object({
  id: z.string(),
  geometry: z.enum(["box", "sphere", "cylinder", "cone", "torus"]),
  position: z.tuple([z.number(), z.number(), z.number()]),
  scale: z.tuple([z.number(), z.number(), z.number()]).optional(),
  color: z.string().optional(),
  label: z.string().optional(),
  wireframe: z.boolean().optional(),
});

export const threedSchema = z.object({
  type: z.literal("threed"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  objects: z.array(threedObjectSchema),
  camera: z.object({
    position: z.tuple([z.number(), z.number(), z.number()]).optional(),
    target: z.tuple([z.number(), z.number(), z.number()]).optional(),
  }).optional(),
  background: z.string().optional(),
});

export type ThreedContent = z.infer<typeof threedSchema>;
export type ThreedObject = z.infer<typeof threedObjectSchema>;
