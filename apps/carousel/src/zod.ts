import { z } from "zod";

export const carouselActionSchema = z.object({
  label: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.unknown()),
});

export const carouselItemSchema = z.object({
  id: z.string(),
  image: z
    .object({
      url: z.string(),
      alt: z.string().optional(),
    })
    .optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  action: carouselActionSchema.optional(),
});

export const carouselSchema = z.object({
  type: z.literal("carousel"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  items: z.array(carouselItemSchema),
  autoPlay: z.boolean().optional(),
  autoPlayInterval: z.number().optional(),
  showDots: z.boolean().optional(),
  showArrows: z.boolean().optional(),
  loop: z.boolean().optional(),
  transition: z.enum(["slide", "fade"]).optional(),
});

export type CarouselContent = z.infer<typeof carouselSchema>;
export type CarouselItem = z.infer<typeof carouselItemSchema>;
export type CarouselAction = z.infer<typeof carouselActionSchema>;
