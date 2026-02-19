import type { Meta, StoryObj } from "@storybook/react";
import { PollRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { PollContent } from "./schema";

const meta = {
  title: "Views/Poll",
  component: PollRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof PollRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1 -- Quick Poll                                             */
/* ------------------------------------------------------------------ */

export const QuickPoll: Story = {
  args: {
    data: {
      type: "poll",
      version: "1.0",
      title: "Developer Survey",
      description: "Help us understand your preferences",
      questions: [
        {
          id: "q1",
          type: "single-choice",
          prompt: "What's your favorite framework?",
          options: [
            { id: "react", label: "React", color: "#61dafb" },
            { id: "vue", label: "Vue", color: "#42b883" },
            { id: "svelte", label: "Svelte", color: "#ff3e00" },
            { id: "angular", label: "Angular", color: "#dd0031" },
          ],
        },
      ],
      voteTool: "submit_vote",
    } satisfies PollContent,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2 -- Survey (multi-question)                                */
/* ------------------------------------------------------------------ */

export const Survey: Story = {
  args: {
    data: {
      type: "poll",
      version: "1.0",
      title: "Conference Feedback",
      description: "We'd love your feedback on today's event",
      settings: {
        multiQuestion: true,
        allowChange: true,
        showResults: "after-vote",
      },
      questions: [
        {
          id: "q1",
          type: "single-choice",
          prompt: "Which track did you attend?",
          options: [
            { id: "frontend", label: "Frontend" },
            { id: "backend", label: "Backend" },
            { id: "devops", label: "DevOps" },
            { id: "ai", label: "AI / ML" },
          ],
        },
        {
          id: "q2",
          type: "multi-choice",
          prompt: "What topics would you like to see next year?",
          maxSelections: 2,
          options: [
            { id: "rust", label: "Rust" },
            { id: "wasm", label: "WebAssembly" },
            { id: "llm", label: "LLM Applications" },
            { id: "edge", label: "Edge Computing" },
            { id: "security", label: "Security" },
          ],
        },
        {
          id: "q3",
          type: "rating",
          prompt: "How would you rate the event overall?",
          options: [
            { id: "1", label: "1 star" },
            { id: "2", label: "2 stars" },
            { id: "3", label: "3 stars" },
            { id: "4", label: "4 stars" },
            { id: "5", label: "5 stars" },
          ],
        },
      ],
      voteTool: "submit_survey",
    } satisfies PollContent,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3 -- Live Results                                           */
/* ------------------------------------------------------------------ */

export const LiveResults: Story = {
  args: {
    data: {
      type: "poll",
      version: "1.0",
      title: "Lunch Poll",
      description: "What should we order for the team?",
      settings: {
        showResults: "live",
      },
      questions: [
        {
          id: "q1",
          type: "single-choice",
          prompt: "Pick your favorite lunch option",
          options: [
            { id: "pizza", label: "Pizza", color: "#e74c3c" },
            { id: "sushi", label: "Sushi", color: "#3498db" },
            { id: "tacos", label: "Tacos", color: "#f39c12" },
            { id: "salad", label: "Salad", color: "#2ecc71" },
          ],
        },
      ],
      voteTool: "submit_lunch_vote",
    } satisfies PollContent,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 4 -- Rating                                                 */
/* ------------------------------------------------------------------ */

export const Rating: Story = {
  args: {
    data: {
      type: "poll",
      version: "1.0",
      title: "Session Rating",
      description: "Let us know how we did",
      questions: [
        {
          id: "q1",
          type: "rating",
          prompt: "How would you rate this session?",
          options: [
            { id: "1", label: "1 star" },
            { id: "2", label: "2 stars" },
            { id: "3", label: "3 stars" },
            { id: "4", label: "4 stars" },
            { id: "5", label: "5 stars" },
          ],
        },
      ],
      voteTool: "submit_rating",
    } satisfies PollContent,
    onCallTool: mockCallTool,
  },
};
