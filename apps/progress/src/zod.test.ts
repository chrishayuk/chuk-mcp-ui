import { describe, it, expect } from "vitest";
import { progressSchema } from "./zod";

describe("progress zod schema validation", () => {
  it("accepts minimal valid progress", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ id: "t1", label: "Upload", value: 50 }],
    };
    expect(progressSchema.safeParse(data).success).toBe(true);
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
    expect(progressSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all status values", () => {
    const statuses = ["active", "complete", "error", "pending"] as const;
    for (const status of statuses) {
      const data = {
        type: "progress" as const,
        version: "1.0" as const,
        tracks: [{ id: "t1", label: "Task", value: 50, status }],
      };
      expect(progressSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing tracks", () => {
    const data = {
      type: "progress",
      version: "1.0",
      title: "Build",
    };
    expect(progressSchema.safeParse(data).success).toBe(false);
  });

  it("rejects track missing id", () => {
    const data = {
      type: "progress",
      version: "1.0",
      tracks: [{ label: "Task", value: 50 }],
    };
    expect(progressSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "counter",
      version: "1.0",
      tracks: [{ id: "t1", label: "Task", value: 50 }],
    };
    expect(progressSchema.safeParse(data).success).toBe(false);
  });
});
