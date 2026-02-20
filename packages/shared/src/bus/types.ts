// ── Individual message payloads ──────────────────────────────────

export interface SelectMessage {
  type: "select";
  source: string;
  ids: string[];
}

export interface FilterMessage {
  type: "filter";
  source: string;
  field: string;
  value: unknown;
}

export interface HighlightMessage {
  type: "highlight";
  source: string;
  id: string;
}

export interface NavigateMessage {
  type: "navigate";
  source: string;
  target: string;
  params: Record<string, unknown>;
}

export interface ExportRequestMessage {
  type: "export-request";
  source: string;
  format: "png" | "csv" | "json";
}

export interface DragStartMessage {
  type: "drag-start";
  source: string;
  item: { dragType: string; data: Record<string, unknown> };
}

export interface DragEndMessage {
  type: "drag-end";
  source: string;
}

export interface DropMessage {
  type: "drop";
  source: string;
  item: { dragType: string; data: Record<string, unknown> };
  targetPanelId: string;
}

export interface UpdateMessage {
  type: "update";
  source: string;
  field: string;
  value: unknown;
}

// ── Union ────────────────────────────────────────────────────────

export type ViewMessage =
  | SelectMessage
  | FilterMessage
  | HighlightMessage
  | NavigateMessage
  | ExportRequestMessage
  | DragStartMessage
  | DragEndMessage
  | DropMessage
  | UpdateMessage;

// ── Message type string literal ──────────────────────────────────

export type ViewMessageType = ViewMessage["type"];

// ── Type-safe message map (for subscription filtering) ───────────

export interface ViewMessageMap {
  select: SelectMessage;
  filter: FilterMessage;
  highlight: HighlightMessage;
  navigate: NavigateMessage;
  "export-request": ExportRequestMessage;
  "drag-start": DragStartMessage;
  "drag-end": DragEndMessage;
  drop: DropMessage;
  update: UpdateMessage;
}

// ── Wire envelope (what actually goes over postMessage) ──────────

export interface ViewBusEnvelope {
  __chuk_bus: true;
  __chuk_bus_version: 1;
  __chuk_source_panel?: string;
  message: ViewMessage;
}

// ── Callback signatures ──────────────────────────────────────────

export type ViewBusHandler<T extends ViewMessageType = ViewMessageType> =
  (message: ViewMessageMap[T], sourcePanelId?: string) => void;

export type ViewBusUnsubscribe = () => void;
