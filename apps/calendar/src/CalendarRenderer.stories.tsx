import type { Meta, StoryObj } from "@storybook/react";
import { CalendarRenderer } from "./App";
import type { CalendarContent } from "./schema";

const meta = {
  title: "Views/Calendar",
  component: CalendarRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "700px" }}><Story /></div>],
} satisfies Meta<typeof CalendarRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: TeamCalendar                                              */
/* ------------------------------------------------------------------ */

export const TeamCalendar: Story = {
  args: {
    data: {
      type: "calendar",
      version: "1.0",
      title: "Engineering Team Calendar",
      defaultDate: "2025-03-01",
      defaultView: "month",
      events: [
        {
          id: "sp1",
          title: "Sprint Planning",
          start: "2025-03-03T10:00:00",
          end: "2025-03-03T11:30:00",
          color: "#3b82f6",
          description: "Bi-weekly sprint planning for Sprint 24",
        },
        {
          id: "standup-m",
          title: "Daily Standup",
          start: "2025-03-03T09:15:00",
          end: "2025-03-03T09:30:00",
          color: "#22c55e",
        },
        {
          id: "standup-t",
          title: "Daily Standup",
          start: "2025-03-04T09:15:00",
          end: "2025-03-04T09:30:00",
          color: "#22c55e",
        },
        {
          id: "standup-w",
          title: "Daily Standup",
          start: "2025-03-05T09:15:00",
          end: "2025-03-05T09:30:00",
          color: "#22c55e",
        },
        {
          id: "standup-th",
          title: "Daily Standup",
          start: "2025-03-06T09:15:00",
          end: "2025-03-06T09:30:00",
          color: "#22c55e",
        },
        {
          id: "standup-f",
          title: "Daily Standup",
          start: "2025-03-07T09:15:00",
          end: "2025-03-07T09:30:00",
          color: "#22c55e",
        },
        {
          id: "retro",
          title: "Sprint Retro",
          start: "2025-03-14T15:00:00",
          end: "2025-03-14T16:00:00",
          color: "#f59e0b",
          description: "Sprint 23 retrospective",
        },
        {
          id: "deadline",
          title: "Q1 Feature Freeze",
          start: "2025-03-21",
          allDay: true,
          color: "#ef4444",
          description: "No new features after this date for Q1 release",
        },
        {
          id: "holiday",
          title: "Company Holiday",
          start: "2025-03-28",
          allDay: true,
          color: "#8b5cf6",
          description: "Spring company day off",
        },
        {
          id: "review",
          title: "Code Review Session",
          start: "2025-03-12T14:00:00",
          end: "2025-03-12T15:30:00",
          color: "#14b8a6",
          description: "Architecture review for new auth module",
        },
        {
          id: "lunch",
          title: "Team Lunch",
          start: "2025-03-19T12:00:00",
          end: "2025-03-19T13:00:00",
          color: "#ec4899",
        },
        {
          id: "demo",
          title: "Sprint Demo",
          start: "2025-03-14T14:00:00",
          end: "2025-03-14T15:00:00",
          color: "#f97316",
          description: "Sprint 23 demo to stakeholders",
        },
      ],
    } satisfies CalendarContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: ProjectMilestones                                         */
/* ------------------------------------------------------------------ */

export const ProjectMilestones: Story = {
  args: {
    data: {
      type: "calendar",
      version: "1.0",
      title: "Project Milestones",
      defaultDate: "2025-04-01",
      events: [
        {
          id: "m1",
          title: "Design Review",
          start: "2025-03-15",
          allDay: true,
          color: "#8b5cf6",
          description: "Final design review with stakeholders",
        },
        {
          id: "m2",
          title: "Alpha Release",
          start: "2025-04-01",
          allDay: true,
          color: "#3b82f6",
          description: "Internal alpha release for testing",
        },
        {
          id: "m3",
          title: "Beta Release",
          start: "2025-04-15",
          allDay: true,
          color: "#f59e0b",
          description: "Beta release to select customers",
        },
        {
          id: "m4",
          title: "Security Audit",
          start: "2025-04-22",
          allDay: true,
          color: "#ef4444",
          description: "Third-party security audit begins",
        },
        {
          id: "m5",
          title: "GA Release",
          start: "2025-05-01",
          allDay: true,
          color: "#22c55e",
          description: "General availability release",
        },
        {
          id: "m6",
          title: "Post-launch Review",
          start: "2025-05-15",
          allDay: true,
          color: "#14b8a6",
          description: "Post-launch metrics review",
        },
      ],
    } satisfies CalendarContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: AgendaView                                                */
/* ------------------------------------------------------------------ */

export const AgendaView: Story = {
  args: {
    data: {
      type: "calendar",
      version: "1.0",
      title: "March Agenda",
      defaultDate: "2025-03-01",
      defaultView: "agenda",
      events: [
        {
          id: "sp1",
          title: "Sprint Planning",
          start: "2025-03-03T10:00:00",
          end: "2025-03-03T11:30:00",
          color: "#3b82f6",
          description: "Bi-weekly sprint planning for Sprint 24",
        },
        {
          id: "standup-m",
          title: "Daily Standup",
          start: "2025-03-03T09:15:00",
          end: "2025-03-03T09:30:00",
          color: "#22c55e",
        },
        {
          id: "review",
          title: "Code Review Session",
          start: "2025-03-12T14:00:00",
          end: "2025-03-12T15:30:00",
          color: "#14b8a6",
          description: "Architecture review for new auth module",
        },
        {
          id: "demo",
          title: "Sprint Demo",
          start: "2025-03-14T14:00:00",
          end: "2025-03-14T15:00:00",
          color: "#f97316",
          description: "Sprint 23 demo to stakeholders",
        },
        {
          id: "retro",
          title: "Sprint Retro",
          start: "2025-03-14T15:00:00",
          end: "2025-03-14T16:00:00",
          color: "#f59e0b",
          description: "Sprint 23 retrospective",
        },
        {
          id: "lunch",
          title: "Team Lunch",
          start: "2025-03-19T12:00:00",
          end: "2025-03-19T13:00:00",
          color: "#ec4899",
        },
        {
          id: "deadline",
          title: "Q1 Feature Freeze",
          start: "2025-03-21",
          allDay: true,
          color: "#ef4444",
          description: "No new features after this date for Q1 release",
        },
        {
          id: "holiday",
          title: "Company Holiday",
          start: "2025-03-28",
          allDay: true,
          color: "#8b5cf6",
          description: "Spring company day off",
        },
      ],
    } satisfies CalendarContent,
  },
};
