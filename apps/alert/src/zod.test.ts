import { describe, it, expect } from "vitest";
import { alertSchema } from "./zod";

describe("alert zod schema validation", () => {
  it("accepts minimal valid alert", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [{ id: "a1", severity: "info", title: "Server started" }],
    };
    expect(alertSchema.safeParse(data).success).toBe(true);
  });

  it("accepts alert with all options", () => {
    const data = {
      type: "alert",
      version: "1.0",
      title: "System Alerts",
      groupBy: "severity",
      dismissible: true,
      alerts: [
        {
          id: "a1",
          severity: "critical",
          title: "Database down",
          message: "Primary database is unreachable",
          source: "db-monitor",
          category: "infrastructure",
          timestamp: "2024-01-15T10:30:00Z",
          dismissible: false,
          actions: [
            { label: "Restart", tool: "restart_service", arguments: { service: "postgres" }, variant: "destructive" },
          ],
          metadata: { host: "db-primary-01", region: "us-east-1" },
        },
      ],
    };
    expect(alertSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all severity values", () => {
    const severities = ["info", "success", "warning", "error", "critical"] as const;
    for (const severity of severities) {
      const data = {
        type: "alert" as const,
        version: "1.0" as const,
        alerts: [{ id: "a1", severity, title: "Test alert" }],
      };
      expect(alertSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing alerts", () => {
    const data = {
      type: "alert",
      version: "1.0",
      title: "Alerts",
    };
    expect(alertSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "status",
      version: "1.0",
      alerts: [{ id: "a1", severity: "info", title: "Test" }],
    };
    expect(alertSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid severity value", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [{ id: "a1", severity: "fatal", title: "Test" }],
    };
    expect(alertSchema.safeParse(data).success).toBe(false);
  });

  it("rejects alert missing id", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [{ severity: "info", title: "Test" }],
    };
    expect(alertSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid action variant", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [
        {
          id: "a1",
          severity: "info",
          title: "Test",
          actions: [
            { label: "Go", tool: "do_thing", arguments: { x: "1" }, variant: "primary" },
          ],
        },
      ],
    };
    expect(alertSchema.safeParse(data).success).toBe(false);
  });
});
