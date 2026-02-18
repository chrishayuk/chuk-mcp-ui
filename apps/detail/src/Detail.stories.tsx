import type { Meta, StoryObj } from "@storybook/react";
import { DetailRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { DetailContent } from "./schema";

const meta = {
  title: "Views/Detail",
  component: DetailRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof DetailRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserProfile: Story = {
  args: {
    data: {
      type: "detail",
      version: "1.0",
      title: "Jane Doe",
      subtitle: "Senior Software Engineer",
      image: { url: "https://i.pravatar.cc/150?u=jane", alt: "Jane Doe" },
      fields: [
        { label: "Email", value: "jane@example.com", type: "email" },
        { label: "Website", value: "https://jane.dev", type: "link" },
        { label: "Role", value: "Admin", type: "badge" },
        { label: "Joined", value: "January 15, 2024", type: "date" },
        { label: "Location", value: "San Francisco, CA" },
      ],
      actions: [
        { label: "Edit Profile", tool: "edit_user", args: { id: "usr_123" } },
        { label: "Send Message", tool: "send_message", args: { to: "usr_123" } },
      ],
      sections: [
        {
          title: "Employment",
          fields: [
            { label: "Company", value: "Acme Corp" },
            { label: "Department", value: "Engineering" },
            { label: "Start Date", value: "March 2022", type: "date" },
          ],
        },
      ],
    } satisfies DetailContent,
    onCallTool: mockCallTool,
  },
};

export const Minimal: Story = {
  args: {
    data: {
      type: "detail",
      version: "1.0",
      title: "API Key",
      fields: [
        { label: "Key ID", value: "sk_live_abc123" },
        { label: "Created", value: "2024-01-15", type: "date" },
        { label: "Status", value: "Active", type: "badge" },
      ],
    } satisfies DetailContent,
  },
};
