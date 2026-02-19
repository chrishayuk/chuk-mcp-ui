import type { Meta, StoryObj } from "@storybook/react";
import { Split } from "./App";
import { ViewBusProvider } from "@chuk/view-shared";

const meta = {
  title: "Views/Split",
  component: Split,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ViewBusProvider><div style={{ height: "600px" }}><Story /></div></ViewBusProvider>],
} satisfies Meta<typeof Split>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    data: {
      type: "split",
      version: "1.0",
      direction: "horizontal",
      ratio: "60:40",
      left: {
        label: "Left Panel",
        viewUrl: "about:blank",
        structuredContent: {},
      },
      right: {
        label: "Right Panel",
        viewUrl: "about:blank",
        structuredContent: {},
      },
    },
  },
};

export const Vertical: Story = {
  args: {
    data: {
      type: "split",
      version: "1.0",
      direction: "vertical",
      ratio: "50:50",
      left: {
        label: "Top Panel",
        viewUrl: "about:blank",
        structuredContent: {},
      },
      right: {
        label: "Bottom Panel",
        viewUrl: "about:blank",
        structuredContent: {},
      },
    },
  },
};
