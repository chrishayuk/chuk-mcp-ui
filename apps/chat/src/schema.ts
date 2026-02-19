export interface ChatContent {
  type: "chat";
  version: "1.0";
  title?: string;
  messages: ChatMessage[];
  respondTool: string;
  placeholder?: string;
  suggestions?: string[];
  showTypingIndicator?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  status?: "sending" | "sent" | "error";
}
