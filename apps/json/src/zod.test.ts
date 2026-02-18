import { describe, it, expect } from "vitest";
import { jsonSchema } from "./zod";

describe("json zod schema validation", () => {
  it("accepts minimal valid json with object data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: { key: "value" },
    };
    expect(jsonSchema.safeParse(data).success).toBe(true);
  });

  it("accepts json with all options", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: { users: [{ name: "Jane" }] },
      title: "API Response",
      expandDepth: 2,
      searchable: true,
    };
    expect(jsonSchema.safeParse(data).success).toBe(true);
  });

  it("accepts array data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: [1, 2, 3],
    };
    expect(jsonSchema.safeParse(data).success).toBe(true);
  });

  it("accepts null data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: null,
    };
    expect(jsonSchema.safeParse(data).success).toBe(true);
  });

  it("accepts deeply nested data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: { a: { b: { c: { d: [1, { e: "f" }] } } } },
    };
    expect(jsonSchema.safeParse(data).success).toBe(true);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "code",
      version: "1.0",
      data: {},
    };
    expect(jsonSchema.safeParse(data).success).toBe(false);
  });
});
