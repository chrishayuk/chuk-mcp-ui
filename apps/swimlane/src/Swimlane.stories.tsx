import type { Meta, StoryObj } from "@storybook/react";
import { SwimlaneRenderer } from "./App";
import type { SwimlaneContent } from "./schema";

const meta = {
  title: "Views/Swimlane",
  component: SwimlaneRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "700px" }}><Story /></div>],
} satisfies Meta<typeof SwimlaneRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SoftwareDelivery: Story = {
  args: {
    data: {
      type: "swimlane",
      version: "1.0",
      title: "Software Delivery Pipeline",
      lanes: [
        { id: "design", label: "Design", color: "#8b5cf6" },
        { id: "dev", label: "Development", color: "#3b82f6" },
        { id: "qa", label: "QA", color: "#f59e0b" },
        { id: "ops", label: "Ops", color: "#10b981" },
      ],
      columns: [
        { id: "backlog", label: "Backlog" },
        { id: "in-progress", label: "In Progress" },
        { id: "review", label: "Review" },
        { id: "done", label: "Done" },
      ],
      activities: [
        {
          id: "a1",
          laneId: "design",
          columnId: "backlog",
          label: "Create wireframes",
          description: "Dashboard layout wireframes for v2 redesign",
          status: "pending",
        },
        {
          id: "a2",
          laneId: "design",
          columnId: "in-progress",
          label: "Design system tokens",
          description: "Define spacing, color, and typography tokens",
          status: "active",
        },
        {
          id: "a3",
          laneId: "design",
          columnId: "done",
          label: "Logo refresh",
          status: "completed",
        },
        {
          id: "a4",
          laneId: "dev",
          columnId: "in-progress",
          label: "Implement auth flow",
          description: "OAuth2 PKCE flow for SPA clients",
          status: "active",
        },
        {
          id: "a5",
          laneId: "dev",
          columnId: "review",
          label: "API rate limiting",
          description: "Sliding window rate limiter for public endpoints",
          status: "active",
        },
        {
          id: "a6",
          laneId: "dev",
          columnId: "backlog",
          label: "Migrate to Node 22",
          status: "pending",
        },
        {
          id: "a7",
          laneId: "qa",
          columnId: "in-progress",
          label: "E2E test suite",
          description: "Playwright tests for critical user journeys",
          status: "active",
        },
        {
          id: "a8",
          laneId: "qa",
          columnId: "backlog",
          label: "Load testing",
          description: "Simulate 10k concurrent users",
          status: "blocked",
        },
        {
          id: "a9",
          laneId: "ops",
          columnId: "done",
          label: "Set up CI/CD",
          status: "completed",
        },
        {
          id: "a10",
          laneId: "ops",
          columnId: "in-progress",
          label: "Configure monitoring",
          description: "Grafana dashboards and PagerDuty alerts",
          status: "active",
        },
      ],
    } satisfies SwimlaneContent,
  },
};

