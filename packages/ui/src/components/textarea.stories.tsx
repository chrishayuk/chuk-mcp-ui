import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type your message here...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled textarea",
  },
};
