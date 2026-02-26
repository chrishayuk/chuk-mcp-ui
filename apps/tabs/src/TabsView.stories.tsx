import type { Meta, StoryObj } from "@storybook/react";
import { TabsRenderer } from "./App";
import { ViewBusProvider } from "@chuk/view-shared";

const meta = {
  title: "Views/Tabs",
  component: TabsRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ViewBusProvider><div style={{ height: "600px" }}><Story /></div></ViewBusProvider>],
} satisfies Meta<typeof TabsRenderer>;

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
