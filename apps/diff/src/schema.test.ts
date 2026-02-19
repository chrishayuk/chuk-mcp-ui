import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("diff schema validation", () => {
  it("accepts minimal valid diff", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts diff with all optional fields", () => {
    const data = {
      type: "diff",
      version: "1.0",
      title: "Update greet function",
      language: "typescript",
      mode: "unified",
      fileA: "src/greet.ts",
      fileB: "src/greet.ts",
      hunks: [
        {
          headerA: "@@ -1,3 +1,4 @@",
          headerB: "@@ -1,3 +1,4 @@",
          lines: [
            { type: "context", content: "import { User } from './types';", lineA: 1, lineB: 1 },
            { type: "remove", content: "function greet(name: string) {", lineA: 2 },
            { type: "add", content: "function greet(user: User) {", lineB: 2 },
            { type: "context", content: "}", lineA: 3, lineB: 3 },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts empty hunks array", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts split mode", () => {
    const data = {
      type: "diff",
      version: "1.0",
      mode: "split",
      hunks: [
        {
          headerA: "@@ -1,2 +1,2 @@",
          lines: [
            { type: "remove", content: "old line", lineA: 1 },
            { type: "add", content: "new line", lineB: 1 },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts unified mode", () => {
    const data = {
      type: "diff",
      version: "1.0",
      mode: "unified",
      hunks: [
        {
          headerA: "@@ -1,1 +1,1 @@",
          lines: [{ type: "context", content: "unchanged", lineA: 1, lineB: 1 }],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects invalid mode", () => {
    const data = {
      type: "diff",
      version: "1.0",
      mode: "inline",
      hunks: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing hunks", () => {
    const data = {
      type: "diff",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      hunks: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "code",
      version: "1.0",
      hunks: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "diff",
      hunks: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid line type", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [
        {
          headerA: "@@ -1,1 +1,1 @@",
          lines: [{ type: "modified", content: "changed" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects hunk missing headerA", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [
        {
          lines: [{ type: "context", content: "line" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects line missing content", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [
        {
          headerA: "@@ -1,1 +1,1 @@",
          lines: [{ type: "context" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects line missing type", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [
        {
          headerA: "@@ -1,1 +1,1 @@",
          lines: [{ content: "some content" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts lines without optional lineA/lineB", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [
        {
          headerA: "@@ -1,1 +1,1 @@",
          lines: [{ type: "add", content: "new line" }],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [],
      customField: "extra",
    };
    expect(validate(data)).toBe(true);
  });
});
