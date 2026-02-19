import { describe, it, expect } from "vitest";
import { treeSchema } from "./zod";

describe("tree zod schema validation", () => {
  it("accepts minimal valid tree", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [{ id: "root", label: "Root" }],
    };
    expect(treeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts tree with all optional fields", () => {
    const data = {
      type: "tree",
      version: "1.0",
      title: "File Explorer",
      roots: [
        {
          id: "src",
          label: "src",
          icon: "\uD83D\uDCC1",
          badge: { label: "3 files", color: "#3b82f6" },
          hasChildren: true,
          disabled: false,
          metadata: { path: "/src" },
          children: [
            { id: "app", label: "App.tsx", icon: "\uD83D\uDCC4" },
          ],
        },
      ],
      selection: "multi",
      searchable: true,
      expandDepth: 2,
      loadChildrenTool: "load-children",
    };
    expect(treeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts deeply nested children (recursive)", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [
        {
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
                    { id: "d", label: "D" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(treeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts empty roots array", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [],
    };
    expect(treeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all selection modes", () => {
    for (const selection of ["none", "single", "multi"]) {
      const data = {
        type: "tree",
        version: "1.0",
        roots: [{ id: "a", label: "A" }],
        selection,
      };
      expect(treeSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing type field", () => {
    const data = {
      version: "1.0",
      roots: [{ id: "a", label: "A" }],
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version field", () => {
    const data = {
      type: "tree",
      roots: [{ id: "a", label: "A" }],
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing roots field", () => {
    const data = {
      type: "tree",
      version: "1.0",
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type value", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      roots: [],
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version value", () => {
    const data = {
      type: "tree",
      version: "2.0",
      roots: [],
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects node with missing id", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [{ label: "A" }],
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects node with missing label", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [{ id: "a" }],
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid selection value", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [],
      selection: "invalid",
    };
    expect(treeSchema.safeParse(data).success).toBe(false);
  });

  it("validates badge schema", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [
        {
          id: "a",
          label: "A",
          badge: { label: "tag", color: "#ff0000" },
        },
      ],
    };
    expect(treeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts badge without color", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [
        {
          id: "a",
          label: "A",
          badge: { label: "tag" },
        },
      ],
    };
    expect(treeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts node with metadata", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [
        {
          id: "a",
          label: "A",
          metadata: { path: "/a", size: 1024, nested: { key: "val" } },
        },
      ],
    };
    expect(treeSchema.safeParse(data).success).toBe(true);
  });
});
