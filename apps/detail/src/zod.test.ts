import { describe, it, expect } from "vitest";
import { detailSchema } from "./zod";

describe("detail zod schema validation", () => {
  it("accepts minimal valid detail", () => {
    const data = {
      type: "detail",
      version: "1.0",
      title: "User Profile",
      fields: [{ label: "Name", value: "Jane Doe" }],
    };
    expect(detailSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full detail with all optional fields", () => {
    const data = {
      type: "detail",
      version: "1.0",
      title: "User Profile",
      subtitle: "Active Member",
      image: { url: "https://example.com/photo.jpg", alt: "User photo" },
      fields: [
        { label: "Name", value: "Jane Doe", type: "text" },
        { label: "Email", value: "jane@example.com", type: "email" },
        { label: "Website", value: "https://jane.dev", type: "link" },
        { label: "Role", value: "Admin", type: "badge" },
        { label: "Joined", value: "2024-01-15", type: "date" },
      ],
      actions: [
        { label: "Edit", tool: "edit_user", args: { id: "123" } },
        { label: "Delete", tool: "delete_user" },
      ],
      sections: [
        {
          title: "Contact Info",
          fields: [
            { label: "Phone", value: "+1-555-0100" },
            { label: "Address", value: "123 Main St" },
          ],
        },
      ],
    };
    expect(detailSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all field types", () => {
    const types = ["text", "link", "badge", "date", "email"];
    for (const fieldType of types) {
      const data = {
        type: "detail",
        version: "1.0",
        title: "Test",
        fields: [{ label: "Test", value: "test", type: fieldType }],
      };
      expect(detailSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing title", () => {
    const data = {
      type: "detail",
      version: "1.0",
      fields: [{ label: "Name", value: "Jane" }],
    };
    expect(detailSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing fields", () => {
    const data = {
      type: "detail",
      version: "1.0",
      title: "Test",
    };
    expect(detailSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "counter",
      version: "1.0",
      title: "Test",
      fields: [],
    };
    expect(detailSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "detail",
      title: "Test",
      fields: [{ label: "Name", value: "Jane" }],
    };
    expect(detailSchema.safeParse(data).success).toBe(false);
  });
});
