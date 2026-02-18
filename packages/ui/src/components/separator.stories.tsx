import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: 300 }}>
      <p style={{ marginBottom: 8 }}>Content above</p>
      <Separator />
      <p style={{ marginTop: 8 }}>Content below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", height: 24, gap: 16 }}>
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};
