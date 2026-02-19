import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("pivot schema validation", () => {
  it("accepts minimal valid pivot", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ category: "A", value: 10 }],
      rows: ["category"],
      columns: ["category"],
      values: [{ field: "value", aggregate: "sum" }],
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts all aggregate types", () => {
    const aggregates = ["sum", "count", "avg", "min", "max"];
    for (const aggregate of aggregates) {
      const data = {
        type: "pivot",
        version: "1.0",
        data: [{ x: "A", v: 1 }],
        rows: ["x"],
        columns: ["x"],
        values: [{ field: "v", aggregate }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all format types", () => {
    const formats = ["number", "percent", "currency"];
    for (const format of formats) {
      const data = {
        type: "pivot",
        version: "1.0",
        data: [{ x: "A", v: 1 }],
        rows: ["x"],
        columns: ["x"],
        values: [{ field: "v", aggregate: "sum", format }],
      };
      expect(validate(data)).toBe(true);
    }
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
    expect(validate(data)).toBe(true);
  });

  it("rejects missing data", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      rows: ["x"],
      columns: ["y"],
      values: [{ field: "v", aggregate: "sum" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing rows", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      columns: ["x"],
      values: [{ field: "v", aggregate: "sum" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing columns", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      values: [{ field: "v", aggregate: "sum" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing values", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("rejects value missing required field", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
      values: [{ aggregate: "sum" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects value missing required aggregate", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
      values: [{ field: "v" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "pivot",
      version: "1.0",
      data: [{ x: "A", v: 1 }],
      rows: ["x"],
      columns: ["x"],
      values: [{ field: "v", aggregate: "sum" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
