import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("sankey schema validation", () => {
  it("accepts minimal valid sankey", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      links: [{ source: "a", target: "b", value: 10 }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts sankey with all optional fields", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      title: "Energy Flow",
      nodes: [
        { id: "solar", label: "Solar", color: "#f59e0b" },
        { id: "electric", label: "Electricity", color: "#3b82f6" },
        { id: "home", label: "Residential", color: "#22c55e" },
      ],
      links: [
        { source: "solar", target: "electric", value: 50, color: "#f59e0b88" },
        { source: "electric", target: "home", value: 50, color: "#3b82f688" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts sankey with empty nodes and links", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      nodes: [],
      links: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
      links: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
      links: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = {
      type: "sankey",
      version: "2.0",
      nodes: [{ id: "a", label: "A" }],
      links: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing nodes", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      links: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing links", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing id", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      nodes: [{ label: "A" }],
      links: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing label", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      nodes: [{ id: "a" }],
      links: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects link with missing source", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
      links: [{ target: "b", value: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects link with missing value", () => {
    const data = {
      type: "sankey",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
      links: [{ source: "a", target: "b" }],
    };
    expect(validate(data)).toBe(false);
  });
});
