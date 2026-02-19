import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("log schema validation", () => {
  it("accepts minimal valid log", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ timestamp: "2024-03-15T10:00:00Z", level: "info", message: "Hello" }],
    };
    expect(validate(data)).toBe(true);
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
        { id: "4", timestamp: "2024-03-15T10:00:03Z", level: "debug", message: "Retrying..." },
        { id: "5", timestamp: "2024-03-15T10:00:04Z", level: "fatal", message: "OOM" },
      ],
      levels: ["error", "fatal"],
      searchable: true,
      autoScroll: true,
      maxEntries: 1000,
      showTimestamp: true,
      monospace: false,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all log level values", () => {
    const levels = ["debug", "info", "warn", "error", "fatal"];
    for (const level of levels) {
      const data = {
        type: "log",
        version: "1.0",
        entries: [{ timestamp: "2024-01-01T00:00:00Z", level, message: "msg" }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing entries", () => {
    const data = {
      type: "log",
      version: "1.0",
      title: "Log",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects entry missing timestamp", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ level: "info", message: "Hello" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects entry missing level", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ timestamp: "2024-01-01T00:00:00Z", message: "Hello" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects entry missing message", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ timestamp: "2024-01-01T00:00:00Z", level: "info" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "status",
      version: "1.0",
      entries: [{ timestamp: "2024-01-01T00:00:00Z", level: "info", message: "Hello" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid level value", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ timestamp: "2024-01-01T00:00:00Z", level: "critical", message: "Hello" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "log",
      version: "1.0",
      entries: [{ timestamp: "2024-01-01T00:00:00Z", level: "info", message: "Hello" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
