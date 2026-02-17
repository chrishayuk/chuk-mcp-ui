import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("markdown schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = { type: "markdown", version: "1.0", content: "# Hello" };
    expect(validate(data)).toBe(true);
  });

  it("accepts full input with title", () => {
    const data = {
      type: "markdown",
      version: "1.0",
      content: "# Hello\n\nWorld",
      title: "My Document",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing content", () => {
    const data = { type: "markdown", version: "1.0" };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = { version: "1.0", content: "# Hello" };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = { type: "chart", version: "1.0", content: "# Hello" };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = { type: "markdown", version: "2.0", content: "# Hello" };
    expect(validate(data)).toBe(false);
  });

  it("accepts empty string content", () => {
    const data = { type: "markdown", version: "1.0", content: "" };
    expect(validate(data)).toBe(true);
  });
});
