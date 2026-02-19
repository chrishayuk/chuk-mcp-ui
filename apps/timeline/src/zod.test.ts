import { describe, it, expect } from "vitest";
import { timelineSchema } from "./zod";

describe("timeline zod schema validation", () => {
  it("accepts minimal valid timeline", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event One", date: "2024-01-15" }],
    };
    expect(timelineSchema.safeParse(data).success).toBe(true);
  });

  it("accepts timeline with all options", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      title: "Project Timeline",
      orientation: "vertical" as const,
      groups: [
        { id: "dev", label: "Development", color: "#2563eb" },
        { id: "ops", label: "Operations" },
      ],
      events: [
        {
          id: "e1",
          title: "Kickoff",
          description: "Project started",
          date: "2024-01-01",
          endDate: "2024-01-02",
          group: "dev",
          icon: "\uD83D\uDE80",
          color: "#ff0000",
          severity: "info" as const,
          tags: ["milestone", "planning"],
          action: {
            label: "View Details",
            tool: "get_event",
            arguments: { id: "e1" },
          },
          details: [
            { label: "Lead", value: "Alice" },
            { label: "Budget", value: "$100k" },
          ],
        },
        {
          id: "e2",
          title: "Deployment",
          date: "2024-03-15",
          group: "ops",
          severity: "success" as const,
          tags: ["release"],
        },
      ],
    };
    expect(timelineSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all severity values", () => {
    const severities = ["info", "success", "warning", "error"] as const;
    for (const severity of severities) {
      const data = {
        type: "timeline" as const,
        version: "1.0" as const,
        events: [{ id: "e1", title: "Event", date: "2024-01-01", severity }],
      };
      expect(timelineSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing events", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      title: "No Events",
    };
    expect(timelineSchema.safeParse(data).success).toBe(false);
  });

  it("rejects event missing id", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ title: "Event", date: "2024-01-01" }],
    };
    expect(timelineSchema.safeParse(data).success).toBe(false);
  });

  it("rejects event missing title", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", date: "2024-01-01" }],
    };
    expect(timelineSchema.safeParse(data).success).toBe(false);
  });

  it("rejects event missing date", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event" }],
    };
    expect(timelineSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "status",
      version: "1.0",
      events: [{ id: "e1", title: "Event", date: "2024-01-01" }],
    };
    expect(timelineSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid severity value", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [
        { id: "e1", title: "Event", date: "2024-01-01", severity: "critical" },
      ],
    };
    expect(timelineSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid orientation value", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event", date: "2024-01-01" }],
      orientation: "diagonal",
    };
    expect(timelineSchema.safeParse(data).success).toBe(false);
  });
});
