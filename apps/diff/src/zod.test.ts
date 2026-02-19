import { describe, it, expect } from "vitest";
import { diffSchema } from "./zod";

describe("diff zod schema validation", () => {
  it("accepts minimal valid diff", () => {
    const data = {
      type: "diff",
      version: "1.0",
      hunks: [],
    };
    expect(diffSchema.safeParse(data).success).toBe(true);
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
          ],
        },
      ],
    };
    expect(diffSchema.safeParse(data).success).toBe(true);
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
            { type: "remove", content: "old", lineA: 1 },
            { type: "add", content: "new", lineB: 1 },
          ],
        },
      ],
    };
    expect(diffSchema.safeParse(data).success).toBe(true);
  });

  it("rejects invalid mode", () => {
    const data = {
      type: "diff",
      version: "1.0",
      mode: "inline",
      hunks: [],
    };
    expect(diffSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing hunks", () => {
    const data = {
      type: "diff",
      version: "1.0",
    };
    expect(diffSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "code",
      version: "1.0",
      hunks: [],
    };
    expect(diffSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "diff",
      hunks: [],
    };
    expect(diffSchema.safeParse(data).success).toBe(false);
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
    expect(diffSchema.safeParse(data).success).toBe(false);
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
    expect(diffSchema.safeParse(data).success).toBe(false);
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
    expect(diffSchema.safeParse(data).success).toBe(true);
  });
});
