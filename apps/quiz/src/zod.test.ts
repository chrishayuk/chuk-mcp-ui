import { describe, it, expect } from "vitest";
import { quizContentSchema } from "./zod";

describe("quiz zod schema validation", () => {
  it("accepts minimal valid quiz", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "My Quiz",
      validateTool: "validate_answer",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What is 2+2?",
          options: [
            { id: "a", label: "4" },
            { id: "b", label: "5" },
          ],
        },
      ],
    };
    expect(quizContentSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full quiz with all settings", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "Full Quiz",
      description: "A complete quiz",
      validateTool: "validate_answer",
      completeTool: "complete_quiz",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Capital of France?",
          image: { url: "https://example.com/paris.jpg", alt: "Paris" },
          options: [
            { id: "a", label: "Paris", image: { url: "https://example.com/a.jpg" } },
            { id: "b", label: "London" },
          ],
          timeLimit: 30,
          explanation: "Paris is the capital.",
          points: 5,
          category: "Geography",
        },
      ],
      settings: {
        timeLimit: 120,
        timeLimitMode: "total",
        showExplanation: true,
        showProgress: true,
        showScore: true,
        shuffleQuestions: true,
        shuffleOptions: false,
        passingScore: 70,
      },
    };
    expect(quizContentSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing questions", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "No Questions",
      validateTool: "validate_answer",
    };
    expect(quizContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "form",
      version: "1.0",
      title: "Not a quiz",
      validateTool: "validate_answer",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Test?",
          options: [{ id: "a", label: "A" }],
        },
      ],
    };
    expect(quizContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing validateTool", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "Missing Tool",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Test?",
          options: [{ id: "a", label: "A" }],
        },
      ],
    };
    expect(quizContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid question type", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "Bad Q Type",
      validateTool: "validate_answer",
      questions: [
        {
          id: "q1",
          type: "essay",
          prompt: "Write?",
          options: [{ id: "a", label: "A" }],
        },
      ],
    };
    expect(quizContentSchema.safeParse(data).success).toBe(false);
  });

  it("accepts all question types", () => {
    const types = ["multiple-choice", "true-false", "image-choice"] as const;
    for (const qType of types) {
      const data = {
        type: "quiz" as const,
        version: "1.0" as const,
        title: "Type Test",
        validateTool: "validate_answer",
        questions: [
          {
            id: "q1",
            type: qType,
            prompt: "Test?",
            options: [{ id: "a", label: "A" }],
          },
        ],
      };
      expect(quizContentSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects invalid timeLimitMode", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "Bad Mode",
      validateTool: "validate_answer",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Test?",
          options: [{ id: "a", label: "A" }],
        },
      ],
      settings: {
        timeLimitMode: "infinite",
      },
    };
    expect(quizContentSchema.safeParse(data).success).toBe(false);
  });
});
