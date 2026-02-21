import type { Meta, StoryObj } from "@storybook/react";
import { GanttRenderer } from "./App";
import type { GanttContent } from "./schema";

const meta = {
  title: "Views/Gantt",
  component: GanttRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof GanttRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: ProjectPlan                                               */
/* ------------------------------------------------------------------ */

export const ProjectPlan: Story = {
  args: {
    data: {
      type: "gantt",
      version: "1.0",
      title: "Software Project Plan",
      tasks: [
        {
          id: "design-ui",
          label: "UI Design",
          start: "2025-03-01",
          end: "2025-03-14",
          progress: 100,
          color: "#3b82f6",
          group: "Design",
        },
        {
          id: "design-api",
          label: "API Design",
          start: "2025-03-03",
          end: "2025-03-12",
          progress: 100,
          color: "#3b82f6",
          group: "Design",
        },
        {
          id: "dev-frontend",
          label: "Frontend Development",
          start: "2025-03-15",
          end: "2025-04-11",
          progress: 60,
          color: "#22c55e",
          dependencies: ["design-ui"],
          group: "Development",
        },
        {
          id: "dev-backend",
          label: "Backend Development",
          start: "2025-03-13",
          end: "2025-04-04",
          progress: 80,
          color: "#22c55e",
          dependencies: ["design-api"],
          group: "Development",
        },
        {
          id: "dev-integration",
          label: "Integration",
          start: "2025-04-05",
          end: "2025-04-18",
          progress: 20,
          color: "#22c55e",
          dependencies: ["dev-frontend", "dev-backend"],
          group: "Development",
        },
        {
          id: "test-unit",
          label: "Unit Testing",
          start: "2025-04-07",
          end: "2025-04-18",
          progress: 30,
          color: "#f59e0b",
          dependencies: ["dev-backend"],
          group: "Testing",
        },
        {
          id: "test-e2e",
          label: "E2E Testing",
          start: "2025-04-19",
          end: "2025-04-30",
          progress: 0,
          color: "#f59e0b",
          dependencies: ["dev-integration"],
          group: "Testing",
        },
        {
          id: "deploy-staging",
          label: "Deploy to Staging",
          start: "2025-05-01",
          end: "2025-05-05",
          progress: 0,
          color: "#8b5cf6",
          dependencies: ["test-e2e"],
          group: "Deployment",
        },
        {
          id: "deploy-prod",
          label: "Production Release",
          start: "2025-05-06",
          end: "2025-05-09",
          progress: 0,
          color: "#8b5cf6",
          dependencies: ["deploy-staging"],
          group: "Deployment",
        },
      ],
    } satisfies GanttContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: SprintTimeline                                            */
/* ------------------------------------------------------------------ */

export const SprintTimeline: Story = {
  args: {
    data: {
      type: "gantt",
      version: "1.0",
      title: "Sprint 12 Timeline",
      startDate: "2025-03-03",
      endDate: "2025-03-14",
      tasks: [
        {
          id: "story-1",
          label: "User Authentication",
          start: "2025-03-03",
          end: "2025-03-05",
          color: "#3b82f6",
        },
        {
          id: "story-2",
          label: "Dashboard Layout",
          start: "2025-03-03",
          end: "2025-03-06",
          color: "#22c55e",
        },
        {
          id: "story-3",
          label: "API Endpoints",
          start: "2025-03-05",
          end: "2025-03-07",
          color: "#f59e0b",
          dependencies: ["story-1"],
        },
        {
          id: "story-4",
          label: "Data Visualization",
          start: "2025-03-06",
          end: "2025-03-10",
          color: "#8b5cf6",
          dependencies: ["story-2"],
        },
        {
          id: "story-5",
          label: "Search Feature",
          start: "2025-03-07",
          end: "2025-03-11",
          color: "#ec4899",
          dependencies: ["story-3"],
        },
        {
          id: "story-6",
          label: "Notifications",
          start: "2025-03-10",
          end: "2025-03-12",
          color: "#06b6d4",
          dependencies: ["story-4"],
        },
        {
          id: "story-7",
          label: "Code Review & QA",
          start: "2025-03-12",
          end: "2025-03-14",
          color: "#ef4444",
          dependencies: ["story-5", "story-6"],
        },
      ],
    } satisfies GanttContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: WithProgress                                              */
/* ------------------------------------------------------------------ */

export const WithProgress: Story = {
  args: {
    data: {
      type: "gantt",
      version: "1.0",
      title: "Task Progress Overview",
      tasks: [
        {
          id: "research",
          label: "Market Research",
          start: "2025-02-01",
          end: "2025-02-14",
          progress: 100,
          color: "#22c55e",
          group: "Planning",
        },
        {
          id: "requirements",
          label: "Requirements",
          start: "2025-02-10",
          end: "2025-02-21",
          progress: 85,
          color: "#22c55e",
          dependencies: ["research"],
          group: "Planning",
        },
        {
          id: "prototype",
          label: "Prototype",
          start: "2025-02-17",
          end: "2025-03-07",
          progress: 60,
          color: "#3b82f6",
          dependencies: ["requirements"],
          group: "Execution",
        },
        {
          id: "implementation",
          label: "Implementation",
          start: "2025-03-03",
          end: "2025-03-28",
          progress: 25,
          color: "#3b82f6",
          dependencies: ["prototype"],
          group: "Execution",
        },
        {
          id: "testing",
          label: "QA Testing",
          start: "2025-03-24",
          end: "2025-04-04",
          progress: 0,
          color: "#f59e0b",
          dependencies: ["implementation"],
          group: "Validation",
        },
        {
          id: "review",
          label: "Stakeholder Review",
          start: "2025-04-07",
          end: "2025-04-11",
          progress: 0,
          color: "#8b5cf6",
          dependencies: ["testing"],
          group: "Validation",
        },
      ],
    } satisfies GanttContent,
  },
};
