import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("settings schema validation", () => {
  it("accepts minimal valid settings", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [
        {
          id: "general",
          title: "General",
          fields: [
            { id: "name", label: "Name", type: "text", value: "hello" },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts settings with all options", () => {
    const data = {
      type: "settings",
      version: "1.0",
      title: "App Settings",
      saveTool: "save_settings",
      autoSave: true,
      sections: [
        {
          id: "appearance",
          title: "Appearance",
          description: "Visual settings",
          collapsible: true,
          collapsed: false,
          fields: [
            {
              id: "theme",
              label: "Theme",
              description: "Colour scheme",
              type: "select",
              value: "dark",
              options: [
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ],
              disabled: false,
            },
            {
              id: "font-size",
              label: "Font Size",
              type: "slider",
              value: 14,
              min: 10,
              max: 24,
              step: 1,
            },
            { id: "dark-mode", label: "Dark Mode", type: "toggle", value: true },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all field types", () => {
    const types = ["toggle", "select", "text", "number", "slider", "radio", "color"];
    for (const type of types) {
      const data = {
        type: "settings",
        version: "1.0",
        sections: [
          {
            id: "s1",
            title: "Section",
            fields: [{ id: "f1", label: "Field", type, value: "test" }],
          },
        ],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing sections", () => {
    const data = {
      type: "settings",
      version: "1.0",
      title: "Settings",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects section missing id", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [
        {
          title: "General",
          fields: [{ id: "f", label: "F", type: "text", value: "" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects section missing fields", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [{ id: "s1", title: "Section" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects field missing id", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [
        {
          id: "s1",
          title: "Section",
          fields: [{ label: "Name", type: "text", value: "" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects field missing type", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [
        {
          id: "s1",
          title: "Section",
          fields: [{ id: "f1", label: "Name", value: "" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid field type", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [
        {
          id: "s1",
          title: "Section",
          fields: [{ id: "f1", label: "F", type: "textarea", value: "" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type literal", () => {
    const data = {
      type: "form",
      version: "1.0",
      sections: [
        {
          id: "s1",
          title: "Section",
          fields: [{ id: "f1", label: "F", type: "text", value: "" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [
        {
          id: "s1",
          title: "Section",
          fields: [{ id: "f1", label: "F", type: "text", value: "" }],
        },
      ],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
