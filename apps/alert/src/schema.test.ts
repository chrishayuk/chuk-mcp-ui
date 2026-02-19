import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("alert schema validation", () => {
  it("accepts minimal valid alert", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [{ id: "a1", severity: "info", title: "Server started" }],
    };
    expect(validate(data)).toBe(true);
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
            { label: "View Logs", tool: "view_logs", arguments: { service: "postgres" } },
          ],
          metadata: { host: "db-primary-01", region: "us-east-1" },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all severity values", () => {
    const severities = ["info", "success", "warning", "error", "critical"];
    for (const severity of severities) {
      const data = {
        type: "alert",
        version: "1.0",
        alerts: [{ id: "a1", severity, title: "Test alert" }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all groupBy values", () => {
    const groupByValues = ["severity", "category", "source"];
    for (const groupBy of groupByValues) {
      const data = {
        type: "alert",
        version: "1.0",
        groupBy,
        alerts: [{ id: "a1", severity: "info", title: "Test" }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing alerts", () => {
    const data = {
      type: "alert",
      version: "1.0",
      title: "Alerts",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      alerts: [{ id: "a1", severity: "info", title: "Test" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "alert",
      alerts: [{ id: "a1", severity: "info", title: "Test" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid severity value", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [{ id: "a1", severity: "fatal", title: "Test" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects alert missing id", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [{ severity: "info", title: "Test" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "alert",
      version: "1.0",
      alerts: [{ id: "a1", severity: "info", title: "Test" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
