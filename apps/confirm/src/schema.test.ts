import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("confirm schema validation", () => {
  it("accepts minimal valid confirm", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      title: "Delete File",
      message: "Are you sure you want to delete this file?",
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts all severity levels", () => {
    const severities = ["info", "warning", "danger"];
    for (const severity of severities) {
      const data = {
        type: "confirm",
        version: "1.0",
        title: "Action",
        message: "Proceed?",
        severity,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing title", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      message: "Proceed?",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing message", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      title: "Action",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      title: "Action",
      message: "Proceed?",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "confirm",
      title: "Action",
      message: "Proceed?",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      title: "Action",
      message: "Proceed?",
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
