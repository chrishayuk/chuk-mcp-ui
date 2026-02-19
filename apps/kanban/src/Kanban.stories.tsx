import type { Meta, StoryObj } from "@storybook/react";
import { KanbanRenderer } from "./App";
import type { KanbanContent } from "./schema";

const meta = {
  title: "Views/Kanban",
  component: KanbanRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "700px" }}><Story /></div>],
} satisfies Meta<typeof KanbanRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectBoard: Story = {
  args: {
    data: {
      type: "kanban",
      version: "1.0",
      title: "Sprint 24 Board",
      moveTool: "move_card",
      columns: [
        {
          id: "todo",
          label: "To Do",
          color: "#6366f1",
          cards: [
            {
              id: "card-1",
              title: "Design new onboarding flow",
              description: "Create wireframes and high-fidelity mockups for the redesigned user onboarding experience.",
              assignee: "Sarah Chen",
              priority: "high",
              labels: [
                { text: "Design", color: "#8b5cf6" },
                { text: "UX", color: "#06b6d4" },
              ],
            },
            {
              id: "card-2",
              title: "Update API rate limiting",
              description: "Implement sliding window rate limiter for public API endpoints.",
              assignee: "Marcus Johnson",
              priority: "medium",
              labels: [{ text: "Backend", color: "#f59e0b" }],
            },
            {
              id: "card-3",
              title: "Write migration guide",
              description: "Document breaking changes and migration steps for v3 upgrade.",
              priority: "low",
              labels: [{ text: "Docs", color: "#10b981" }],
            },
          ],
        },
        {
          id: "in-progress",
          label: "In Progress",
          color: "#f59e0b",
          limit: 3,
          cards: [
            {
              id: "card-4",
              title: "Implement OAuth2 PKCE flow",
              description: "Add PKCE support to the authentication module for SPA clients.",
              assignee: "Alex Rivera",
              priority: "critical",
              labels: [
                { text: "Security", color: "#ef4444" },
                { text: "Backend", color: "#f59e0b" },
              ],
            },
            {
              id: "card-5",
              title: "Fix dashboard chart rendering",
              description: "Charts fail to render when dataset exceeds 10k points.",
              assignee: "Priya Patel",
              priority: "high",
              labels: [{ text: "Bug", color: "#ef4444" }],
            },
          ],
        },
        {
          id: "review",
          label: "In Review",
          color: "#8b5cf6",
          limit: 2,
          cards: [
            {
              id: "card-6",
              title: "Add CSV export to reports",
              description: "Users can now export any report as CSV with custom column selection.",
              assignee: "Jordan Lee",
              priority: "medium",
              labels: [
                { text: "Feature", color: "#3b82f6" },
                { text: "Frontend", color: "#06b6d4" },
              ],
              metadata: { pr: "#1247", reviewer: "Sarah Chen" },
            },
          ],
        },
        {
          id: "done",
          label: "Done",
          color: "#10b981",
          cards: [
            {
              id: "card-7",
              title: "Upgrade to Node 22",
              assignee: "Marcus Johnson",
              priority: "low",
              labels: [{ text: "Infra", color: "#64748b" }],
            },
            {
              id: "card-8",
              title: "Fix email template rendering",
              description: "Resolved UTF-8 encoding issue in transactional emails.",
              assignee: "Priya Patel",
              priority: "medium",
              labels: [{ text: "Bug", color: "#ef4444" }],
            },
          ],
        },
      ],
    } satisfies KanbanContent,
  },
};

export const WithWipLimits: Story = {
  args: {
    data: {
      type: "kanban",
      version: "1.0",
      title: "WIP Limits Demo",
      columns: [
        {
          id: "backlog",
          label: "Backlog",
          color: "#94a3b8",
          cards: [
            { id: "w-1", title: "Research competitor features" },
            { id: "w-2", title: "Plan Q2 roadmap" },
            { id: "w-3", title: "Audit accessibility compliance" },
          ],
        },
        {
          id: "doing",
          label: "Doing",
          color: "#f59e0b",
          limit: 2,
          cards: [
            {
              id: "w-4",
              title: "Build search autocomplete",
              assignee: "Alice Nguyen",
              priority: "high",
            },
            {
              id: "w-5",
              title: "Optimize image pipeline",
              assignee: "Bob Smith",
              priority: "medium",
            },
            {
              id: "w-6",
              title: "Update logging format",
              assignee: "Carol Davis",
              priority: "low",
            },
          ],
        },
        {
          id: "testing",
          label: "Testing",
          color: "#8b5cf6",
          limit: 3,
          cards: [
            {
              id: "w-7",
              title: "Payment retry logic",
              assignee: "Dave Kim",
              priority: "critical",
            },
          ],
        },
        {
          id: "complete",
          label: "Complete",
          color: "#10b981",
          cards: [
            { id: "w-8", title: "Set up CI pipeline" },
            { id: "w-9", title: "Configure staging env" },
          ],
        },
      ],
    } satisfies KanbanContent,
  },
};

