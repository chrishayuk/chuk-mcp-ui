import { describe, it, expect } from "vitest";
import { codeSchema } from "./zod";

describe("code zod schema validation", () => {
  it("accepts minimal valid code", () => {
    const data = {
      type: "code",
      version: "1.0",
      code: "console.log('hello');",
    };
    expect(codeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts code with all options", () => {
    const data = {
      type: "code",
      version: "1.0",
      code: "function hello() {\n  return 'world';\n}",
      language: "typescript",
      title: "Hello Function",
      lineNumbers: true,
      highlightLines: [1, 3],
    };
    expect(codeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts empty code string", () => {
    const data = {
      type: "code",
      version: "1.0",
      code: "",
    };
    expect(codeSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing code", () => {
    const data = {
      type: "code",
      version: "1.0",
      language: "python",
    };
    expect(codeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "markdown",
      version: "1.0",
      code: "hello",
    };
    expect(codeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "code",
      code: "hello",
    };
    expect(codeSchema.safeParse(data).success).toBe(false);
  });
});
