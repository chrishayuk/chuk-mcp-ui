import { z } from "zod";

const baseNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().optional(),
  color: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

type TreemapNodeInput = z.input<typeof baseNodeSchema> & {
  children?: TreemapNodeInput[];
};

const treemapNodeSchema: z.ZodType<TreemapNodeInput> = baseNodeSchema.extend({
  children: z.lazy(() => z.array(treemapNodeSchema)).optional(),
});

export { treemapNodeSchema };

export const treemapSchema = z.object({
  type: z.literal("treemap"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  root: treemapNodeSchema,
  colorField: z.string().optional(),
  showLabels: z.boolean().optional(),
  interactive: z.boolean().optional(),
});

export type TreemapContent = z.infer<typeof treemapSchema>;
export type TreemapNode = z.infer<typeof treemapNodeSchema>;
