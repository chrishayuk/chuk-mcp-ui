import { z } from "zod";

// ── v1.0 schemas (unchanged) ────────────────────────────────────

export const panelSchemaV1 = z.object({
  id: z.string(),
  label: z.string().optional(),
  viewUrl: z.string(),
  structuredContent: z.unknown(),
  width: z.string().optional(),
  height: z.string().optional(),
  minWidth: z.string().optional(),
  minHeight: z.string().optional(),
});

export const dashboardSchemaV1 = z.object({
  type: z.literal("dashboard"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  layout: z.enum(["split-horizontal", "split-vertical", "grid"]),
  panels: z.array(panelSchemaV1),
  gap: z.string().optional(),
});

// ── v2.0 schemas ────────────────────────────────────────────────

export const showConditionSchema = z.object({
  linkedPanelHasSelection: z.string(),
});

export const crossViewLinkSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum(["selection", "filter", "highlight", "navigate", "update"]),
  sourceField: z.string(),
  targetField: z.string(),
  bidirectional: z.boolean().optional(),
});

const gridLayoutSchema = z.object({
  type: z.literal("grid"),
  columns: z.number().int().min(1).max(12),
  rows: z.number().int().min(1).optional(),
  gap: z.string().optional(),
});

const namedLayoutSchema = z.object({
  type: z.literal("named"),
  preset: z.enum([
    "map-sidebar",
    "dashboard-kpi",
    "investigation",
    "report",
    "compare",
  ]),
});

export const layoutConfigSchema = z.union([
  z.enum(["auto", "split", "split-horizontal", "split-vertical", "tabs", "grid"]),
  gridLayoutSchema,
  namedLayoutSchema,
]);

export const panelSchemaV2 = z
  .object({
    id: z.string(),
    label: z.string().optional(),
    viewUrl: z.string().optional(),
    viewType: z.string().optional(),
    structuredContent: z.unknown(),
    selectionField: z.string().optional(),
    priority: z.number().int().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    minWidth: z.string().optional(),
    minHeight: z.string().optional(),
    showWhen: showConditionSchema.optional(),
    collapsed: z.boolean().optional(),
  })
  .refine((p) => p.viewUrl != null || p.viewType != null, {
    message: "Panel must have either viewUrl or viewType",
  });

export const dashboardSchemaV2 = z.object({
  type: z.literal("dashboard"),
  version: z.literal("2.0"),
  title: z.string().optional(),
  layout: layoutConfigSchema,
  panels: z.array(panelSchemaV2),
  links: z.array(crossViewLinkSchema).optional(),
  gap: z.string().optional(),
  viewRegistry: z.record(z.string(), z.string()).optional(),
});

// ── Combined schema ─────────────────────────────────────────────

export const dashboardSchema = z.discriminatedUnion("version", [
  dashboardSchemaV1,
  dashboardSchemaV2,
]);

// ── v3.0 patch schemas ─────────────────────────────────────────

const addPanelOpSchema = z.object({
  op: z.literal("add-panel"),
  panel: panelSchemaV2,
  after: z.string().optional(),
});

const removePanelOpSchema = z.object({
  op: z.literal("remove-panel"),
  panelId: z.string(),
});

const updatePanelOpSchema = z.object({
  op: z.literal("update-panel"),
  panelId: z.string(),
  action: z.enum(["replace", "merge", "append"]),
  data: z.record(z.string(), z.unknown()),
  targetField: z.string().optional(),
});

const showPanelOpSchema = z.object({
  op: z.literal("show-panel"),
  panelId: z.string(),
  visible: z.boolean(),
});

const collapsePanelOpSchema = z.object({
  op: z.literal("collapse-panel"),
  panelId: z.string(),
  collapsed: z.boolean(),
});

const addLinkOpSchema = z.object({
  op: z.literal("add-link"),
  link: crossViewLinkSchema,
});

const removeLinkOpSchema = z.object({
  op: z.literal("remove-link"),
  source: z.string(),
  target: z.string(),
});

const updateLayoutOpSchema = z.object({
  op: z.literal("update-layout"),
  layout: layoutConfigSchema,
});

const setLoadingOpSchema = z.object({
  op: z.literal("set-loading"),
  panelId: z.string(),
  loading: z.boolean(),
});

const setErrorOpSchema = z.object({
  op: z.literal("set-error"),
  panelId: z.string(),
  error: z.string().nullable(),
});

export const patchOpSchema = z.discriminatedUnion("op", [
  addPanelOpSchema,
  removePanelOpSchema,
  updatePanelOpSchema,
  showPanelOpSchema,
  collapsePanelOpSchema,
  addLinkOpSchema,
  removeLinkOpSchema,
  updateLayoutOpSchema,
  setLoadingOpSchema,
  setErrorOpSchema,
]);

export const uiPatchSchema = z.object({
  type: z.literal("ui_patch"),
  version: z.literal("3.0"),
  ops: z.array(patchOpSchema),
});

// ── Re-exports for convenience ──────────────────────────────────

export type DashboardContent = z.infer<typeof dashboardSchema>;
export type DashboardContentV1 = z.infer<typeof dashboardSchemaV1>;
export type DashboardContentV2 = z.infer<typeof dashboardSchemaV2>;
export type PanelV1 = z.infer<typeof panelSchemaV1>;
export type PanelV2 = z.infer<typeof panelSchemaV2>;
export type CrossViewLink = z.infer<typeof crossViewLinkSchema>;
export type UIPatch = z.infer<typeof uiPatchSchema>;
export type PatchOp = z.infer<typeof patchOpSchema>;
