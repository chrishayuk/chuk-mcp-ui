import { z } from "zod";

export const jsonSchema = z.object({
  type: z.literal("json"),
  version: z.literal("1.0"),
  data: z.unknown(),
  title: z.string().optional(),
  expandDepth: z.number().optional(),
  searchable: z.boolean().optional(),
});

export type JsonContent = z.infer<typeof jsonSchema>;
