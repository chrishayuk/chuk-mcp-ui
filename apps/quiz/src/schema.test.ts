import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("quiz schema validation", () => {
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
    expect(validate(data)).toBe(true);
  });

  it("accepts full quiz with all settings", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "Full Quiz",
      description: "A complete quiz with every option set",
      validateTool: "validate_answer",
      completeTool: "complete_quiz",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "What is the capital of France?",
          image: { url: "https://example.com/paris.jpg", alt: "Paris" },
          options: [
            { id: "a", label: "Paris", image: { url: "https://example.com/a.jpg" } },
            { id: "b", label: "London" },
            { id: "c", label: "Berlin" },
          ],
          timeLimit: 30,
          explanation: "Paris is the capital of France.",
          points: 5,
          category: "Geography",
        },
        {
          id: "q2",
          type: "true-false",
          prompt: "The sky is blue.",
          options: [
            { id: "t", label: "True" },
            { id: "f", label: "False" },
          ],
          points: 2,
          category: "Science",
        },
        {
          id: "q3",
          type: "image-choice",
          prompt: "Pick the dog.",
          options: [
            { id: "x", label: "Dog", image: { url: "https://example.com/dog.jpg", alt: "A dog" } },
            { id: "y", label: "Cat", image: { url: "https://example.com/cat.jpg", alt: "A cat" } },
          ],
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
    expect(validate(data)).toBe(true);
  });

  it("rejects missing questions", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "No Questions",
      validateTool: "validate_answer",
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "quiz",
      title: "No Version",
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
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "quiz",
      version: "1.0",
      title: "Extra Fields",
      validateTool: "validate_answer",
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          prompt: "Test?",
          options: [{ id: "a", label: "A" }],
        },
      ],
      customField: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all question types", () => {
    const types = ["multiple-choice", "true-false", "image-choice"];
    for (const qType of types) {
      const data = {
        type: "quiz",
        version: "1.0",
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
      expect(validate(data)).toBe(true);
    }
  });
});
