export interface ConfirmContent {
  type: "confirm";
  version: "1.0";
  title: string;
  message: string;
  severity?: "info" | "warning" | "danger";
  details?: ConfirmDetail[];
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTool?: string;
  confirmArgs?: Record<string, unknown>;
  cancelTool?: string;
  cancelArgs?: Record<string, unknown>;
}

export interface ConfirmDetail {
  label: string;
  value: string;
}
