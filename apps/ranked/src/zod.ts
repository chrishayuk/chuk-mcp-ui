import { z } from "zod";

export const rankedBadgeSchema = z.object({
  label: z.string(),
  variant: z.enum(["default", "secondary", "outline"]).optional(),
});

export const rankedActionSchema = z.object({
  label: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.string()),
});

export const rankedItemSchema = z.object({
  id: z.string(),
  rank: z.number(),
  title: z.string(),
  subtitle: z.string().optional(),
  score: z.number(),
  previousRank: z.number().optional(),
  badges: z.array(rankedBadgeSchema).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  image: z.object({
    url: z.string(),
    alt: z.string().optional(),
  }).optional(),
  actions: z.array(rankedActionSchema).optional(),
});

export const rankedSchema = z.object({
  type: z.literal("ranked"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  items: z.array(rankedItemSchema),
  maxScore: z.number().optional(),
  showDelta: z.boolean().optional(),
  scoreLabel: z.string().optional(),
  scoreSuffix: z.string().optional(),
});

export type RankedContent = z.infer<typeof rankedSchema>;
export type RankedItem = z.infer<typeof rankedItemSchema>;
export type RankedBadge = z.infer<typeof rankedBadgeSchema>;
export type RankedAction = z.infer<typeof rankedActionSchema>;
