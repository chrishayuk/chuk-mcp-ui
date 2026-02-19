import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("kanban schema validation", () => {
  it("accepts minimal valid kanban board", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        { id: "col-1", label: "To Do", cards: [] },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts board with all options", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      title: "Sprint Board",
      moveTool: "move_card",
      columns: [
        {
          id: "todo",
          label: "To Do",
          color: "#6366f1",
          limit: 5,
          cards: [
            {
              id: "c1",
              title: "Design login page",
              description: "Create wireframes",
              assignee: "Alice",
              priority: "high",
              image: "https://example.com/img.png",
              labels: [
                { text: "Design", color: "#8b5cf6" },
                { text: "UX" },
              ],
              metadata: { estimate: "3 points" },
            },
          ],
        },
        {
          id: "done",
          label: "Done",
          color: "#10b981",
          cards: [
            { id: "c2", title: "Setup CI" },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all priority values", () => {
    const priorities = ["low", "medium", "high", "critical"];
    for (const priority of priorities) {
      const data = {
        type: "kanban",
        version: "1.0",
        columns: [
          {
            id: "col-1",
            label: "Test",
            cards: [{ id: "c1", title: "Card", priority }],
          },
        ],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts cards with metadata", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        {
          id: "col-1",
          label: "Test",
          cards: [
            {
              id: "c1",
              title: "Card",
              metadata: { pr: "#123", reviewer: "Bob", epic: "Platform" },
            },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts column with WIP limit", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        { id: "col-1", label: "Doing", limit: 3, cards: [] },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing columns", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      title: "No Columns",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects column missing id", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [{ label: "To Do", cards: [] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects column missing label", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [{ id: "col-1", cards: [] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects column missing cards", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [{ id: "col-1", label: "To Do" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects card missing id", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        { id: "col-1", label: "To Do", cards: [{ title: "Card" }] },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects card missing title", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        { id: "col-1", label: "To Do", cards: [{ id: "c1" }] },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      columns: [
        { id: "col-1", label: "To Do", cards: [] },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid priority value", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        {
          id: "col-1",
          label: "Test",
          cards: [{ id: "c1", title: "Card", priority: "urgent" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects label missing text", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        {
          id: "col-1",
          label: "Test",
          cards: [
            { id: "c1", title: "Card", labels: [{ color: "#ff0000" }] },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [{ id: "col-1", label: "Test", cards: [] }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
