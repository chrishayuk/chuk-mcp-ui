import type { Meta, StoryObj } from "@storybook/react";
import { TabsInner } from "./App";
import { ViewBusProvider } from "@chuk/view-shared";

const meta = {
  title: "Views/Tabs",
  component: TabsInner,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ViewBusProvider><div style={{ height: "600px" }}><Story /></div></ViewBusProvider>],
} satisfies Meta<typeof TabsInner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeTabs: Story = {
  args: {
    data: {
      type: "tabs",
      version: "1.0",
      activeTab: "tab1",
      tabs: [
        {
          id: "tab1",
          label: "Overview",
          viewUrl: "about:blank",
          structuredContent: {},
        },
        {
          id: "tab2",
          label: "Details",
          viewUrl: "about:blank",
          structuredContent: {},
        },
        {
          id: "tab3",
          label: "Settings",
          viewUrl: "about:blank",
          structuredContent: {},
        },
      ],
    },
  },
};
