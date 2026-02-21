import { describe, it, expect } from "vitest";
import { flowchartSchema } from "./zod";

describe("flowchart zod schema validation", () => {
  it("accepts minimal valid flowchart", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "Start" }],
      edges: [{ source: "a", target: "b" }],
    };
    expect(flowchartSchema.safeParse(data).success).toBe(true);
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
    expect(flowchartSchema.safeParse(data).success).toBe(true);
  });

  it("accepts LR direction", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
      edges: [],
      direction: "LR",
    };
    expect(flowchartSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all node shapes", () => {
    const shapes = ["rect", "diamond", "ellipse", "parallelogram"] as const;
    for (const shape of shapes) {
      const data = {
        type: "flowchart" as const,
        version: "1.0" as const,
        nodes: [{ id: "n1", label: "Node", shape }],
        edges: [],
      };
      expect(flowchartSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing nodes", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      edges: [],
    };
    expect(flowchartSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing edges", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "A" }],
    };
    expect(flowchartSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      nodes: [],
      edges: [],
    };
    expect(flowchartSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid direction", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [],
      edges: [],
      direction: "RL",
    };
    expect(flowchartSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid node shape", () => {
    const data = {
      type: "flowchart",
      version: "1.0",
      nodes: [{ id: "a", label: "A", shape: "hexagon" }],
      edges: [],
    };
    expect(flowchartSchema.safeParse(data).success).toBe(false);
  });
});
