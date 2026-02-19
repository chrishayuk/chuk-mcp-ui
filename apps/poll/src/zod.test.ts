import { describe, it, expect } from "vitest";
import { pollSchema } from "./zod";

describe("poll zod schema validation", () => {
  it("accepts minimal valid poll", () => {
    const data = {
      type: "poll",
      version: "1.0",
      title: "Quick Poll",
      questions: [
        {
          id: "q1",
          type: "single-choice",
          prompt: "Pick one",
          options: [
            { id: "a", label: "Option A" },
            { id: "b", label: "Option B" },
          ],
        },
      ],
      voteTool: "submit_vote",
    };
    expect(pollSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full poll with all settings", () => {
    const data = {
      type: "poll",
      version: "1.0",
      title: "Full Survey",
      description: "A comprehensive survey",
      questions: [
        {
          id: "q1",
          type: "multi-choice",
          prompt: "Select your favorites",
          maxSelections: 2,
          image: { url: "https://example.com/img.png", alt: "Question image" },
          options: [
            { id: "a", label: "Option A", color: "#ff0000" },
            { id: "b", label: "Option B", image: { url: "https://example.com/b.png" } },
            { id: "c", label: "Option C" },
          ],
        },
        {
          id: "q2",
          type: "rating",
          prompt: "Rate this",
          options: [
            { id: "1", label: "1 star" },
            { id: "2", label: "2 stars" },
            { id: "3", label: "3 stars" },
            { id: "4", label: "4 stars" },
            { id: "5", label: "5 stars" },
          ],
        },
      ],
      settings: {
        showResults: "after-vote",
        allowChange: true,
        multiQuestion: true,
        anonymous: true,
        closedMessage: "This poll is closed",
      },
      voteTool: "submit_survey",
      resultsTool: "get_results",
    };
    expect(pollSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all question types", () => {
    const types = ["single-choice", "multi-choice", "rating", "ranking"];
    for (const qType of types) {
      const data = {
        type: "poll",
        version: "1.0",
        title: "Test",
        questions: [
          {
            id: "q1",
            type: qType,
            prompt: "Test question",
            options: [{ id: "a", label: "A" }],
          },
        ],
        voteTool: "vote",
      };
      expect(pollSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing questions", () => {
    const data = {
      type: "poll",
      version: "1.0",
      title: "No Questions",
      voteTool: "vote",
    };
    expect(pollSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing voteTool", () => {
    const data = {
      type: "poll",
      version: "1.0",
      title: "No Tool",
      questions: [
        {
          id: "q1",
          type: "single-choice",
          prompt: "Pick one",
          options: [{ id: "a", label: "A" }],
        },
      ],
    };
    expect(pollSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      title: "Wrong Type",
      questions: [
        {
          id: "q1",
          type: "single-choice",
          prompt: "Pick one",
          options: [{ id: "a", label: "A" }],
        },
      ],
      voteTool: "vote",
    };
    expect(pollSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid question type", () => {
    const data = {
      type: "poll",
      version: "1.0",
      title: "Bad Question",
      questions: [
        {
          id: "q1",
          type: "free-text",
          prompt: "Type something",
          options: [],
        },
      ],
      voteTool: "vote",
    };
    expect(pollSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing title", () => {
    const data = {
      type: "poll",
      version: "1.0",
      questions: [
        {
          id: "q1",
          type: "single-choice",
          prompt: "Pick one",
          options: [{ id: "a", label: "A" }],
        },
      ],
      voteTool: "vote",
    };
    expect(pollSchema.safeParse(data).success).toBe(false);
  });
});
