import { describe, it, expect } from "vitest";
import { treemapSchema } from "./zod";

describe("treemap zod schema validation", () => {
  it("accepts minimal valid treemap", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      root: { id: "root", label: "Root" },
    };
    expect(treemapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts treemap with all optional fields", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      title: "Disk Usage",
      root: {
        id: "root",
        label: "Root",
        value: 100,
        color: "#3b82f6",
        metadata: { path: "/root" },
        children: [
          {
            id: "child1",
            label: "Child 1",
            value: 60,
            color: "#ef4444",
          },
          {
            id: "child2",
            label: "Child 2",
            value: 40,
          },
        ],
      },
      colorField: "category",
      showLabels: true,
      interactive: true,
    };
    expect(treemapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts deeply nested children (recursive)", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      root: {
        id: "a",
        label: "A",
        children: [
          {
            id: "b",
            label: "B",
            children: [
              {
                id: "c",
                label: "C",
                children: [
                  { id: "d", label: "D", value: 10 },
                ],
              },
            ],
          },
        ],
      },
    };
    expect(treemapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts root node with no children", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      root: { id: "solo", label: "Solo", value: 42 },
    };
    expect(treemapSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing type field", () => {
    const data = {
      version: "1.0",
      root: { id: "a", label: "A" },
    };
    expect(treemapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type value", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      root: { id: "a", label: "A" },
    };
    expect(treemapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version field", () => {
    const data = {
      type: "treemap",
      root: { id: "a", label: "A" },
    };
    expect(treemapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version value", () => {
    const data = {
      type: "treemap",
      version: "2.0",
      root: { id: "a", label: "A" },
    };
    expect(treemapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing root field", () => {
    const data = {
      type: "treemap",
      version: "1.0",
    };
    expect(treemapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects node with missing id", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      root: { label: "A" },
    };
    expect(treemapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects node with missing label", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      root: { id: "a" },
    };
    expect(treemapSchema.safeParse(data).success).toBe(false);
  });

  it("accepts node with metadata", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      root: {
        id: "a",
        label: "A",
        metadata: { category: "files", owner: "admin" },
      },
    };
    expect(treemapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts empty children array", () => {
    const data = {
      type: "treemap",
      version: "1.0",
      root: { id: "r", label: "R", children: [] },
    };
    expect(treemapSchema.safeParse(data).success).toBe(true);
  });
});
