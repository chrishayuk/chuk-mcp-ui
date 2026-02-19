import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("terminal schema validation", () => {
  it("accepts minimal valid terminal", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "Hello, world!" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts terminal with all options", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      title: "Build Output",
      lines: [
        { text: "$ npm run build", timestamp: "10:30:00" },
        { text: "\x1b[32mSuccess!\x1b[0m", timestamp: "10:30:05" },
      ],
      scrollback: 1000,
      fontSize: "sm",
      showLineNumbers: true,
      theme: "dark",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all fontSize values", () => {
    const sizes = ["xs", "sm", "md", "lg"];
    for (const fontSize of sizes) {
      const data = {
        type: "terminal",
        version: "1.0",
        lines: [{ text: "test" }],
        fontSize,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all theme values", () => {
    const themes = ["dark", "light", "green", "amber"];
    for (const theme of themes) {
      const data = {
        type: "terminal",
        version: "1.0",
        lines: [{ text: "test" }],
        theme,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts line without timestamp", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "no timestamp here" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts line with timestamp", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "with timestamp", timestamp: "2024-01-15T10:30:00Z" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing lines", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      title: "Test",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects line missing text", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ timestamp: "10:30:00" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "log",
      version: "1.0",
      lines: [{ text: "test" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid fontSize value", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "test" }],
      fontSize: "xxl",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid theme value", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "test" }],
      theme: "monokai",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "test" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
