import type { Meta, StoryObj } from "@storybook/react";
import { FlowchartRenderer } from "./App";
import type { FlowchartContent } from "./schema";

const meta = {
  title: "Views/Flowchart",
  component: FlowchartRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof FlowchartRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginFlow: Story = {
  args: {
    data: {
      type: "flowchart",
      version: "1.0",
      title: "User Login Flow",
      direction: "TB",
      nodes: [
        { id: "start", label: "Start", shape: "ellipse", color: "#22c55e" },
        { id: "input", label: "Enter Credentials", shape: "parallelogram", color: "#8b5cf6" },
        { id: "checkUser", label: "Username Valid?", shape: "diamond", color: "#f59e0b" },
        { id: "checkPass", label: "Password Valid?", shape: "diamond", color: "#f59e0b" },
        { id: "error", label: "Show Error", shape: "rect", color: "#ef4444" },
        { id: "dashboard", label: "Load Dashboard", shape: "rect", color: "#3b82f6" },
        { id: "end", label: "End", shape: "ellipse", color: "#22c55e" },
      ],
      edges: [
        { source: "start", target: "input", label: "begin" },
        { source: "input", target: "checkUser" },
        { source: "checkUser", target: "checkPass", label: "yes" },
        { source: "checkUser", target: "error", label: "no", style: "dashed" },
        { source: "checkPass", target: "dashboard", label: "yes" },
        { source: "checkPass", target: "error", label: "no", style: "dashed" },
        { source: "dashboard", target: "end" },
        { source: "error", target: "input", label: "retry" },
      ],
    } satisfies FlowchartContent,
  },
};

export const DataPipeline: Story = {
  args: {
    data: {
      type: "flowchart",
      version: "1.0",
      title: "Data Processing Pipeline",
      direction: "LR",
      nodes: [
        { id: "ingest", label: "Ingest Data", shape: "parallelogram", color: "#8b5cf6" },
        { id: "validate", label: "Validate", shape: "diamond", color: "#f59e0b" },
        { id: "transform", label: "Transform", shape: "rect", color: "#3b82f6" },
        { id: "load", label: "Load to DB", shape: "rect", color: "#3b82f6" },
        { id: "report", label: "Generate Report", shape: "rect", color: "#22c55e" },
      ],
      edges: [
        { source: "ingest", target: "validate" },
        { source: "validate", target: "transform", label: "valid" },
        { source: "transform", target: "load" },
        { source: "load", target: "report" },
      ],
    } satisfies FlowchartContent,
  },
};

export const ApprovalProcess: Story = {
  args: {
    data: {
      type: "flowchart",
      version: "1.0",
      title: "Document Approval Process",
      direction: "TB",
      nodes: [
        { id: "submit", label: "Submit Document", shape: "ellipse", color: "#22c55e" },
        { id: "review1", label: "Manager Review", shape: "rect", color: "#3b82f6" },
        { id: "approved1", label: "Approved?", shape: "diamond", color: "#f59e0b" },
        { id: "review2", label: "Director Review", shape: "rect", color: "#3b82f6" },
        { id: "approved2", label: "Approved?", shape: "diamond", color: "#f59e0b" },
        { id: "rejected", label: "Rejected", shape: "rect", color: "#ef4444" },
        { id: "published", label: "Published", shape: "ellipse", color: "#22c55e" },
      ],
      edges: [
        { source: "submit", target: "review1" },
        { source: "review1", target: "approved1" },
        { source: "approved1", target: "review2", label: "yes" },
        { source: "approved1", target: "rejected", label: "no", style: "dashed" },
        { source: "review2", target: "approved2" },
        { source: "approved2", target: "published", label: "yes" },
        { source: "approved2", target: "rejected", label: "no", style: "dashed" },
      ],
    } satisfies FlowchartContent,
  },
};
