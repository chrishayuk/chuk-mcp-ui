import { describe, it, expect } from "vitest";
import { kanbanSchema } from "./zod";

describe("kanban zod schema validation", () => {
  it("accepts minimal valid kanban board", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        { id: "col-1", label: "To Do", cards: [] },
      ],
    };
    expect(kanbanSchema.safeParse(data).success).toBe(true);
  });

  it("accepts board with all options", () => {
    const data = {
      type: "kanban" as const,
      version: "1.0" as const,
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
              priority: "high" as const,
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
    expect(kanbanSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all priority values", () => {
    const priorities = ["low", "medium", "high", "critical"] as const;
    for (const priority of priorities) {
      const data = {
        type: "kanban" as const,
        version: "1.0" as const,
        columns: [
          {
            id: "col-1",
            label: "Test",
            cards: [{ id: "c1", title: "Card", priority }],
          },
        ],
      };
      expect(kanbanSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing columns", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      title: "No Columns",
    };
    expect(kanbanSchema.safeParse(data).success).toBe(false);
  });

  it("rejects card missing id", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [
        { id: "col-1", label: "To Do", cards: [{ title: "Card" }] },
      ],
    };
    expect(kanbanSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      columns: [
        { id: "col-1", label: "To Do", cards: [] },
      ],
    };
    expect(kanbanSchema.safeParse(data).success).toBe(false);
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
    expect(kanbanSchema.safeParse(data).success).toBe(false);
  });

  it("accepts cards with metadata record", () => {
    const data = {
      type: "kanban" as const,
      version: "1.0" as const,
      columns: [
        {
          id: "col-1",
          label: "Test",
          cards: [
            {
              id: "c1",
              title: "Card",
              metadata: { pr: "#123", reviewer: "Bob" },
            },
          ],
        },
      ],
    };
    expect(kanbanSchema.safeParse(data).success).toBe(true);
  });

  it("rejects column missing cards array", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      columns: [{ id: "col-1", label: "Test" }],
    };
    expect(kanbanSchema.safeParse(data).success).toBe(false);
  });
});
