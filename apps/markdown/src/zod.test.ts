import { describe, it, expect } from "vitest";
import { markdownSchema } from "./zod";

describe("markdown zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = { type: "markdown", version: "1.0", content: "# Hello" };
    expect(markdownSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full input with title", () => {
    const data = {
      type: "markdown",
      version: "1.0",
      content: "# Hello\n\nWorld",
      title: "My Document",
    };
    expect(markdownSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing content", () => {
    const data = { type: "markdown", version: "1.0" };
    expect(markdownSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = { version: "1.0", content: "# Hello" };
    expect(markdownSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = { type: "chart", version: "1.0", content: "# Hello" };
    expect(markdownSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = { type: "markdown", version: "2.0", content: "# Hello" };
    expect(markdownSchema.safeParse(data).success).toBe(false);
  });

  it("accepts empty string content", () => {
    const data = { type: "markdown", version: "1.0", content: "" };
    expect(markdownSchema.safeParse(data).success).toBe(true);
  });
});
