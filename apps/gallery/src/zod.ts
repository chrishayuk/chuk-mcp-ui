import { z } from "zod";

export const galleryBadgeSchema = z.object({
  label: z.string(),
  variant: z.enum(["default", "secondary", "outline"]).optional(),
});

export const galleryActionSchema = z.object({
  label: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.string()),
});

export const galleryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.object({
    url: z.string(),
    alt: z.string().optional(),
  }).optional(),
  badges: z.array(galleryBadgeSchema).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  actions: z.array(galleryActionSchema).optional(),
});

export const gallerySchema = z.object({
  type: z.literal("gallery"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  items: z.array(galleryItemSchema),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  filterable: z.boolean().optional(),
  sortable: z.boolean().optional(),
  sortFields: z.array(z.string()).optional(),
  emptyMessage: z.string().optional(),
});

export type GalleryContent = z.infer<typeof gallerySchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type GalleryBadge = z.infer<typeof galleryBadgeSchema>;
export type GalleryAction = z.infer<typeof galleryActionSchema>;
