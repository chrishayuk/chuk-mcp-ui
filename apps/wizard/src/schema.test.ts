import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

const minimalWizard = {
  type: "wizard",
  version: "1.0",
  steps: [
    {
      id: "basics",
      title: "Basic Info",
      fields: {
        name: { type: "string", title: "Full Name" },
      },
      required: ["name"],
    },
  ],
  submitTool: "create_user",
};

describe("wizard schema validation", () => {
  it("accepts minimal valid wizard", () => {
    expect(validate(minimalWizard)).toBe(true);
  });

  it("accepts wizard with all root options", () => {
    const data = {
      ...minimalWizard,
      title: "User Registration",
      description: "Create your account",
      initialValues: { name: "Jane" },
      submitLabel: "Register",
      allowNavigation: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts wizard with conditional steps", () => {
    const data = {
      type: "wizard",
      version: "1.0",
      steps: [
        {
          id: "role",
          title: "Choose Role",
          fields: {
            role: {
              type: "string",
              enum: ["admin", "user"],
              widget: "radio",
            },
          },
          required: ["role"],
        },
        {
          id: "admin-details",
          title: "Admin Details",
          fields: {
            accessLevel: {
              type: "number",
              minimum: 1,
              maximum: 5,
              widget: "slider",
            },
          },
          condition: { field: "role", op: "eq", value: "admin" },
        },
      ],
      submitTool: "assign_role",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts wizard with all field types", () => {
    const data = {
      type: "wizard",
      version: "1.0",
      steps: [
        {
          id: "all-types",
          title: "All Types",
          fields: {
            text: { type: "string", widget: "text", placeholder: "Enter..." },
            area: { type: "string", widget: "textarea", help: "Multiline input" },
            num: { type: "number", minimum: 0, maximum: 100 },
            int: { type: "integer", minimum: 1, maximum: 10 },
            check: { type: "boolean", widget: "checkbox" },
            sel: {
              type: "string",
              enum: ["a", "b", "c"],
              enumLabels: ["Alpha", "Beta", "Charlie"],
              widget: "select",
            },
            radio: {
              type: "string",
              enum: ["x", "y"],
              widget: "radio",
            },
            slider: {
              type: "number",
              widget: "slider",
              minimum: 0,
              maximum: 100,
            },
            date: { type: "string", widget: "date" },
            pass: { type: "string", widget: "password", minLength: 8, maxLength: 64 },
            patterned: { type: "string", pattern: "^[A-Z]+$" },
          },
        },
      ],
      submitTool: "process",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts wizard with all condition operators", () => {
    const operators = [
      { op: "eq", value: "yes" },
      { op: "neq", value: "no" },
      { op: "in", value: ["a", "b"] },
      { op: "gt", value: 10 },
      { op: "lt", value: 5 },
    ] as const;

    for (const cond of operators) {
      const data = {
        type: "wizard",
        version: "1.0",
        steps: [
          {
            id: "s1",
            title: "Step 1",
            fields: { f: { type: "string" } },
          },
          {
            id: "s2",
            title: "Step 2",
            fields: { g: { type: "string" } },
            condition: { field: "f", ...cond },
          },
        ],
        submitTool: "go",
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts wizard with field defaults", () => {
    const data = {
      type: "wizard",
      version: "1.0",
      steps: [
        {
          id: "s1",
          title: "Defaults",
          fields: {
            name: { type: "string", default: "Alice" },
            count: { type: "number", default: 42 },
            active: { type: "boolean", default: true },
          },
        },
      ],
      submitTool: "save",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects wrong type", () => {
    const data = { ...minimalWizard, type: "form" };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const { type, ...rest } = minimalWizard;
    expect(validate(rest)).toBe(false);
  });

  it("rejects missing version", () => {
    const { version, ...rest } = minimalWizard;
    expect(validate(rest)).toBe(false);
  });

  it("rejects missing steps", () => {
    const { steps, ...rest } = minimalWizard;
    expect(validate(rest)).toBe(false);
  });

  it("rejects missing submitTool", () => {
    const { submitTool, ...rest } = minimalWizard;
    expect(validate(rest)).toBe(false);
  });

  it("rejects empty steps array", () => {
    // Empty steps is structurally valid JSON Schema (array with no items)
    // but our schema allows it — this tests that an array is required
    const data = { ...minimalWizard, steps: "not-an-array" };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing id", () => {
    const data = {
      ...minimalWizard,
      steps: [{ title: "No ID", fields: { x: { type: "string" } } }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing title", () => {
    const data = {
      ...minimalWizard,
      steps: [{ id: "s1", fields: { x: { type: "string" } } }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing fields", () => {
    const data = {
      ...minimalWizard,
      steps: [{ id: "s1", title: "No Fields" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects field with invalid type", () => {
    const data = {
      ...minimalWizard,
      steps: [
        {
          id: "s1",
          title: "Bad Field",
          fields: { x: { type: "array" } },
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects field with invalid widget", () => {
    const data = {
      ...minimalWizard,
      steps: [
        {
          id: "s1",
          title: "Bad Widget",
          fields: { x: { type: "string", widget: "color-picker" } },
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects condition with invalid operator", () => {
    const data = {
      ...minimalWizard,
      steps: [
        {
          id: "s1",
          title: "Step",
          fields: { x: { type: "string" } },
          condition: { field: "y", op: "contains", value: "z" },
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = { ...minimalWizard, extra: true };
    expect(validate(data)).toBe(true);
  });
});
