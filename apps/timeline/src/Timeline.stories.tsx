import type { Meta, StoryObj } from "@storybook/react";
import { TimelineRenderer } from "./App";
import type { TimelineContent } from "./schema";

const meta = {
  title: "Views/Timeline",
  component: TimelineRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof TimelineRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectHistory: Story = {
  args: {
    data: {
      type: "timeline",
      version: "1.0",
      title: "Project History",
      events: [
        {
          id: "evt-1",
          title: "Project Kickoff",
          description: "Initial planning session with stakeholders. Defined scope, timeline, and resource allocation for the first phase.",
          date: "2024-09-01",
          severity: "info",
          icon: "\uD83D\uDE80",
          details: [
            { label: "Lead", value: "Sarah Chen" },
            { label: "Budget", value: "$250,000" },
          ],
        },
        {
          id: "evt-2",
          title: "Requirements Finalized",
          description: "All functional and non-functional requirements approved by the steering committee.",
          date: "2024-09-15",
          severity: "success",
          icon: "\uD83D\uDCCB",
          tags: ["milestone"],
        },
        {
          id: "evt-3",
          title: "Architecture Review",
          description: "Completed system architecture review with the engineering team. Selected microservices approach.",
          date: "2024-10-02",
          severity: "info",
          icon: "\uD83C\uDFD7\uFE0F",
          details: [
            { label: "Pattern", value: "Microservices" },
            { label: "Services", value: "12 planned" },
            { label: "Database", value: "PostgreSQL + Redis" },
          ],
        },
        {
          id: "evt-4",
          title: "Sprint 1 Complete",
          date: "2024-10-20",
          severity: "success",
          icon: "\u2705",
          tags: ["sprint", "on-track"],
        },
        {
          id: "evt-5",
          title: "Performance Issue Detected",
          description: "Load testing revealed response time degradation above 200 concurrent users. Requires optimization of database queries.",
          date: "2024-10-28",
          severity: "warning",
          icon: "\u26A0\uFE0F",
          tags: ["performance"],
          details: [
            { label: "P95 Latency", value: "1.2s (target: 200ms)" },
            { label: "Affected", value: "Search endpoint" },
          ],
        },
        {
          id: "evt-6",
          title: "Security Audit Passed",
          description: "Third-party security audit completed with no critical findings.",
          date: "2024-11-05",
          severity: "success",
          icon: "\uD83D\uDD12",
          tags: ["security", "milestone"],
        },
        {
          id: "evt-7",
          title: "Deployment Pipeline Failure",
          description: "CI/CD pipeline broke due to expired certificates. Resolved within 4 hours.",
          date: "2024-11-12",
          severity: "error",
          icon: "\uD83D\uDEA8",
          details: [
            { label: "Downtime", value: "4 hours" },
            { label: "Root Cause", value: "Expired TLS certificates" },
            { label: "Resolution", value: "Auto-renewal configured" },
          ],
        },
        {
          id: "evt-8",
          title: "Beta Release",
          description: "First beta release deployed to staging environment. 50 beta testers onboarded.",
          date: "2024-11-20",
          severity: "success",
          icon: "\uD83C\uDF89",
          tags: ["release", "milestone"],
        },
      ],
    } satisfies TimelineContent,
  },
};

export const HeritageSurvey: Story = {
  args: {
    data: {
      type: "timeline",
      version: "1.0",
      title: "Heritage Site Survey",
      groups: [
        { id: "fieldwork", label: "Fieldwork", color: "#2563eb" },
        { id: "analysis", label: "Analysis", color: "#9333ea" },
        { id: "publication", label: "Publication", color: "#059669" },
      ],
      events: [
        {
          id: "hs-1",
          title: "Initial Site Visit",
          description: "Preliminary walkover survey of the medieval church ruins. Recorded GPS coordinates and photographic evidence.",
          date: "2024-06-10",
          group: "fieldwork",
          severity: "info",
          icon: "\uD83C\uDFDB\uFE0F",
          details: [
            { label: "Site", value: "St Mary's Chapel Ruins" },
            { label: "Grid Ref", value: "TQ 515 178" },
          ],
          action: {
            label: "View Site Record",
            tool: "get_monument",
            arguments: { id: "mon-12345" },
          },
        },
        {
          id: "hs-2",
          title: "Geophysical Survey",
          description: "Ground-penetrating radar survey covering 2 hectares around the chapel footprint.",
          date: "2024-07-22",
          group: "fieldwork",
          severity: "success",
          icon: "\uD83D\uDCE1",
          tags: ["GPR", "non-invasive"],
          action: {
            label: "Download GPR Data",
            tool: "export_survey",
            arguments: { surveyId: "gpr-2024-07", format: "geojson" },
          },
        },
        {
          id: "hs-3",
          title: "Finds Processing",
          description: "Catalogued 142 finds from surface collection including medieval pottery sherds and iron nails.",
          date: "2024-08-15",
          group: "analysis",
          severity: "info",
          icon: "\uD83E\uDEA3",
          details: [
            { label: "Total Finds", value: "142" },
            { label: "Period", value: "13th-14th century" },
            { label: "Notable", value: "Decorated floor tile fragment" },
          ],
        },
        {
          id: "hs-4",
          title: "Radiocarbon Dating Results",
          description: "Two samples returned consistent dates confirming 13th century construction phase.",
          date: "2024-09-30",
          group: "analysis",
          severity: "success",
          icon: "\u2622\uFE0F",
          tags: ["C14", "dating"],
          details: [
            { label: "Sample A", value: "1240-1280 CE (95%)" },
            { label: "Sample B", value: "1250-1290 CE (95%)" },
          ],
        },
        {
          id: "hs-5",
          title: "Interim Report Submitted",
          description: "Interim fieldwork report submitted to Historic England. Awaiting review.",
          date: "2024-10-20",
          group: "publication",
          severity: "warning",
          icon: "\uD83D\uDCC4",
          tags: ["report"],
        },
        {
          id: "hs-6",
          title: "Journal Article Published",
          description: "Full excavation report published in Medieval Archaeology journal.",
          date: "2024-12-01",
          group: "publication",
          severity: "success",
          icon: "\uD83D\uDCD6",
          action: {
            label: "View Publication",
            tool: "open_url",
            arguments: { url: "https://doi.org/10.1234/example" },
          },
        },
      ],
    } satisfies TimelineContent,
  },
};

export const SystemIncidents: Story = {
  args: {
    data: {
      type: "timeline",
      version: "1.0",
      title: "System Incidents",
      events: [
        {
          id: "inc-1",
          title: "Database Connection Pool Exhausted",
          description: "All available connections consumed during peak traffic. Application returned 503 errors for 12 minutes.",
          date: "2024-11-01T09:15:00Z",
          severity: "error",
          icon: "\uD83D\uDEA8",
          tags: ["database", "outage"],
          details: [
            { label: "Duration", value: "12 minutes" },
            { label: "Affected Users", value: "~3,400" },
            { label: "Root Cause", value: "Connection leak in auth service" },
            { label: "Resolution", value: "Patched connection handling, increased pool size" },
          ],
        },
        {
          id: "inc-2",
          title: "Elevated API Error Rate",
          description: "Error rate increased to 2.3% on the payments endpoint due to a downstream provider issue.",
          date: "2024-11-05T14:30:00Z",
          severity: "warning",
          icon: "\u26A0\uFE0F",
          tags: ["api", "payments"],
          details: [
            { label: "Error Rate", value: "2.3% (baseline: 0.1%)" },
            { label: "Provider", value: "Stripe" },
          ],
        },
        {
          id: "inc-3",
          title: "CDN Cache Purge Failure",
          description: "Scheduled cache purge did not propagate to all edge nodes. Some users received stale content for 45 minutes.",
          date: "2024-11-10T03:00:00Z",
          severity: "warning",
          icon: "\uD83C\uDF10",
          tags: ["cdn", "cache"],
        },
        {
          id: "inc-4",
          title: "Complete Service Outage",
          description: "Kubernetes cluster node failure caused cascading pod evictions. All services unavailable for 28 minutes.",
          date: "2024-11-18T22:45:00Z",
          severity: "error",
          icon: "\uD83D\uDD25",
          tags: ["kubernetes", "outage", "critical"],
          details: [
            { label: "Duration", value: "28 minutes" },
            { label: "Affected", value: "All services" },
            { label: "Root Cause", value: "Node hardware failure + insufficient redundancy" },
            { label: "Follow-up", value: "Added N+2 node redundancy" },
          ],
        },
        {
          id: "inc-5",
          title: "SSL Certificate Expiry Warning",
          description: "Monitoring alert: wildcard certificate for *.example.com expires in 7 days. Renewal initiated.",
          date: "2024-11-25T10:00:00Z",
          severity: "warning",
          icon: "\uD83D\uDD12",
          tags: ["ssl", "certificate"],
          details: [
            { label: "Domain", value: "*.example.com" },
            { label: "Expiry", value: "2024-12-02" },
            { label: "Status", value: "Auto-renewal initiated" },
          ],
        },
      ],
    } satisfies TimelineContent,
  },
};
