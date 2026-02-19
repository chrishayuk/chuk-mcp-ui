import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("chat schema validation", () => {
  it("accepts minimal valid chat", () => {
    const data = {
      type: "chat",
      version: "1.0",
      messages: [],
      respondTool: "chat_respond",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts chat with all options", () => {
    const data = {
      type: "chat",
      version: "1.0",
      title: "Support Chat",
      messages: [
        {
          id: "msg-1",
          role: "user",
          content: "Hello",
          timestamp: "2025-06-15T10:00:00Z",
          status: "sent",
        },
        {
          id: "msg-2",
          role: "assistant",
          content: "Hi there!",
          timestamp: "2025-06-15T10:00:05Z",
        },
        {
          id: "msg-3",
          role: "system",
          content: "Welcome to support",
        },
      ],
      respondTool: "support_respond",
      placeholder: "Type here...",
      suggestions: ["Help", "FAQ"],
      showTypingIndicator: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all message roles", () => {
    const roles = ["user", "assistant", "system"];
    for (const role of roles) {
      const data = {
        type: "chat",
        version: "1.0",
        messages: [{ id: "msg-1", role, content: "test" }],
        respondTool: "respond",
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all message statuses", () => {
    const statuses = ["sending", "sent", "error"];
    for (const status of statuses) {
      const data = {
        type: "chat",
        version: "1.0",
        messages: [{ id: "msg-1", role: "user", content: "test", status }],
        respondTool: "respond",
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing messages", () => {
    const data = {
      type: "chat",
      version: "1.0",
      respondTool: "respond",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing respondTool", () => {
    const data = {
      type: "chat",
      version: "1.0",
      messages: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      messages: [],
      respondTool: "respond",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "chat",
      messages: [],
      respondTool: "respond",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects message missing required fields", () => {
    const data = {
      type: "chat",
      version: "1.0",
      messages: [{ role: "user", content: "test" }],
      respondTool: "respond",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "chat",
      version: "1.0",
      messages: [],
      respondTool: "respond",
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
