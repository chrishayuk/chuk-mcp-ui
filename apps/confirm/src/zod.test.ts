import { describe, it, expect } from "vitest";
import { confirmSchema } from "./zod";

describe("confirm zod schema validation", () => {
  it("accepts minimal valid confirm", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      title: "Delete File",
      message: "Are you sure you want to delete this file?",
    };
    expect(confirmSchema.safeParse(data).success).toBe(true);
  });

  it("accepts confirm with all options", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      title: "Delete Repository",
      message: "This action cannot be undone.",
      severity: "danger",
      details: [
        { label: "Repository", value: "my-app" },
        { label: "Size", value: "2.3 GB" },
      ],
      confirmLabel: "Yes, Delete",
      cancelLabel: "Keep It",
      confirmTool: "delete_repo",
      confirmArgs: { id: "repo-123" },
      cancelTool: "cancel_action",
      cancelArgs: { reason: "user_cancelled" },
    };
    expect(confirmSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all severity levels", () => {
    const severities = ["info", "warning", "danger"] as const;
    for (const severity of severities) {
      const data = {
        type: "confirm" as const,
        version: "1.0" as const,
        title: "Action",
        message: "Proceed?",
        severity,
      };
      expect(confirmSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing title", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      message: "Proceed?",
    };
    expect(confirmSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing message", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      title: "Action",
    };
    expect(confirmSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      title: "Action",
      message: "Proceed?",
    };
    expect(confirmSchema.safeParse(data).success).toBe(false);
  });
});
