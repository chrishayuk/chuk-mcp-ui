import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("json schema validation", () => {
  it("accepts minimal valid json with object data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: { key: "value" },
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts array data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: [1, 2, 3],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts string data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: "hello",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts number data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: 42,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts null data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: null,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts boolean data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts deeply nested data", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: { a: { b: { c: { d: [1, { e: "f" }] } } } },
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing data", () => {
    const data = {
      type: "json",
      version: "1.0",
      title: "Test",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "code",
      version: "1.0",
      data: {},
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "json",
      data: {},
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "json",
      version: "1.0",
      data: {},
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
