import { z } from "zod";

export const markdownCellSchema = z.object({
  cellType: z.literal("markdown"),
  source: z.string(),
  collapsed: z.boolean().optional(),
});

export const codeCellSchema = z.object({
  cellType: z.literal("code"),
  source: z.string(),
  language: z.string().optional(),
  output: z.string().optional(),
  collapsed: z.boolean().optional(),
});

export const tableCellSchema = z.object({
  cellType: z.literal("table"),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  caption: z.string().optional(),
  collapsed: z.boolean().optional(),
});

export const imageCellSchema = z.object({
  cellType: z.literal("image"),
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  collapsed: z.boolean().optional(),
});

export const counterCellSchema = z.object({
  cellType: z.literal("counter"),
  value: z.number(),
  label: z.string().optional(),
  collapsed: z.boolean().optional(),
});

export const notebookCellSchema = z.discriminatedUnion("cellType", [
  markdownCellSchema,
  codeCellSchema,
  tableCellSchema,
  imageCellSchema,
  counterCellSchema,
]);

export const notebookSchema = z.object({
  type: z.literal("notebook"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  cells: z.array(notebookCellSchema),
});

export type NotebookContent = z.infer<typeof notebookSchema>;
export type NotebookCell = z.infer<typeof notebookCellSchema>;
export type MarkdownCell = z.infer<typeof markdownCellSchema>;
export type CodeCell = z.infer<typeof codeCellSchema>;
export type TableCell = z.infer<typeof tableCellSchema>;
export type ImageCell = z.infer<typeof imageCellSchema>;
export type CounterCell = z.infer<typeof counterCellSchema>;
