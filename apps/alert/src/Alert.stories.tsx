import type { Meta, StoryObj } from "@storybook/react";
import { AlertRenderer } from "./App";
import type { AlertContent } from "./schema";

const meta = {
  title: "Views/Alert",
  component: AlertRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof AlertRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SystemAlerts: Story = {
  args: {
    data: {
      type: "alert",
      version: "1.0",
      title: "System Alerts",
      alerts: [
        {
          id: "a1",
          severity: "critical",
          title: "Database cluster unreachable",
          message: "Primary database node has been unreachable for 5 minutes. Failover initiated.",
          source: "db-monitor",
          category: "infrastructure",
          timestamp: "2024-01-15T10:30:00Z",
          actions: [
            { label: "View Logs", tool: "view_logs", arguments: { service: "postgres" } },
            { label: "Force Restart", tool: "restart_service", arguments: { service: "postgres", force: "true" }, variant: "destructive" },
          ],
          metadata: { host: "db-primary-01", region: "us-east-1", uptime: "47d 12h" },
        },
        {
          id: "a2",
          severity: "error",
          title: "SSL certificate expiring",
          message: "Certificate for api.example.com expires in 3 days.",
          source: "cert-checker",
          category: "security",
          timestamp: "2024-01-15T09:00:00Z",
          actions: [
            { label: "Renew Certificate", tool: "renew_cert", arguments: { domain: "api.example.com" } },
          ],
        },
        {
          id: "a3",
          severity: "warning",
          title: "High memory usage",
          message: "Worker pool memory at 87%. Consider scaling horizontally.",
          source: "resource-monitor",
          category: "performance",
          timestamp: "2024-01-15T10:15:00Z",
          metadata: { pool: "worker-pool-3", instances: "8" },
        },
        {
          id: "a4",
          severity: "warning",
          title: "Slow query detected",
          message: "Query on users table taking >5s on average.",
          source: "query-analyzer",
          category: "performance",
          timestamp: "2024-01-15T10:20:00Z",
        },
        {
          id: "a5",
          severity: "info",
          title: "Deployment scheduled",
          message: "Version 2.4.1 deployment scheduled for 14:00 UTC.",
          source: "ci-cd",
          category: "deployment",
          timestamp: "2024-01-15T08:00:00Z",
        },
        {
          id: "a6",
          severity: "success",
          title: "Backup completed",
          message: "Daily backup completed successfully. 142GB archived.",
          source: "backup-service",
          category: "maintenance",
          timestamp: "2024-01-15T06:00:00Z",
          metadata: { size: "142GB", duration: "23m" },
        },
      ],
    } satisfies AlertContent,
  },
};

export const HeritageAtRisk: Story = {
  args: {
    data: {
      type: "alert",
      version: "1.0",
      title: "Heritage at Risk Alerts",
      groupBy: "severity",
      alerts: [
        {
          id: "h1",
          severity: "critical",
          title: "Whitby Abbey - Structural Collapse Risk",
          message: "East wall section showing accelerated deterioration. Immediate stabilisation required.",
          source: "Historic England",
          category: "scheduled-monument",
          timestamp: "2024-01-14T14:00:00Z",
          actions: [
            { label: "View Site", tool: "her_get_monument", arguments: { id: "1234567" } },
          ],
          metadata: { "List Entry": "1234567", "Heritage Category": "Scheduled Monument" },
        },
        {
          id: "h2",
          severity: "critical",
          title: "Fountains Abbey - Water Ingress",
          message: "Significant water ingress detected in the cellarium following recent storms.",
          source: "Historic England",
          category: "grade-i",
          timestamp: "2024-01-13T10:00:00Z",
          actions: [
            { label: "View Site", tool: "her_get_monument", arguments: { id: "2345678" } },
          ],
        },
        {
          id: "h3",
          severity: "warning",
          title: "Rievaulx Abbey - Vegetation Growth",
          message: "Invasive vegetation growth threatening masonry joints in the choir area.",
          source: "Historic England",
          category: "scheduled-monument",
          timestamp: "2024-01-12T09:30:00Z",
          actions: [
            { label: "View Site", tool: "her_get_monument", arguments: { id: "3456789" } },
          ],
        },
        {
          id: "h4",
          severity: "warning",
          title: "Byland Abbey - Tile Erosion",
          message: "Medieval floor tiles showing increased wear from visitor footfall.",
          source: "Historic England",
          category: "scheduled-monument",
          timestamp: "2024-01-11T11:00:00Z",
          actions: [
            { label: "View Site", tool: "her_get_monument", arguments: { id: "4567890" } },
          ],
          metadata: { "Condition": "Poor", "Trend": "Declining" },
        },
      ],
    } satisfies AlertContent,
  },
};

export const Dismissible: Story = {
  args: {
    data: {
      type: "alert",
      version: "1.0",
      title: "Notifications",
      dismissible: true,
      groupBy: "severity",
      alerts: [
        {
          id: "d1",
          severity: "error",
          title: "Payment processing failed",
          message: "Transaction TX-9182 could not be completed. Retry in progress.",
          source: "payments",
          timestamp: "2024-01-15T10:30:00Z",
          dismissible: true,
        },
        {
          id: "d2",
          severity: "warning",
          title: "API rate limit approaching",
          message: "Current usage at 85% of hourly rate limit.",
          source: "api-gateway",
          timestamp: "2024-01-15T10:25:00Z",
          dismissible: true,
        },
        {
          id: "d3",
          severity: "warning",
          title: "Disk space low",
          message: "Volume /data has 12% free space remaining.",
          source: "disk-monitor",
          timestamp: "2024-01-15T10:20:00Z",
          dismissible: true,
        },
        {
          id: "d4",
          severity: "info",
          title: "Maintenance window scheduled",
          message: "System maintenance planned for Saturday 02:00-04:00 UTC.",
          source: "ops",
          timestamp: "2024-01-15T09:00:00Z",
          dismissible: true,
        },
        {
          id: "d5",
          severity: "success",
          title: "Migration completed",
          message: "Database migration v42 applied successfully.",
          source: "migrations",
          timestamp: "2024-01-15T08:00:00Z",
          dismissible: true,
        },
      ],
    } satisfies AlertContent,
  },
};
