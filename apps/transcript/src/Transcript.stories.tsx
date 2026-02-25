import type { Meta, StoryObj } from "@storybook/react";
import { TranscriptRenderer } from "./App";
import type { TranscriptContent } from "./schema";

const meta = {
  title: "Views/Transcript",
  component: TranscriptRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof TranscriptRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: Interview (2 speakers, seconds timestamps)                */
/* ------------------------------------------------------------------ */

export const Interview: Story = {
  args: {
    data: {
      type: "transcript",
      version: "1.0",
      title: "Software Engineer Interview",
      description: "Technical interview conducted on 2025-12-10.",
      showTimestamps: true,
      searchable: true,
      speakers: [
        { id: "interviewer", name: "Sarah Chen", color: "#3b82f6", role: "Interviewer" },
        { id: "candidate", name: "Alex Rivera", color: "#22c55e", role: "Candidate" },
      ],
      entries: [
        {
          id: "e1",
          speaker: "interviewer",
          text: "Thanks for coming in today, Alex. Let's start with a brief introduction. Can you tell me about your background?",
          timestamp: "0",
          duration: 12,
        },
        {
          id: "e2",
          speaker: "candidate",
          text: "Of course! I've been working as a full-stack developer for about five years now, primarily with TypeScript and React on the frontend, and Node.js and Python on the backend.",
          timestamp: "15",
          duration: 18,
        },
        {
          id: "e3",
          speaker: "interviewer",
          text: "Great. Let's dive into a technical question. Can you explain how you'd design a real-time notification system?",
          timestamp: "45",
          duration: 10,
        },
        {
          id: "e4",
          speaker: "candidate",
          text: "I'd use WebSockets for the real-time connection, with a message broker like Redis Pub/Sub behind the scenes. Each user maintains a persistent connection, and when a notification is generated, it gets published to the relevant channel.",
          timestamp: "90",
          duration: 25,
        },
        {
          id: "e5",
          speaker: "interviewer",
          text: "How would you handle users who are offline when a notification is sent?",
          timestamp: "120",
          duration: 8,
        },
        {
          id: "e6",
          speaker: "candidate",
          text: "I'd persist all notifications to a database regardless of delivery status. When a user reconnects, the client fetches any unread notifications via a REST endpoint. You could also integrate push notifications for mobile through Firebase Cloud Messaging.",
          timestamp: "180",
          duration: 30,
        },
      ],
    } satisfies TranscriptContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: MeetingNotes (3 speakers, ISO timestamps, no search)      */
/* ------------------------------------------------------------------ */

export const MeetingNotes: Story = {
  args: {
    data: {
      type: "transcript",
      version: "1.0",
      title: "Sprint Planning Meeting",
      description: "Weekly sprint planning session for the Platform team.",
      showTimestamps: true,
      searchable: false,
      speakers: [
        { id: "pm", name: "Jordan Lee", color: "#f59e0b", role: "Product Manager" },
        { id: "eng", name: "Priya Patel", color: "#8b5cf6", role: "Tech Lead" },
        { id: "design", name: "Marcus Webb", color: "#ef4444", role: "Designer" },
      ],
      entries: [
        {
          id: "m1",
          speaker: "pm",
          text: "Good morning everyone. Let's review the backlog and decide what we're pulling into this sprint. Our main priority is the dashboard redesign.",
          timestamp: "2025-12-10T09:00:00Z",
        },
        {
          id: "m2",
          speaker: "design",
          text: "I've finalized the mockups for the new dashboard layout. The main change is a configurable widget grid that lets users drag and drop components.",
          timestamp: "2025-12-10T09:03:30Z",
        },
        {
          id: "m3",
          speaker: "eng",
          text: "That looks feasible. I'd estimate about 8 story points for the grid system itself, plus another 5 for the widget API. We should also budget 3 points for writing integration tests.",
          timestamp: "2025-12-10T09:07:15Z",
        },
        {
          id: "m4",
          speaker: "pm",
          text: "That fits within our velocity. Let's commit to the grid system and widget API this sprint, and push the advanced filtering to next sprint. I'll update the board after this call.",
          timestamp: "2025-12-10T09:12:00Z",
        },
      ],
    } satisfies TranscriptContent,
  },
};
