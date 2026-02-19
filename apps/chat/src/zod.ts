import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string().optional(),
  status: z.enum(["sending", "sent", "error"]).optional(),
});

export const chatSchema = z.object({
  type: z.literal("chat"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  messages: z.array(chatMessageSchema),
  respondTool: z.string(),
  placeholder: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
  showTypingIndicator: z.boolean().optional(),
});

export type ChatContent = z.infer<typeof chatSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
