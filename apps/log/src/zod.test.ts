import { describe, it, expect } from "vitest";
import { logSchema } from "./zod";

describe("log zod schema validation", () => {
  it("accepts minimal valid log", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ timestamp: "2024-03-15T10:00:00Z", level: "info", message: "Hello" }],
    };
    expect(logSchema.safeParse(data).success).toBe(true);
  });

  it("accepts log with all options", () => {
    const data = {
      type: "log",
      version: "1.0",
      title: "App Log",
      entries: [
        { id: "1", timestamp: "2024-03-15T10:00:00Z", level: "info", message: "Started", source: "server", metadata: { port: 3000 } },
        { id: "2", timestamp: "2024-03-15T10:00:01Z", level: "warn", message: "Slow query", source: "db" },
        { id: "3", timestamp: "2024-03-15T10:00:02Z", level: "error", message: "Connection lost" },
      ],
      levels: ["error", "fatal"],
      searchable: true,
      autoScroll: true,
      maxEntries: 1000,
      showTimestamp: true,
      monospace: false,
    };
    expect(logSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all log level values", () => {
    const levels = ["debug", "info", "warn", "error", "fatal"] as const;
    for (const level of levels) {
      const data = {
        type: "log" as const,
        version: "1.0" as const,
        entries: [{ timestamp: "2024-01-01T00:00:00Z", level, message: "msg" }],
      };
      expect(logSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing entries", () => {
    const data = {
      type: "log",
      version: "1.0",
      title: "Log",
    };
    expect(logSchema.safeParse(data).success).toBe(false);
  });

  it("rejects entry missing timestamp", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ level: "info", message: "Hello" }],
    };
    expect(logSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "status",
      version: "1.0",
      entries: [{ timestamp: "2024-01-01T00:00:00Z", level: "info", message: "Hello" }],
    };
    expect(logSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid level value", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ timestamp: "2024-01-01T00:00:00Z", level: "critical", message: "Hello" }],
    };
    expect(logSchema.safeParse(data).success).toBe(false);
  });
});
