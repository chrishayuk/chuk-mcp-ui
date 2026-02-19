export interface LogContent {
  type: "log";
  version: "1.0";
  title?: string;
  entries: LogEntry[];
  levels?: LogLevel[];
  searchable?: boolean;
  autoScroll?: boolean;
  maxEntries?: number;
  showTimestamp?: boolean;
  monospace?: boolean;
}

export interface LogEntry {
  id?: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
