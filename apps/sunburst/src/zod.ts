import { z } from "zod";
const baseSunburstNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().optional(),
  color: z.string().optional(),
});

type SunburstNodeInput = z.input<typeof baseSunburstNodeSchema> & {
  children?: SunburstNodeInput[];
};

export const sunburstNodeSchema: z.ZodType<SunburstNodeInput> =
  baseSunburstNodeSchema.extend({
    children: z.lazy(() => z.array(sunburstNodeSchema)).optional(),
  });

export const sunburstSchema = z.object({
  type: z.literal("sunburst"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  root: sunburstNodeSchema,
  showLabels: z.boolean().optional(),
  interactive: z.boolean().optional(),
});

export type SunburstContent = z.infer<typeof sunburstSchema>;
export type SunburstNode_ = z.infer<typeof sunburstNodeSchema>;
