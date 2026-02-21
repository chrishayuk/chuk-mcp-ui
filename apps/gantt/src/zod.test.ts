import { describe, it, expect } from "vitest";
import { ganttSchema } from "./zod";

describe("gantt zod schema validation", () => {
  it("accepts minimal valid gantt", () => {
    const data = {
      type: "gantt",
      version: "1.0",
      tasks: [
        { id: "t1", label: "Task 1", start: "2025-01-01", end: "2025-01-15" },
      ],
    };
    expect(ganttSchema.safeParse(data).success).toBe(true);
  });

  it("accepts gantt with all optional fields", () => {
    const data = {
      type: "gantt",
      version: "1.0",
      title: "Project Plan",
      startDate: "2025-01-01",
      endDate: "2025-06-30",
      tasks: [
        {
          id: "t1",
          label: "Design",
          start: "2025-01-01",
          end: "2025-01-31",
          progress: 100,
          color: "#3b82f6",
          group: "Phase 1",
        },
        {
          id: "t2",
          label: "Development",
          start: "2025-02-01",
          end: "2025-04-30",
          progress: 50,
          color: "#22c55e",
          dependencies: ["t1"],
          group: "Phase 2",
        },
      ],
    };
    expect(ganttSchema.safeParse(data).success).toBe(true);
  });

  it("accepts gantt with empty tasks", () => {
    const data = {
      type: "gantt",
      version: "1.0",
      tasks: [],
    };
    expect(ganttSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      tasks: [{ id: "t1", label: "Task", start: "2025-01-01", end: "2025-01-15" }],
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      tasks: [{ id: "t1", label: "Task", start: "2025-01-01", end: "2025-01-15" }],
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = {
      type: "gantt",
      version: "2.0",
      tasks: [{ id: "t1", label: "Task", start: "2025-01-01", end: "2025-01-15" }],
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing tasks", () => {
    const data = {
      type: "gantt",
      version: "1.0",
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });

  it("rejects task with missing id", () => {
    const data = {
      type: "gantt",
      version: "1.0",
      tasks: [{ label: "Task", start: "2025-01-01", end: "2025-01-15" }],
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });

  it("rejects task with missing label", () => {
    const data = {
      type: "gantt",
      version: "1.0",
      tasks: [{ id: "t1", start: "2025-01-01", end: "2025-01-15" }],
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });

  it("rejects task with missing start", () => {
    const data = {
      type: "gantt",
      version: "1.0",
      tasks: [{ id: "t1", label: "Task", end: "2025-01-15" }],
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });

  it("rejects task with missing end", () => {
    const data = {
      type: "gantt",
      version: "1.0",
      tasks: [{ id: "t1", label: "Task", start: "2025-01-01" }],
    };
    expect(ganttSchema.safeParse(data).success).toBe(false);
  });
});
