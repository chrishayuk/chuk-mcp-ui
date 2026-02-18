import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Input } from "./input";

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Label text",
  },
};

export const WithInput: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, maxWidth: 300 }}>
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
};
