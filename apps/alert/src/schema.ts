export interface AlertContent {
  type: "alert";
  version: "1.0";
  title?: string;
  alerts: AlertItem[];
  groupBy?: "severity" | "category" | "source";
  dismissible?: boolean;
}

export interface AlertItem {
  id: string;
  severity: "info" | "success" | "warning" | "error" | "critical";
  title: string;
  message?: string;
  source?: string;
  category?: string;
  timestamp?: string;
  dismissible?: boolean;
  actions?: AlertAction[];
  metadata?: Record<string, string>;
}

export interface AlertAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
  variant?: "default" | "destructive";
}
