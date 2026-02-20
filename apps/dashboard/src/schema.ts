// ── v1.0 types (unchanged) ───────────────────────────────────────

export interface DashboardContentV1 {
  type: "dashboard";
  version: "1.0";
  title?: string;
  layout: "split-horizontal" | "split-vertical" | "grid";
  panels: PanelV1[];
  gap?: string;
}

export interface PanelV1 {
  id: string;
  label?: string;
  viewUrl: string;
  structuredContent: unknown;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
}

// ── v2.0 types ──────────────────────────────────────────────────

export type ViewType =
  | "map" | "datatable" | "chart" | "form" | "markdown"
  | "video" | "pdf" | "detail" | "counter" | "code"
  | "progress" | "confirm" | "json" | "status"
  | "dashboard" | "split" | "tabs"
  | "compare" | "gallery" | "ranked" | "poll" | "quiz" | "chat"
  | "image" | "log" | "timeline" | "tree"
  | "alert" | "diff" | "embed" | "filter" | "kanban" | "settings" | "stepper"
  | "gauge" | "heatmap" | "crosstab" | "scatter" | "boxplot"
  | "timeseries" | "treemap" | "sunburst" | "pivot" | "profile"
  | "audio" | "carousel" | "terminal" | "gis-legend" | "layers" | "minimap" | "spectrogram"
  | (string & {}); // allow custom viewTypes

export interface GridLayout {
  type: "grid";
  columns: number;
  rows?: number;
  gap?: string;
}

export interface NamedLayout {
  type: "named";
  preset: NamedLayoutPreset;
}

export type NamedLayoutPreset =
  | "map-sidebar"
  | "dashboard-kpi"
  | "investigation"
  | "report"
  | "compare";

export type LayoutConfig =
  | "auto"
  | "split"
  | "split-horizontal"
  | "split-vertical"
  | "tabs"
  | "grid"
  | GridLayout
  | NamedLayout;

export interface ShowCondition {
  linkedPanelHasSelection: string;
}

export interface CrossViewLink {
  source: string;
  target: string;
  type: "selection" | "filter" | "highlight" | "navigate" | "update";
  sourceField: string;
  targetField: string;
  bidirectional?: boolean;
}

export interface PanelV2 {
  id: string;
  label?: string;
  viewUrl?: string;
  viewType?: ViewType;
  structuredContent: unknown;
  selectionField?: string;
  priority?: number;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  showWhen?: ShowCondition;
  collapsed?: boolean;
}

export interface DashboardContentV2 {
  type: "dashboard";
  version: "2.0";
  title?: string;
  layout: LayoutConfig;
  panels: PanelV2[];
  links?: CrossViewLink[];
  gap?: string;
  viewRegistry?: Record<string, string>;
}

// ── Discriminated union ─────────────────────────────────────────

export type DashboardContent = DashboardContentV1 | DashboardContentV2;
export type Panel = PanelV1 | PanelV2;

// ── v3.0 patch types ────────────────────────────────────────────

export interface UIPatch {
  type: "ui_patch";
  version: "3.0";
  ops: PatchOp[];
}

export type PatchOp =
  | AddPanelOp
  | RemovePanelOp
  | UpdatePanelOp
  | ShowPanelOp
  | CollapsePanelOp
  | AddLinkOp
  | RemoveLinkOp
  | UpdateLayoutOp
  | SetLoadingOp
  | SetErrorOp;

export interface AddPanelOp {
  op: "add-panel";
  panel: PanelV2;
  after?: string;
}

export interface RemovePanelOp {
  op: "remove-panel";
  panelId: string;
}

export interface UpdatePanelOp {
  op: "update-panel";
  panelId: string;
  action: "replace" | "merge" | "append";
  data: Record<string, unknown>;
  targetField?: string;
}

export interface ShowPanelOp {
  op: "show-panel";
  panelId: string;
  visible: boolean;
}

export interface CollapsePanelOp {
  op: "collapse-panel";
  panelId: string;
  collapsed: boolean;
}

export interface AddLinkOp {
  op: "add-link";
  link: CrossViewLink;
}

export interface RemoveLinkOp {
  op: "remove-link";
  source: string;
  target: string;
}

export interface UpdateLayoutOp {
  op: "update-layout";
  layout: LayoutConfig;
}

export interface SetLoadingOp {
  op: "set-loading";
  panelId: string;
  loading: boolean;
}

export interface SetErrorOp {
  op: "set-error";
  panelId: string;
  error: string | null;
}
