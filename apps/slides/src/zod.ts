import { z } from "zod";

export const slideSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  notes: z.string().optional(),
  background: z.string().optional(),
  layout: z.enum(["default", "center", "split", "image"]).optional(),
  image: z.string().optional(),
});

export const slidesSchema = z.object({
  type: z.literal("slides"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  slides: z.array(slideSchema),
  transition: z.enum(["fade", "slide", "none"]).optional(),
});

export type SlidesContent = z.infer<typeof slidesSchema>;
export type Slide = z.infer<typeof slideSchema>;
