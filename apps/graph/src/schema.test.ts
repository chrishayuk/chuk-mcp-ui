import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("graph schema validation", () => {
  it("accepts minimal valid graph", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
      edges: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts graph with all optional fields", () => {
    const data = {
      type: "graph",
      version: "1.0",
      title: "Social Network",
      directed: false,
      nodes: [
        { id: "a", label: "Alice", color: "#3b82f6", size: 20, group: "team-a" },
        { id: "b", label: "Bob", color: "#ef4444", size: 15, group: "team-b" },
      ],
      edges: [
        { source: "a", target: "b", label: "friends", weight: 1.0, color: "#999" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts empty nodes and edges", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [],
      edges: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts directed graph", () => {
    const data = {
      type: "graph",
      version: "1.0",
      directed: true,
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      edges: [{ source: "a", target: "b" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing type field", () => {
    const data = {
      version: "1.0",
      nodes: [],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version field", () => {
    const data = {
      type: "graph",
      nodes: [],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing nodes field", () => {
    const data = {
      type: "graph",
      version: "1.0",
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing edges field", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type value", () => {
    const data = {
      type: "chart",
      version: "1.0",
      nodes: [],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version value", () => {
    const data = {
      type: "graph",
      version: "2.0",
      nodes: [],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing id", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [{ label: "A" }],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing label", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [{ id: "a" }],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects edge with missing source", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
      edges: [{ target: "a" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects edge with missing target", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
      edges: [{ source: "a" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields for forward compatibility", () => {
    const data = {
      type: "graph",
      version: "1.0",
      nodes: [],
      edges: [],
      futureField: "some value",
    };
    expect(validate(data)).toBe(true);
  });
});
