import { z } from "zod";

export const imageControlsSchema = z.object({
  zoom: z.boolean().optional(),
  fullscreen: z.boolean().optional(),
  thumbnails: z.boolean().optional(),
});

export const imageItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const imageAnnotationSchema = z.object({
  id: z.string(),
  imageId: z.string(),
  type: z.enum(["circle", "rect", "point", "text"]),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  label: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});

export const imageSchema = z.object({
  type: z.literal("image"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  images: z.array(imageItemSchema),
  activeIndex: z.number().optional(),
  annotations: z.array(imageAnnotationSchema).optional(),
  controls: imageControlsSchema.optional(),
});

export type ImageContent = z.infer<typeof imageSchema>;
export type ImageItem = z.infer<typeof imageItemSchema>;
export type ImageAnnotation = z.infer<typeof imageAnnotationSchema>;
export type ImageControls = z.infer<typeof imageControlsSchema>;
