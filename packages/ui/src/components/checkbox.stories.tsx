import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        style={{ fontSize: 14, fontWeight: 500, lineHeight: 1 }}
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};
