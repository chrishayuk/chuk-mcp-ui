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

// ── Union ────────────────────────────────────────────────────────

export type ViewMessage =
  | SelectMessage
  | FilterMessage
  | HighlightMessage
  | NavigateMessage
  | ExportRequestMessage;

// ── Message type string literal ──────────────────────────────────

export type ViewMessageType = ViewMessage["type"];

// ── Type-safe message map (for subscription filtering) ───────────

export interface ViewMessageMap {
  select: SelectMessage;
  filter: FilterMessage;
  highlight: HighlightMessage;
  navigate: NavigateMessage;
  "export-request": ExportRequestMessage;
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
