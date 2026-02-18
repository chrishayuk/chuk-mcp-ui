import type { Meta, StoryObj } from "@storybook/react";
import { CounterRenderer } from "./App";
import type { CounterContent } from "./schema";

const meta = {
  title: "Views/Counter",
  component: CounterRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof CounterRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Revenue: Story = {
  args: {
    data: {
      type: "counter",
      version: "1.0",
      value: 48250,
      label: "Monthly Revenue",
      prefix: "$",
      delta: { value: 12.5, label: "vs last month" },
      sparkline: [32000, 35000, 33000, 38000, 42000, 45000, 48250],
      color: "success",
    } satisfies CounterContent,
  },
};

export const Errors: Story = {
  args: {
    data: {
      type: "counter",
      version: "1.0",
      value: 23,
      label: "Error Rate",
      suffix: "%",
      delta: { value: -5.2, label: "vs yesterday" },
      color: "danger",
    } satisfies CounterContent,
  },
};

export const Simple: Story = {
  args: {
    data: {
      type: "counter",
      version: "1.0",
      value: 1842,
      label: "Active Users",
    } satisfies CounterContent,
  },
};
