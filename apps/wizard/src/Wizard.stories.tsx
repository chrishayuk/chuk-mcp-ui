import type { Meta, StoryObj } from "@storybook/react";
import { WizardRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { WizardContent } from "./schema";

const meta = {
  title: "Views/Wizard",
  component: WizardRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof WizardRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: Default (3 steps with conditional)                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    data: {
      type: "wizard",
      version: "1.0",
      title: "User Registration",
      description: "Complete the following steps to set up your account.",
      submitTool: "complete_wizard",
      submitLabel: "Finish",
      allowNavigation: true,
      steps: [
        {
          id: "personal",
          title: "Personal Info",
          description: "Tell us about yourself.",
          fields: {
            name: {
              type: "string",
              title: "Full Name",
              placeholder: "Jane Doe",
            },
            email: {
              type: "string",
              title: "Email Address",
              placeholder: "jane@example.com",
              pattern: "^[^@]+@[^@]+\\.[^@]+$",
              help: "We'll never share your email with anyone.",
            },
          },
          required: ["name", "email"],
        },
        {
          id: "preferences",
          title: "Preferences",
          description: "Choose your preferred settings.",
          fields: {
            theme: {
              type: "string",
              title: "Theme",
              widget: "radio",
              enum: ["light", "dark"],
              enumLabels: ["Light", "Dark"],
              default: "light",
            },
          },
          required: ["theme"],
        },
        {
          id: "review",
          title: "Review",
          description: "This step only appears if you chose the dark theme. Leave any additional comments.",
          fields: {
            comments: {
              type: "string",
              title: "Comments",
              widget: "textarea",
              placeholder: "Any additional feedback...",
              maxLength: 500,
            },
          },
          condition: {
            field: "theme",
            op: "eq",
            value: "dark",
          },
        },
      ],
    } satisfies WizardContent,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: SimpleLinear (2 steps, no conditions)                     */
/* ------------------------------------------------------------------ */

export const SimpleLinear: Story = {
  args: {
    data: {
      type: "wizard",
      version: "1.0",
      title: "Quick Feedback",
      description: "A simple two-step form with no conditional logic.",
      submitTool: "submit_feedback",
      steps: [
        {
          id: "contact",
          title: "Contact Details",
          description: "How can we reach you?",
          fields: {
            firstName: {
              type: "string",
              title: "First Name",
              placeholder: "John",
            },
            lastName: {
              type: "string",
              title: "Last Name",
              placeholder: "Smith",
            },
          },
          required: ["firstName"],
        },
        {
          id: "message",
          title: "Your Message",
          description: "What would you like to tell us?",
          fields: {
            subject: {
              type: "string",
              title: "Subject",
              placeholder: "e.g. Feature request",
            },
            body: {
              type: "string",
              title: "Message",
              widget: "textarea",
              placeholder: "Type your message here...",
              minLength: 10,
            },
          },
          required: ["subject", "body"],
        },
      ],
    } satisfies WizardContent,
    onCallTool: mockCallTool,
  },
};
