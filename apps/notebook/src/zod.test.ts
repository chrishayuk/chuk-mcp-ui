import { describe, it, expect } from "vitest";
import { notebookSchema } from "./zod";

describe("notebook zod schema validation", () => {
  it("accepts minimal valid notebook", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [],
    };
    expect(notebookSchema.safeParse(data).success).toBe(true);
  });

  it("accepts notebook with title and all cell types", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      title: "Full Notebook",
      cells: [
        { cellType: "markdown", source: "# Hello" },
        { cellType: "code", source: "print(1)", language: "python", output: "1" },
        { cellType: "table", columns: ["A", "B"], rows: [["1", "2"]] },
        { cellType: "image", url: "https://example.com/img.png", alt: "photo", caption: "A photo" },
        { cellType: "counter", value: 42, label: "Items" },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(true);
  });

  it("accepts markdown cell with collapsed", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "markdown", source: "text", collapsed: true },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(true);
  });

  it("accepts code cell with all fields", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "code", source: "x = 1", language: "python", output: "1", collapsed: false },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(true);
  });

  it("accepts table cell with caption", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "table", columns: ["Col1"], rows: [["val"]], caption: "Table 1" },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(true);
  });

  it("accepts image cell minimal", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "image", url: "https://example.com/img.png" },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(true);
  });

  it("accepts counter cell minimal", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "counter", value: 99 },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing cells", () => {
    const data = {
      type: "notebook",
      version: "1.0",
    };
    expect(notebookSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      cells: [],
    };
    expect(notebookSchema.safeParse(data).success).toBe(false);
  });

  it("rejects cell with unknown cellType", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "chart", data: {} },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(false);
  });

  it("rejects markdown cell missing source", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "markdown" },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(false);
  });

  it("rejects table cell missing columns", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "table", rows: [["a"]] },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(false);
  });

  it("rejects image cell missing url", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "image", alt: "missing url" },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(false);
  });

  it("rejects counter cell missing value", () => {
    const data = {
      type: "notebook",
      version: "1.0",
      cells: [
        { cellType: "counter", label: "No value" },
      ],
    };
    expect(notebookSchema.safeParse(data).success).toBe(false);
  });
});
