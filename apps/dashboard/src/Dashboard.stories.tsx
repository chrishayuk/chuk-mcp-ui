import type { Meta, StoryObj } from "@storybook/react";
import { Dashboard } from "./App";
import { ViewBusProvider } from "@chuk/view-shared";

const meta = {
  title: "Views/Dashboard",
  component: Dashboard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ViewBusProvider><div style={{ height: "600px" }}><Story /></div></ViewBusProvider>],
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourPanelGrid: Story = {
  args: {
    data: {
      type: "dashboard",
      version: "1.0",
      title: "Sample Dashboard",
      layout: "grid",
      gap: "8px",
      panels: [
        { id: "p1", label: "Panel 1", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
        { id: "p2", label: "Panel 2", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
        { id: "p3", label: "Panel 3", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
        { id: "p4", label: "Panel 4", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
      ],
    },
  },
};
