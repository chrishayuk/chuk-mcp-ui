import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("calendar schema validation", () => {
  it("accepts minimal valid calendar", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [{ id: "1", title: "Meeting", start: "2025-03-15T10:00:00Z" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts calendar with all optional fields", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      title: "Team Calendar",
      events: [
        {
          id: "1",
          title: "Sprint Planning",
          start: "2025-03-15T10:00:00Z",
          end: "2025-03-15T11:00:00Z",
          allDay: false,
          color: "#3b82f6",
          description: "Bi-weekly sprint planning session",
        },
      ],
      defaultView: "month",
      defaultDate: "2025-03-01",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts empty events array", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all view types", () => {
    for (const view of ["month", "week", "agenda"]) {
      const data = {
        type: "calendar",
        version: "1.0",
        events: [],
        defaultView: view,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all-day events", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [
        { id: "h1", title: "Holiday", start: "2025-12-25", allDay: true },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing type field", () => {
    const data = {
      version: "1.0",
      events: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version field", () => {
    const data = {
      type: "calendar",
      events: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing events field", () => {
    const data = {
      type: "calendar",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type value", () => {
    const data = {
      type: "chart",
      version: "1.0",
      events: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version value", () => {
    const data = {
      type: "calendar",
      version: "2.0",
      events: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects event with missing id", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [{ title: "Meeting", start: "2025-03-15T10:00:00Z" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects event with missing title", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [{ id: "1", start: "2025-03-15T10:00:00Z" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects event with missing start", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [{ id: "1", title: "Meeting" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid defaultView", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [],
      defaultView: "year",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields for forward compatibility", () => {
    const data = {
      type: "calendar",
      version: "1.0",
      events: [],
      futureField: "some value",
    };
    expect(validate(data)).toBe(true);
  });
});
