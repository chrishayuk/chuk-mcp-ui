import { z } from "zod";

export const geostoryLocationSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

export const geostoryStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  location: geostoryLocationSchema,
  zoom: z.number().optional(),
  image: z.string().optional(),
  marker: z.string().optional(),
});

export const geostorySchema = z.object({
  type: z.literal("geostory"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  steps: z.array(geostoryStepSchema),
  basemap: z.enum(["terrain", "satellite", "simple"]).optional(),
});

export type GeostoryContent = z.infer<typeof geostorySchema>;
export type GeostoryStep = z.infer<typeof geostoryStepSchema>;
export type GeostoryLocation = z.infer<typeof geostoryLocationSchema>;
