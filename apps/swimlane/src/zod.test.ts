import { describe, it, expect } from "vitest";
import { swimlaneSchema } from "./zod";

describe("swimlane zod schema validation", () => {
  it("accepts minimal valid swimlane", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Design" }],
      columns: [{ id: "col-1", label: "Backlog" }],
      activities: [],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(true);
  });

  it("accepts swimlane with all options", () => {
    const data = {
      type: "swimlane" as const,
      version: "1.0" as const,
      title: "Software Delivery Pipeline",
      lanes: [
        { id: "design", label: "Design", color: "#8b5cf6" },
        { id: "dev", label: "Development", color: "#3b82f6" },
      ],
      columns: [
        { id: "backlog", label: "Backlog" },
        { id: "in-progress", label: "In Progress" },
      ],
      activities: [
        {
          id: "a1",
          laneId: "design",
          columnId: "backlog",
          label: "Create wireframes",
          description: "Initial wireframes for the dashboard",
          color: "#8b5cf6",
          status: "completed" as const,
        },
        {
          id: "a2",
          laneId: "dev",
          columnId: "in-progress",
          label: "Implement API",
          status: "active" as const,
        },
      ],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all status values", () => {
    const statuses = ["pending", "active", "completed", "blocked"] as const;
    for (const status of statuses) {
      const data = {
        type: "swimlane" as const,
        version: "1.0" as const,
        lanes: [{ id: "lane-1", label: "Team" }],
        columns: [{ id: "col-1", label: "Phase" }],
        activities: [
          { id: "a1", laneId: "lane-1", columnId: "col-1", label: "Task", status },
        ],
      };
      expect(swimlaneSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing lanes", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing columns", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      activities: [],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing activities", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });

  it("rejects activity missing laneId", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [{ id: "a1", columnId: "col-1", label: "Task" }],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [
        { id: "a1", laneId: "lane-1", columnId: "col-1", label: "Task", status: "cancelled" },
      ],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });

  it("rejects activity missing id", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [{ laneId: "lane-1", columnId: "col-1", label: "Task" }],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });

  it("rejects lane missing label", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
    };
    expect(swimlaneSchema.safeParse(data).success).toBe(false);
  });
});
