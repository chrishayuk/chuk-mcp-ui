import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("progress schema validation", () => {
  it("accepts minimal valid progress", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ id: "t1", label: "Upload", value: 50 }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts progress with all options", () => {
    const data = {
      type: "progress",
      version: "1.0",
      title: "Build Pipeline",
      overall: 65,
      tracks: [
        { id: "compile", label: "Compile", value: 100, max: 100, status: "complete", detail: "Done in 2.3s" },
        { id: "test", label: "Test", value: 45, max: 100, status: "active", detail: "Running suite 3/7" },
        { id: "deploy", label: "Deploy", value: 0, max: 100, status: "pending" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all status values", () => {
    const statuses = ["active", "complete", "error", "pending"];
    for (const status of statuses) {
      const data = {
        type: "progress",
        version: "1.0",
        tracks: [{ id: "t1", label: "Task", value: 50, status }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts track with custom max", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ id: "t1", label: "Download", value: 750, max: 1024 }],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing tracks", () => {
    const data = {
      type: "progress",
      version: "1.0",
      title: "Build",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects track missing id", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ label: "Task", value: 50 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects track missing label", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ id: "t1", value: 50 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects track missing value", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ id: "t1", label: "Task" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "counter",
      version: "1.0",
      tracks: [{ id: "t1", label: "Task", value: 50 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ id: "t1", label: "Task", value: 50 }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
