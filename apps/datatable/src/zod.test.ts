import { describe, it, expect } from "vitest";
import { dataTableSchema } from "./zod";

describe("datatable zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      columns: [{ key: "name", label: "Name" }],
      rows: [{ name: "Alice" }],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full input with all optional fields", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      title: "Employees",
      columns: [
        {
          key: "name",
          label: "Name",
          type: "text",
          sortable: true,
          filterable: true,
          width: "200px",
          align: "left",
        },
        {
          key: "status",
          label: "Status",
          type: "badge",
          badgeColors: { active: "#22c55e", inactive: "#ef4444" },
        },
      ],
      rows: [{ name: "Alice", status: "active" }],
      sortable: true,
      filterable: true,
      exportable: true,
      actions: [
        {
          label: "View",
          tool: "get-employee",
          arguments: { id: "{employee_id}" },
          icon: "eye",
          confirm: "Are you sure?",
        },
      ],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing type field", () => {
    const data = {
      version: "1.0",
      columns: [{ key: "name", label: "Name" }],
      rows: [],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version field", () => {
    const data = {
      type: "datatable",
      columns: [{ key: "name", label: "Name" }],
      rows: [],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing columns field", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      rows: [],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing rows field", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      columns: [{ key: "name", label: "Name" }],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type value", () => {
    const data = {
      type: "map",
      version: "1.0",
      columns: [{ key: "name", label: "Name" }],
      rows: [],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version value", () => {
    const data = {
      type: "datatable",
      version: "2.0",
      columns: [{ key: "name", label: "Name" }],
      rows: [],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(false);
  });

  it("rejects column with missing key", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      columns: [{ label: "Name" }],
      rows: [],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(false);
  });

  it("accepts empty rows", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      columns: [{ key: "name", label: "Name" }],
      rows: [],
    };
    expect(dataTableSchema.safeParse(data).success).toBe(true);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      columns: [{ key: "name", label: "Name" }],
      rows: [],
      futureField: "some value",
    };
    expect(dataTableSchema.safeParse(data).success).toBe(true);
  });
});
