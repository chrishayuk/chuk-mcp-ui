import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("tree schema validation", () => {
  it("accepts minimal valid tree", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [{ id: "root", label: "Root" }],
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts empty roots array", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all selection modes", () => {
    for (const selection of ["none", "single", "multi"]) {
      const data = {
        type: "tree",
        version: "1.0",
        roots: [{ id: "a", label: "A" }],
        selection,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing type field", () => {
    const data = {
      version: "1.0",
      roots: [{ id: "a", label: "A" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version field", () => {
    const data = {
      type: "tree",
      roots: [{ id: "a", label: "A" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing roots field", () => {
    const data = {
      type: "tree",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type value", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      roots: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version value", () => {
    const data = {
      type: "tree",
      version: "2.0",
      roots: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing id", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [{ label: "A" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing label", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [{ id: "a" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid selection value", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [],
      selection: "invalid",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields for forward compatibility", () => {
    const data = {
      type: "tree",
      version: "1.0",
      roots: [],
      futureField: "some value",
    };
    expect(validate(data)).toBe(true);
  });
});
