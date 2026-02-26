import { describe, it, expect } from "vitest";
import { wizardSchema } from "./zod";

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

describe("wizard zod schema validation", () => {
  it("accepts minimal valid wizard", () => {
    expect(wizardSchema.safeParse(minimalWizard).success).toBe(true);
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
    expect(wizardSchema.safeParse(data).success).toBe(true);
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
              widget: "radio" as const,
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
              widget: "slider" as const,
            },
          },
          condition: { field: "role", op: "eq" as const, value: "admin" },
        },
      ],
      submitTool: "assign_role",
    };
    expect(wizardSchema.safeParse(data).success).toBe(true);
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
            text: { type: "string", widget: "text" as const, placeholder: "Enter..." },
            area: { type: "string", widget: "textarea" as const, help: "Multiline input" },
            num: { type: "number", minimum: 0, maximum: 100 },
            int: { type: "integer", minimum: 1, maximum: 10 },
            check: { type: "boolean", widget: "checkbox" as const },
            sel: {
              type: "string",
              enum: ["a", "b", "c"],
              enumLabels: ["Alpha", "Beta", "Charlie"],
              widget: "select" as const,
            },
            radio: { type: "string", enum: ["x", "y"], widget: "radio" as const },
            slider: { type: "number", widget: "slider" as const, minimum: 0, maximum: 100 },
            date: { type: "string", widget: "date" as const },
            pass: { type: "string", widget: "password" as const, minLength: 8, maxLength: 64 },
            patterned: { type: "string", pattern: "^[A-Z]+$" },
          },
        },
      ],
      submitTool: "process",
    };
    expect(wizardSchema.safeParse(data).success).toBe(true);
  });

  it("accepts wizard with all condition operators", () => {
    const operators = [
      { op: "eq" as const, value: "yes" },
      { op: "neq" as const, value: "no" },
      { op: "in" as const, value: ["a", "b"] },
      { op: "gt" as const, value: 10 },
      { op: "lt" as const, value: 5 },
    ];

    for (const cond of operators) {
      const data = {
        type: "wizard" as const,
        version: "1.0" as const,
        steps: [
          {
            id: "s1",
            title: "Step 1",
            fields: { f: { type: "string" as const } },
          },
          {
            id: "s2",
            title: "Step 2",
            fields: { g: { type: "string" as const } },
            condition: { field: "f", ...cond },
          },
        ],
        submitTool: "go",
      };
      expect(wizardSchema.safeParse(data).success).toBe(true);
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
    expect(wizardSchema.safeParse(data).success).toBe(true);
  });

  it("rejects wrong type", () => {
    const data = { ...minimalWizard, type: "form" };
    expect(wizardSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type, ...rest } = minimalWizard;
    expect(wizardSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing version", () => {
    const { version, ...rest } = minimalWizard;
    expect(wizardSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing steps", () => {
    const { steps, ...rest } = minimalWizard;
    expect(wizardSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing submitTool", () => {
    const { submitTool, ...rest } = minimalWizard;
    expect(wizardSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects step missing id", () => {
    const data = {
      ...minimalWizard,
      steps: [{ title: "No ID", fields: { x: { type: "string" } } }],
    };
    expect(wizardSchema.safeParse(data).success).toBe(false);
  });

  it("rejects step missing title", () => {
    const data = {
      ...minimalWizard,
      steps: [{ id: "s1", fields: { x: { type: "string" } } }],
    };
    expect(wizardSchema.safeParse(data).success).toBe(false);
  });

  it("rejects step missing fields", () => {
    const data = {
      ...minimalWizard,
      steps: [{ id: "s1", title: "No Fields" }],
    };
    expect(wizardSchema.safeParse(data).success).toBe(false);
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
    expect(wizardSchema.safeParse(data).success).toBe(false);
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
    expect(wizardSchema.safeParse(data).success).toBe(false);
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
    expect(wizardSchema.safeParse(data).success).toBe(false);
  });
});
