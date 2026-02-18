import type { Meta, StoryObj } from "@storybook/react";
import { StatusRenderer } from "./App";
import type { StatusContent } from "./schema";

const meta = {
  title: "Views/Status",
  component: StatusRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof StatusRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  args: {
    data: {
      type: "status",
      version: "1.0",
      title: "Production Systems",
      items: [
        { id: "api", label: "API Server", status: "ok", detail: "Response time: 45ms", lastChecked: "2 min ago" },
        { id: "db", label: "Database", status: "ok", detail: "Connections: 12/100", lastChecked: "1 min ago" },
        { id: "cache", label: "Redis Cache", status: "ok", detail: "Memory: 256MB/1GB", lastChecked: "30s ago" },
        { id: "cdn", label: "CDN", status: "ok", detail: "Hit rate: 98.5%", lastChecked: "5 min ago", url: "https://cdn.example.com" },
        { id: "queue", label: "Message Queue", status: "ok", detail: "0 messages pending", lastChecked: "1 min ago" },
      ],
    } satisfies StatusContent,
  },
};

export const Degraded: Story = {
  args: {
    data: {
      type: "status",
      version: "1.0",
      title: "Infrastructure Health",
      items: [
        { id: "api", label: "API Server", status: "ok", detail: "Response time: 45ms" },
        { id: "db", label: "Primary Database", status: "warning", detail: "High memory usage (87%)", lastChecked: "1 min ago" },
        { id: "replica", label: "Read Replica", status: "ok", detail: "Replication lag: 0.2s" },
        { id: "cache", label: "Redis Cache", status: "warning", detail: "Eviction rate increasing" },
        { id: "worker", label: "Background Workers", status: "ok", detail: "3/3 running" },
        { id: "search", label: "Search Index", status: "pending", detail: "Reindexing in progress..." },
      ],
    } satisfies StatusContent,
  },
};

export const Outage: Story = {
  args: {
    data: {
      type: "status",
      version: "1.0",
      title: "System Status",
      items: [
        { id: "api", label: "API Server", status: "error", detail: "Connection timeout", lastChecked: "30s ago" },
        { id: "db", label: "Database", status: "error", detail: "Connection refused" },
        { id: "cache", label: "Cache", status: "unknown", detail: "Unable to reach host" },
        { id: "cdn", label: "CDN", status: "ok", detail: "Serving cached content" },
        { id: "dns", label: "DNS", status: "ok", detail: "Resolving normally" },
      ],
      summary: { ok: 2, warning: 0, error: 2 },
    } satisfies StatusContent,
  },
};
