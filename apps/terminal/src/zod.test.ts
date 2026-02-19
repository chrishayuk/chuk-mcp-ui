import { describe, it, expect } from "vitest";
import { terminalSchema } from "./zod";

describe("terminal zod schema validation", () => {
  it("accepts minimal valid terminal", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "Hello, world!" }],
    };
    expect(terminalSchema.safeParse(data).success).toBe(true);
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
    expect(terminalSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all fontSize values", () => {
    const sizes = ["xs", "sm", "md", "lg"] as const;
    for (const fontSize of sizes) {
      const data = {
        type: "terminal" as const,
        version: "1.0" as const,
        lines: [{ text: "test" }],
        fontSize,
      };
      expect(terminalSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts all theme values", () => {
    const themes = ["dark", "light", "green", "amber"] as const;
    for (const theme of themes) {
      const data = {
        type: "terminal" as const,
        version: "1.0" as const,
        lines: [{ text: "test" }],
        theme,
      };
      expect(terminalSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing lines", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      title: "Test",
    };
    expect(terminalSchema.safeParse(data).success).toBe(false);
  });

  it("rejects line missing text", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ timestamp: "10:30:00" }],
    };
    expect(terminalSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "log",
      version: "1.0",
      lines: [{ text: "test" }],
    };
    expect(terminalSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid fontSize value", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "test" }],
      fontSize: "xxl",
    };
    expect(terminalSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid theme value", () => {
    const data = {
      type: "terminal",
      version: "1.0",
      lines: [{ text: "test" }],
      theme: "monokai",
    };
    expect(terminalSchema.safeParse(data).success).toBe(false);
  });
});
