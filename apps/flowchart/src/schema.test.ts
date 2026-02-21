import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("flowchart schema validation", () => {
  it("accepts minimal valid flowchart", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "Start" }],
      edges: [{ source: "a", target: "b" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts flowchart with all options", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      title: "Login Flow",
      direction: "TB",
      nodes: [
        { id: "start", label: "Start", shape: "ellipse", color: "#22c55e" },
        { id: "process", label: "Process", shape: "rect" },
        { id: "decision", label: "Valid?", shape: "diamond", color: "#f59e0b" },
        { id: "io", label: "Input", shape: "parallelogram" },
      ],
      edges: [
        { source: "start", target: "process", label: "begin", style: "solid" },
        { source: "process", target: "decision", style: "dashed" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts LR direction", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
      edges: [],
      direction: "LR",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all node shapes", () => {
    const shapes = ["rect", "diamond", "ellipse", "parallelogram"];
    for (const shape of shapes) {
      const data = {
        type: "flowchart",
        version: "1.0",
        nodes: [{ id: "n1", label: "Node", shape }],
        edges: [],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all edge styles", () => {
    const styles = ["solid", "dashed"];
    for (const style of styles) {
      const data = {
        type: "flowchart",
        version: "1.0",
        nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
        edges: [{ source: "a", target: "b", style }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing nodes", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing edges", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      nodes: [],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid direction", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [],
      edges: [],
      direction: "RL",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid node shape", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "A", shape: "hexagon" }],
      edges: [],
    };
    expect(validate(data)).toBe(false);
  });
});
