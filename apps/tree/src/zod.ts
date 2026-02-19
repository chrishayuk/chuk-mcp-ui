import { z } from "zod";
import type { TreeNode } from "./schema";

export const treeBadgeSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
});

export const treeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    badge: treeBadgeSchema.optional(),
    children: z.array(treeNodeSchema).optional(),
    hasChildren: z.boolean().optional(),
    disabled: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
);

export const treeSchema = z.object({
  type: z.literal("tree"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  roots: z.array(treeNodeSchema),
  selection: z.enum(["none", "single", "multi"]).optional(),
  searchable: z.boolean().optional(),
  expandDepth: z.number().optional(),
  loadChildrenTool: z.string().optional(),
});

export type TreeContent = z.infer<typeof treeSchema>;
export type TreeNode_ = z.infer<typeof treeNodeSchema>;
export type TreeBadge = z.infer<typeof treeBadgeSchema>;
