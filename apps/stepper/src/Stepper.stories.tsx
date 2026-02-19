import type { Meta, StoryObj } from "@storybook/react";
import { StepperRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { StepperContent } from "./schema";

const meta = {
  title: "Views/Stepper",
  component: StepperRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof StepperRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HorizontalWizard: Story = {
  args: {
    data: {
      type: "stepper",
      version: "1.0",
      title: "Account Setup Wizard",
      steps: [
        { id: "account", label: "Account", description: "Create your account", status: "completed" },
        { id: "profile", label: "Profile", description: "Set up your profile", status: "completed" },
        { id: "preferences", label: "Preferences", description: "Choose your preferences", status: "active", detail: "Select your notification preferences and default workspace settings before continuing." },
        { id: "integrations", label: "Integrations", description: "Connect services", status: "pending" },
        { id: "review", label: "Review", description: "Confirm and finish", status: "pending" },
      ],
      activeStep: 2,
      orientation: "horizontal",
    } satisfies StepperContent,
  },
};

export const VerticalPipeline: Story = {
  args: {
    data: {
      type: "stepper",
      version: "1.0",
      title: "Deployment Pipeline",
      steps: [
        { id: "build", label: "Build", description: "Compile source code and dependencies", status: "completed", detail: "Build completed in 2m 34s. All 142 modules resolved." },
        { id: "test", label: "Test Suite", description: "Run unit and integration tests", status: "active", detail: "Running 847 tests across 23 suites. 612 passed, 0 failed so far..." },
        { id: "staging", label: "Deploy to Staging", description: "Push to staging environment", status: "error", detail: "Connection to staging server timed out after 30s." },
        { id: "production", label: "Deploy to Production", description: "Push to production environment", status: "pending" },
      ],
      activeStep: 1,
      orientation: "vertical",
    } satisfies StepperContent,
  },
};

export const Interactive: Story = {
  args: {
    data: {
      type: "stepper",
      version: "1.0",
      title: "Order Process",
      steps: [
        { id: "cart", label: "Cart", status: "active", detail: "Review the items in your cart before proceeding to checkout." },
        { id: "shipping", label: "Shipping", status: "pending" },
        { id: "billing", label: "Billing", status: "pending" },
        { id: "payment", label: "Payment", status: "pending" },
        { id: "review", label: "Review", status: "pending" },
        { id: "confirm", label: "Confirm", status: "pending" },
      ],
      activeStep: 0,
      orientation: "horizontal",
      allowNavigation: true,
      stepTool: "navigate_step",
    } satisfies StepperContent,
    onCallTool: mockCallTool,
  },
};
