import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./scroll-area";

const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: 200, width: 350 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <ScrollArea className="h-full w-full rounded-md border p-4">
      <div>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i} style={{ marginBottom: 8 }}>
            Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};
