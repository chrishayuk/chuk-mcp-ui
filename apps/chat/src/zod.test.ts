import { describe, it, expect } from "vitest";
import { chatSchema } from "./zod";

describe("chat zod schema validation", () => {
  it("accepts minimal valid chat", () => {
    const data = {
      type: "chat",
      version: "1.0",
      messages: [],
      respondTool: "chat_respond",
    };
    expect(chatSchema.safeParse(data).success).toBe(true);
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
    expect(chatSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all message roles", () => {
    const roles = ["user", "assistant", "system"] as const;
    for (const role of roles) {
      const data = {
        type: "chat" as const,
        version: "1.0" as const,
        messages: [{ id: "msg-1", role, content: "test" }],
        respondTool: "respond",
      };
      expect(chatSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts all message statuses", () => {
    const statuses = ["sending", "sent", "error"] as const;
    for (const status of statuses) {
      const data = {
        type: "chat" as const,
        version: "1.0" as const,
        messages: [{ id: "msg-1", role: "user" as const, content: "test", status }],
        respondTool: "respond",
      };
      expect(chatSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing messages", () => {
    const data = {
      type: "chat",
      version: "1.0",
      respondTool: "respond",
    };
    expect(chatSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing respondTool", () => {
    const data = {
      type: "chat",
      version: "1.0",
      messages: [],
    };
    expect(chatSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "confirm",
      version: "1.0",
      messages: [],
      respondTool: "respond",
    };
    expect(chatSchema.safeParse(data).success).toBe(false);
  });
});
