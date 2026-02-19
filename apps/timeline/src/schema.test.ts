import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("timeline schema validation", () => {
  it("accepts minimal valid timeline", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event One", date: "2024-01-15" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts timeline with all options", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      title: "Project Timeline",
      orientation: "vertical",
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
          severity: "info",
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
          severity: "success",
          tags: ["release"],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all severity values", () => {
    const severities = ["info", "success", "warning", "error"];
    for (const severity of severities) {
      const data = {
        type: "timeline",
        version: "1.0",
        events: [{ id: "e1", title: "Event", date: "2024-01-01", severity }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts both orientation values", () => {
    for (const orientation of ["vertical", "horizontal"]) {
      const data = {
        type: "timeline",
        version: "1.0",
        events: [{ id: "e1", title: "Event", date: "2024-01-01" }],
        orientation,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing events", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      title: "No Events",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects event missing id", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ title: "Event", date: "2024-01-01" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects event missing title", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", date: "2024-01-01" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects event missing date", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "status",
      version: "1.0",
      events: [{ id: "e1", title: "Event", date: "2024-01-01" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid severity value", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [
        { id: "e1", title: "Event", date: "2024-01-01", severity: "critical" },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects group missing id", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event", date: "2024-01-01" }],
      groups: [{ label: "Dev" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects group missing label", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event", date: "2024-01-01" }],
      groups: [{ id: "dev" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      events: [{ id: "e1", title: "Event", date: "2024-01-01" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