export const CrossTeamProject: Story = {
  args: {
    data: {
      type: "swimlane",
      version: "1.0",
      title: "Cross-Team Project Tracker",
      lanes: [
        { id: "frontend", label: "Frontend", color: "#06b6d4" },
        { id: "backend", label: "Backend", color: "#f59e0b" },
        { id: "devops", label: "DevOps", color: "#64748b" },
      ],
      columns: [
        { id: "sprint-1", label: "Sprint 1" },
        { id: "sprint-2", label: "Sprint 2" },
        { id: "sprint-3", label: "Sprint 3" },
      ],
      activities: [
        {
          id: "ct1",
          laneId: "frontend",
          columnId: "sprint-1",
          label: "Component library",
          description: "Build reusable UI component library",
          status: "completed",
        },
        {
          id: "ct2",
          laneId: "frontend",
          columnId: "sprint-2",
          label: "Dashboard views",
          description: "Implement main dashboard and analytics views",
          status: "active",
        },
        {
          id: "ct3",
          laneId: "frontend",
          columnId: "sprint-3",
          label: "Mobile responsive",
          status: "pending",
        },
        {
          id: "ct4",
          laneId: "backend",
          columnId: "sprint-1",
          label: "Database schema",
          description: "Design and migrate PostgreSQL schema",
          status: "completed",
        },
        {
          id: "ct5",
          laneId: "backend",
          columnId: "sprint-1",
          label: "REST API v1",
          description: "Core CRUD endpoints for all resources",
          status: "completed",
        },
        {
          id: "ct6",
          laneId: "backend",
          columnId: "sprint-2",
          label: "GraphQL layer",
          description: "Add GraphQL gateway over REST services",
          status: "active",
        },
        {
          id: "ct7",
          laneId: "backend",
          columnId: "sprint-3",
          label: "Caching layer",
          description: "Redis caching for frequently accessed data",
          status: "pending",
        },
        {
          id: "ct8",
          laneId: "devops",
          columnId: "sprint-1",
          label: "Kubernetes setup",
          status: "completed",
        },
        {
          id: "ct9",
          laneId: "devops",
          columnId: "sprint-2",
          label: "CI pipeline",
          description: "GitHub Actions with automated testing and deploy",
          status: "blocked",
        },
        {
          id: "ct10",
          laneId: "devops",
          columnId: "sprint-3",
          label: "Observability stack",
          description: "OpenTelemetry traces, metrics, and logs",
          status: "pending",
        },
      ],
    } satisfies SwimlaneContent,
  },
};

export const OrderFulfillment: Story = {
  args: {
    data: {
      type: "swimlane",
      version: "1.0",
      title: "Order Fulfillment Process",
      lanes: [
        { id: "sales", label: "Sales", color: "#ec4899" },
        { id: "warehouse", label: "Warehouse", color: "#f97316" },
        { id: "shipping", label: "Shipping", color: "#0ea5e9" },
      ],
      columns: [
        { id: "received", label: "Received" },
        { id: "processing", label: "Processing" },
        { id: "shipped", label: "Shipped" },
        { id: "delivered", label: "Delivered" },
      ],
      activities: [
        {
          id: "of1",
          laneId: "sales",
          columnId: "received",
          label: "Order #1042",
          description: "Enterprise license - 50 seats",
          status: "completed",
        },
        {
          id: "of2",
          laneId: "sales",
          columnId: "received",
          label: "Order #1043",
          description: "Starter plan - 5 seats",
          status: "active",
        },
        {
          id: "of3",
          laneId: "sales",
          columnId: "processing",
          label: "Order #1044",
          description: "Custom integration package",
          status: "blocked",
        },
        {
          id: "of4",
          laneId: "warehouse",
          columnId: "processing",
          label: "Pick & pack #1042",
          description: "Hardware bundle with setup guide",
          status: "active",
        },
        {
          id: "of5",
          laneId: "warehouse",
          columnId: "shipped",
          label: "Pick & pack #1039",
          status: "completed",
        },
        {
          id: "of6",
          laneId: "warehouse",
          columnId: "received",
          label: "Inventory check",
          description: "Verify stock levels for Q1 orders",
          status: "pending",
        },
        {
          id: "of7",
          laneId: "shipping",
          columnId: "shipped",
          label: "Shipment #1039",
          description: "FedEx Express - tracking 789456123",
          status: "active",
        },
        {
          id: "of8",
          laneId: "shipping",
          columnId: "delivered",
          label: "Shipment #1037",
          description: "Delivered Jan 15 - signed by J. Smith",
          status: "completed",
        },
        {
          id: "of9",
          laneId: "shipping",
          columnId: "delivered",
          label: "Shipment #1038",
          description: "Delivered Jan 16 - left at front desk",
          status: "completed",
        },
      ],
    } satisfies SwimlaneContent,
  },
};
