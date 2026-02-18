import type { Meta, StoryObj } from "@storybook/react";
import { CodeRenderer } from "./App";
import type { CodeContent } from "./schema";

const meta = {
  title: "Views/Code",
  component: CodeRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof CodeRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {
  args: {
    data: {
      type: "code",
      version: "1.0",
      code: `import { useView, Fallback } from "@chuk/view-shared";
import type { CounterContent } from "./schema";

export function CounterView() {
  const { data, content, isConnected } =
    useView<CounterContent>("counter", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <CounterRenderer data={data} />;
}`,
      language: "typescript",
      title: "CounterView.tsx",
      lineNumbers: true,
    } satisfies CodeContent,
  },
};

export const Python: Story = {
  args: {
    data: {
      type: "code",
      version: "1.0",
      code: `import asyncio
from mcp import Server

async def main():
    server = Server("example")

    @server.tool("get_users")
    async def get_users():
        return [
            {"name": "Alice", "role": "admin"},
            {"name": "Bob", "role": "user"},
        ]

    await server.run()

asyncio.run(main())`,
      language: "python",
      title: "server.py",
      lineNumbers: true,
      highlightLines: [4, 6],
    } satisfies CodeContent,
  },
};

export const JSON: Story = {
  args: {
    data: {
      type: "code",
      version: "1.0",
      code: `{
  "name": "@chuk/view-code",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "shiki": "^3.0.0",
    "react": "^18.3.0"
  }
}`,
      language: "json",
      title: "package.json",
    } satisfies CodeContent,
  },
};
