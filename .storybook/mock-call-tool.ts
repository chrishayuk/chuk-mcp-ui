import { fn } from "@storybook/test";

export const mockCallTool = fn(
  async (name: string, args: Record<string, unknown>) => {
    console.log(`[callTool] ${name}`, args);
  }
).mockName("onCallTool");
