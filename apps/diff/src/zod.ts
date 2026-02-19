import { z } from "zod";

export const diffLineSchema = z.object({
  type: z.enum(["context", "add", "remove"]),
  content: z.string(),
  lineA: z.number().optional(),
  lineB: z.number().optional(),
});

export const diffHunkSchema = z.object({
  headerA: z.string(),
  headerB: z.string().optional(),
  lines: z.array(diffLineSchema),
});

export const diffSchema = z.object({
  type: z.literal("diff"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  language: z.string().optional(),
  mode: z.enum(["unified", "split"]).optional(),
  fileA: z.string().optional(),
  fileB: z.string().optional(),
  hunks: z.array(diffHunkSchema),
});

export type DiffContent = z.infer<typeof diffSchema>;
export type DiffHunk = z.infer<typeof diffHunkSchema>;
export type DiffLine = z.infer<typeof diffLineSchema>;
