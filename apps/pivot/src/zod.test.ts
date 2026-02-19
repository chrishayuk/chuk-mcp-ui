import { describe, it, expect } from "vitest";
import { pivotSchema } from "./zod";

describe("pivot zod schema validation", () => {
  it("accepts minimal valid pivot", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ category: "A", value: 10 }],
      rows: ["category"],
      columns: ["category"],
      values: [{ field: "value", aggregate: "sum" }],
    };
    expect(pivotSchema.safeParse(data).success).toBe(true);
  });

  it("accepts pivot with all options", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      title: "Sales Report",
      data: [
        { region: "North", quarter: "Q1", revenue: 12000 },
        { region: "South", quarter: "Q2", revenue: 9000 },
      ],
      rows: ["region"],
      columns: ["quarter"],
      values: [
        { field: "revenue", aggregate: "sum", label: "Revenue", format: "currency" },
      ],
      sortable: true,
      showTotals: true,
    };
    expect(pivotSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all aggregate types", () => {
    const aggregates = ["sum", "count", "avg", "min", "max"] as const;
    for (const aggregate of aggregates) {
      const data = {
        type: "pivot" as const,
        version: "1.0" as const,
        data: [{ x: "A", v: 1 }],
        rows: ["x"],
        columns: ["x"],
        values: [{ field: "v", aggregate }],
      };
      expect(pivotSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing data", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      rows: ["x"],
      columns: ["y"],
      values: [{ field: "v", aggregate: "sum" }],
    };
    expect(pivotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "table",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
      values: [{ field: "v", aggregate: "sum" }],
    };
    expect(pivotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid aggregate value", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
      values: [{ field: "v", aggregate: "median" }],
    };
    expect(pivotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid format value", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
      values: [{ field: "v", aggregate: "sum", format: "scientific" }],
    };
    expect(pivotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing values", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
    };
    expect(pivotSchema.safeParse(data).success).toBe(false);
  });

  it("accepts data records with varied value types", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [
        { category: "A", value: 10, label: "test", active: true },
        { category: "B", value: 20, nested: { deep: true } },
      ],
      rows: ["category"],
      columns: ["category"],
      values: [{ field: "value", aggregate: "sum" }],
    };
    expect(pivotSchema.safeParse(data).success).toBe(true);
  });

  it("accepts multiple value definitions", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ dept: "Eng", role: "Sr", salary: 100000 }],
      rows: ["dept"],
      columns: ["role"],
      values: [
        { field: "salary", aggregate: "count", label: "Headcount" },
        { field: "salary", aggregate: "avg", label: "Avg Salary", format: "currency" },
      ],
    };
    expect(pivotSchema.safeParse(data).success).toBe(true);
  });
});
