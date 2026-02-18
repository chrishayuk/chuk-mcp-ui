import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { ConfirmContent } from "./schema";

const meta = {
  title: "Views/Confirm",
  component: ConfirmRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ConfirmRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DangerDelete: Story = {
  args: {
    data: {
      type: "confirm",
      version: "1.0",
      title: "Delete Repository",
      message: "This will permanently delete the repository and all its contents. This action cannot be undone.",
      severity: "danger",
      details: [
        { label: "Repository", value: "acme/my-app" },
        { label: "Size", value: "2.3 GB" },
        { label: "Contributors", value: "12" },
      ],
      confirmLabel: "Yes, Delete Repository",
      cancelLabel: "Keep Repository",
      confirmTool: "delete_repo",
      confirmArgs: { id: "repo-123" },
      cancelTool: "cancel_action",
    } satisfies ConfirmContent,
    onCallTool: mockCallTool,
  },
};

export const Warning: Story = {
  args: {
    data: {
      type: "confirm",
      version: "1.0",
      title: "Upgrade Plan",
      message: "Upgrading to Pro will change your billing cycle. You will be charged the prorated amount immediately.",
      severity: "warning",
      details: [
        { label: "Current Plan", value: "Free" },
        { label: "New Plan", value: "Pro ($49/mo)" },
        { label: "Prorated Charge", value: "$32.67" },
      ],
      confirmLabel: "Upgrade Now",
      cancelLabel: "Maybe Later",
      confirmTool: "upgrade_plan",
      confirmArgs: { plan: "pro" },
    } satisfies ConfirmContent,
    onCallTool: mockCallTool,
  },
};

export const Info: Story = {
  args: {
    data: {
      type: "confirm",
      version: "1.0",
      title: "Export Data",
      message: "Your data will be exported as a CSV file and emailed to your registered address.",
      severity: "info",
      confirmLabel: "Export",
      confirmTool: "export_data",
      confirmArgs: { format: "csv" },
    } satisfies ConfirmContent,
    onCallTool: mockCallTool,
  },
};
