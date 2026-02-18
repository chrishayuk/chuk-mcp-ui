import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("status schema validation", () => {
  it("accepts minimal valid status", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ id: "api", label: "API Server", status: "ok" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts status with all options", () => {
    const data = {
      type: "status",
      version: "1.0",
      title: "System Health",
      items: [
        { id: "api", label: "API Server", status: "ok", detail: "Response time: 45ms", lastChecked: "2024-01-15T10:30:00Z", url: "https://api.example.com" },
        { id: "db", label: "Database", status: "warning", detail: "High memory usage (85%)" },
        { id: "cache", label: "Cache", status: "error", detail: "Connection refused" },
        { id: "queue", label: "Queue", status: "unknown" },
        { id: "worker", label: "Worker", status: "pending" },
      ],
      summary: { ok: 1, warning: 1, error: 1 },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all status values", () => {
    const statuses = ["ok", "warning", "error", "unknown", "pending"];
    for (const status of statuses) {
      const data = {
        type: "status",
        version: "1.0",
        items: [{ id: "svc", label: "Service", status }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing items", () => {
    const data = {
      type: "status",
      version: "1.0",
      title: "Health",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects item missing id", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ label: "API", status: "ok" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects item missing label", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ id: "api", status: "ok" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects item missing status", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ id: "api", label: "API" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "progress",
      version: "1.0",
      items: [{ id: "api", label: "API", status: "ok" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid status value", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ id: "api", label: "API", status: "critical" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ id: "api", label: "API", status: "ok" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
