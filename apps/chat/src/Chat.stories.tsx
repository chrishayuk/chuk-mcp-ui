import type { Meta, StoryObj } from "@storybook/react";
import { ChatRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { ChatContent } from "./schema";

const meta = {
  title: "Views/Chat",
  component: ChatRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ChatRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomerSupport: Story = {
  args: {
    data: {
      type: "chat",
      version: "1.0",
      title: "Support Chat",
      messages: [
        {
          id: "msg-1",
          role: "user",
          content: "Hi, I need help with my recent order #12345.",
          timestamp: "2025-06-15T10:00:00Z",
          status: "sent",
        },
        {
          id: "msg-2",
          role: "assistant",
          content: "Hello! I'd be happy to help you with order #12345. Let me pull up the details. It looks like your order was shipped yesterday and is currently in transit.",
          timestamp: "2025-06-15T10:00:05Z",
        },
        {
          id: "msg-3",
          role: "user",
          content: "Great, when should I expect delivery?",
          timestamp: "2025-06-15T10:01:00Z",
          status: "sent",
        },
        {
          id: "msg-4",
          role: "assistant",
          content: "Based on the tracking information, your package is estimated to arrive by June 18th. Would you like me to send you the tracking link?",
          timestamp: "2025-06-15T10:01:10Z",
        },
      ],
      respondTool: "support_respond",
      placeholder: "Type your question...",
      suggestions: ["Track Order", "Return Item", "Contact Support"],
    } satisfies ChatContent,
    onCallTool: mockCallTool,
  },
};

export const DataExplorer: Story = {
  args: {
    data: {
      type: "chat",
      version: "1.0",
      title: "Data Explorer",
      messages: [
        {
          id: "msg-1",
          role: "system",
          content: "Ask questions about the dataset",
        },
        {
          id: "msg-2",
          role: "user",
          content: "How many heritage sites are listed in the south-east region?",
          timestamp: "2025-06-15T14:00:00Z",
          status: "sent",
        },
        {
          id: "msg-3",
          role: "assistant",
          content: "There are 2,847 listed heritage sites in the south-east region. This includes 2,312 Grade II listed buildings, 401 Grade II* listed buildings, and 134 Grade I listed buildings.",
          timestamp: "2025-06-15T14:00:12Z",
        },
        {
          id: "msg-4",
          role: "user",
          content: "Which ones are at risk?",
          timestamp: "2025-06-15T14:01:00Z",
          status: "sent",
        },
        {
          id: "msg-5",
          role: "assistant",
          content: "Of the 2,847 heritage sites, 187 are currently on the Heritage at Risk Register. The most common issues are structural deterioration (42%), water ingress (31%), and vacancy (27%). Would you like a breakdown by district?",
          timestamp: "2025-06-15T14:01:15Z",
        },
      ],
      respondTool: "query_dataset",
    } satisfies ChatContent,
    onCallTool: mockCallTool,
  },
};

export const Empty: Story = {
  args: {
    data: {
      type: "chat",
      version: "1.0",
      title: "New Conversation",
      messages: [],
      respondTool: "chat_respond",
      placeholder: "Ask me anything...",
      suggestions: ["What can you do?", "Show me examples", "Help me get started"],
    } satisfies ChatContent,
    onCallTool: mockCallTool,
  },
};
