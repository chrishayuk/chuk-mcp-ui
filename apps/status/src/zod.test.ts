import { describe, it, expect } from "vitest";
import { statusSchema } from "./zod";

describe("status zod schema validation", () => {
  it("accepts minimal valid status", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ id: "api", label: "API Server", status: "ok" }],
    };
    expect(statusSchema.safeParse(data).success).toBe(true);
  });

  it("accepts status with all options", () => {
    const data = {
      type: "status",
      version: "1.0",
      title: "System Health",
      items: [
        { id: "api", label: "API Server", status: "ok", detail: "Response time: 45ms", lastChecked: "2024-01-15T10:30:00Z", url: "https://api.example.com" },
        { id: "db", label: "Database", status: "warning", detail: "High memory usage" },
        { id: "cache", label: "Cache", status: "error", detail: "Connection refused" },
      ],
      summary: { ok: 1, warning: 1, error: 1 },
    };
    expect(statusSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all status values", () => {
    const statuses = ["ok", "warning", "error", "unknown", "pending"] as const;
    for (const status of statuses) {
      const data = {
        type: "status" as const,
        version: "1.0" as const,
        items: [{ id: "svc", label: "Service", status }],
      };
      expect(statusSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing items", () => {
    const data = {
      type: "status",
      version: "1.0",
      title: "Health",
    };
    expect(statusSchema.safeParse(data).success).toBe(false);
  });

  it("rejects item missing id", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ label: "API", status: "ok" }],
    };
    expect(statusSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "progress",
      version: "1.0",
      items: [{ id: "api", label: "API", status: "ok" }],
    };
    expect(statusSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    const data = {
      type: "status",
      version: "1.0",
      items: [{ id: "api", label: "API", status: "critical" }],
    };
    expect(statusSchema.safeParse(data).success).toBe(false);
  });
});
