import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("swimlane schema validation", () => {
  it("accepts minimal valid swimlane", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Design" }],
      columns: [{ id: "col-1", label: "Backlog" }],
      activities: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts swimlane with all options", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
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
          status: "completed",
        },
        {
          id: "a2",
          laneId: "dev",
          columnId: "in-progress",
          label: "Implement API",
          status: "active",
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all status values", () => {
    const statuses = ["pending", "active", "completed", "blocked"];
    for (const status of statuses) {
      const data = {
        type: "swimlane",
        version: "1.0",
        lanes: [{ id: "lane-1", label: "Team" }],
        columns: [{ id: "col-1", label: "Phase" }],
        activities: [
          { id: "a1", laneId: "lane-1", columnId: "col-1", label: "Task", status },
        ],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing lanes", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing columns", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      activities: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing activities", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects lane missing id", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects lane missing label", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects column missing id", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ label: "Phase" }],
      activities: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects column missing label", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1" }],
      activities: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects activity missing id", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [{ laneId: "lane-1", columnId: "col-1", label: "Task" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects activity missing laneId", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [{ id: "a1", columnId: "col-1", label: "Task" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects activity missing columnId", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [{ id: "a1", laneId: "lane-1", label: "Task" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects activity missing label", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [{ id: "a1", laneId: "lane-1", columnId: "col-1" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "swimlane",
      version: "1.0",
      lanes: [{ id: "lane-1", label: "Team" }],
      columns: [{ id: "col-1", label: "Phase" }],
      activities: [],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
