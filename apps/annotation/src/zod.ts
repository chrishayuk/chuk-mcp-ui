import { z } from "zod";

export const circleAnnotationSchema = z.object({
  kind: z.literal("circle"),
  id: z.string(),
  cx: z.number(),
  cy: z.number(),
  r: z.number(),
  color: z.string().optional(),
  label: z.string().optional(),
  strokeWidth: z.number().optional(),
});

export const rectAnnotationSchema = z.object({
  kind: z.literal("rect"),
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string().optional(),
  label: z.string().optional(),
  strokeWidth: z.number().optional(),
});

export const arrowAnnotationSchema = z.object({
  kind: z.literal("arrow"),
  id: z.string(),
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  color: z.string().optional(),
  label: z.string().optional(),
  strokeWidth: z.number().optional(),
});

export const textAnnotationSchema = z.object({
  kind: z.literal("text"),
  id: z.string(),
  x: z.number(),
  y: z.number(),
  text: z.string(),
  color: z.string().optional(),
  fontSize: z.number().optional(),
});

export const annotationSchema = z.discriminatedUnion("kind", [
  circleAnnotationSchema,
  rectAnnotationSchema,
  arrowAnnotationSchema,
  textAnnotationSchema,
]);

export const annotationContentSchema = z.object({
  type: z.literal("annotation"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  imageUrl: z.string(),
  imageWidth: z.number().optional(),
  imageHeight: z.number().optional(),
  annotations: z.array(annotationSchema),
});

export type AnnotationContent = z.infer<typeof annotationContentSchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type CircleAnnotation = z.infer<typeof circleAnnotationSchema>;
export type RectAnnotation = z.infer<typeof rectAnnotationSchema>;
export type ArrowAnnotation = z.infer<typeof arrowAnnotationSchema>;
export type TextAnnotation = z.infer<typeof textAnnotationSchema>;
