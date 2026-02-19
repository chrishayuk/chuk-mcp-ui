import type { Meta, StoryObj } from "@storybook/react";
import { EmbedRenderer } from "./App";
import type { EmbedContent } from "./schema";

const meta = {
  title: "Views/Embed",
  component: EmbedRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof EmbedRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithToolbar: Story = {
  args: {
    data: {
      type: "embed",
      version: "1.0",
      url: "https://example.com",
      toolbar: true,
      title: "External Page",
    } satisfies EmbedContent,
  },
};

export const Minimal: Story = {
  args: {
    data: {
      type: "embed",
      version: "1.0",
      url: "https://example.com",
    } satisfies EmbedContent,
  },
};

export const AspectRatio: Story = {
  args: {
    data: {
      type: "embed",
      version: "1.0",
      url: "https://example.com",
      aspectRatio: "16/9",
      title: "Video Embed",
    } satisfies EmbedContent,
  },
};