export const MinimalBoard: Story = {
  args: {
    data: {
      type: "kanban",
      version: "1.0",
      columns: [
        {
          id: "open",
          label: "Open",
          color: "#3b82f6",
          cards: [
            { id: "m-1", title: "First task" },
            { id: "m-2", title: "Second task" },
          ],
        },
        {
          id: "closed",
          label: "Closed",
          color: "#10b981",
          cards: [
            { id: "m-3", title: "Completed task" },
          ],
        },
      ],
    } satisfies KanbanContent,
  },
};

export const PriorityBoard: Story = {
  args: {
    data: {
      type: "kanban",
      version: "1.0",
      title: "Priority & Labels Board",
      columns: [
        {
          id: "priorities",
          label: "All Priorities",
          color: "#6366f1",
          cards: [
            {
              id: "p-1",
              title: "Critical security patch",
              description: "Fix CVE-2024-1234 vulnerability in authentication module. Requires immediate attention.",
              priority: "critical",
              assignee: "Security Team",
              labels: [
                { text: "Security", color: "#ef4444" },
                { text: "Urgent", color: "#dc2626" },
              ],
            },
            {
              id: "p-2",
              title: "Performance regression in search",
              description: "Search latency increased by 200ms after last deployment.",
              priority: "high",
              assignee: "Emma Wilson",
              labels: [
                { text: "Performance", color: "#f97316" },
                { text: "Backend", color: "#f59e0b" },
              ],
            },
            {
              id: "p-3",
              title: "Add dark mode toggle",
              description: "Implement theme switcher in the settings panel.",
              priority: "medium",
              assignee: "Li Wei",
              labels: [
                { text: "UI", color: "#8b5cf6" },
                { text: "Enhancement", color: "#3b82f6" },
              ],
            },
            {
              id: "p-4",
              title: "Update copyright year in footer",
              priority: "low",
              labels: [{ text: "Chore", color: "#64748b" }],
            },
          ],
        },
        {
          id: "labeled",
          label: "Multi-Label Cards",
          color: "#ec4899",
          cards: [
            {
              id: "p-5",
              title: "Cross-platform notification system",
              description: "Unified push notification service for web, iOS, and Android.",
              priority: "high",
              assignee: "Platform Team",
              labels: [
                { text: "Feature", color: "#3b82f6" },
                { text: "Mobile", color: "#10b981" },
                { text: "Web", color: "#06b6d4" },
                { text: "Backend", color: "#f59e0b" },
              ],
              metadata: {
                estimate: "13 points",
                epic: "Notifications Overhaul",
              },
            },
            {
              id: "p-6",
              title: "Data export compliance",
              description: "Ensure GDPR-compliant data export for all user data types.",
              priority: "critical",
              assignee: "Legal Eng Team",
              labels: [
                { text: "Compliance", color: "#7c3aed" },
                { text: "GDPR", color: "#059669" },
                { text: "Data", color: "#0891b2" },
              ],
            },
          ],
        },
        {
          id: "with-images",
          label: "With Images",
          color: "#0ea5e9",
          cards: [
            {
              id: "p-7",
              title: "Redesign landing page hero",
              description: "New hero section with animated background and updated copy.",
              priority: "medium",
              assignee: "Design Team",
              image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='288' height='128' fill='%230ea5e9'%3E%3Crect width='288' height='128' rx='0' opacity='0.15'/%3E%3Ctext x='144' y='70' text-anchor='middle' fill='%230ea5e9' font-size='14' font-family='sans-serif'%3EHero Mockup%3C/text%3E%3C/svg%3E",
              labels: [
                { text: "Design", color: "#8b5cf6" },
                { text: "Marketing", color: "#ec4899" },
              ],
            },
            {
              id: "p-8",
              title: "Product photography update",
              description: "New product shots for the updated catalog.",
              priority: "low",
              assignee: "Content Team",
              image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='288' height='128' fill='%2310b981'%3E%3Crect width='288' height='128' rx='0' opacity='0.15'/%3E%3Ctext x='144' y='70' text-anchor='middle' fill='%2310b981' font-size='14' font-family='sans-serif'%3EProduct Photo%3C/text%3E%3C/svg%3E",
              labels: [{ text: "Content", color: "#f59e0b" }],
            },
          ],
        },
      ],
    } satisfies KanbanContent,
  },
};
