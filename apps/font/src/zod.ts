import { z } from "zod";

export const fontContourSchema = z.object({
  d: z.string(),
});

export const fontGlyphSchema = z.object({
  name: z.string(),
  contours: z.array(fontContourSchema),
  advance_width: z.number().int(),
  upm: z.number().int().default(1000),
  ascender: z.number().int().default(800),
  descender: z.number().int().default(-200),
  cap_height: z.number().int().default(700),
  x_height: z.number().int().default(532),
  sqar: z.number().optional(),
  trap: z.number().optional(),
  weight: z.number().optional(),
});

export const fontSchema = z.object({
  type: z.literal("font"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  glyphs: z.array(fontGlyphSchema),
  show_metrics: z.boolean().default(true),
});

export type FontContent = z.infer<typeof fontSchema>;
export type FontGlyph = z.infer<typeof fontGlyphSchema>;
export type FontContour = z.infer<typeof fontContourSchema>;
