import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("code schema validation", () => {
  it("accepts minimal valid code", () => {
    const data = {
      type: "code",
      version: "1.0",
      code: "console.log('hello');",
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts empty code string", () => {
    const data = {
      type: "code",
      version: "1.0",
      code: "",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts code without language", () => {
    const data = {
      type: "code",
      version: "1.0",
      code: "print('hello')",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing code", () => {
    const data = {
      type: "code",
      version: "1.0",
      language: "python",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      code: "hello",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "markdown",
      version: "1.0",
      code: "hello",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "code",
      code: "hello",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "code",
      version: "1.0",
      code: "hello",
      theme: "dark",
    };
    expect(validate(data)).toBe(true);
  });
});
