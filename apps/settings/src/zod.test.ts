import { describe, it, expect } from "vitest";
import { settingsSchema } from "./zod";

describe("settings zod schema validation", () => {
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
    expect(settingsSchema.safeParse(data).success).toBe(true);
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
    expect(settingsSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all field types", () => {
    const types = ["toggle", "select", "text", "number", "slider", "radio", "color"] as const;
    for (const type of types) {
      const data = {
        type: "settings" as const,
        version: "1.0" as const,
        sections: [
          {
            id: "s1",
            title: "Section",
            fields: [{ id: "f1", label: "Field", type, value: "test" }],
          },
        ],
      };
      expect(settingsSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing sections", () => {
    const data = {
      type: "settings",
      version: "1.0",
      title: "Settings",
    };
    expect(settingsSchema.safeParse(data).success).toBe(false);
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
    expect(settingsSchema.safeParse(data).success).toBe(false);
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
    expect(settingsSchema.safeParse(data).success).toBe(false);
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
    expect(settingsSchema.safeParse(data).success).toBe(false);
  });

  it("rejects field missing label", () => {
    const data = {
      type: "settings",
      version: "1.0",
      sections: [
        {
          id: "s1",
          title: "Section",
          fields: [{ id: "f1", type: "text", value: "" }],
        },
      ],
    };
    expect(settingsSchema.safeParse(data).success).toBe(false);
  });
});
