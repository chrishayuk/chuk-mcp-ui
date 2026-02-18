import type { Meta, StoryObj } from "@storybook/react";
import { ProgressRenderer } from "./App";
import type { ProgressContent } from "./schema";

const meta = {
  title: "Views/Progress",
  component: ProgressRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ProgressRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BuildPipeline: Story = {
  args: {
    data: {
      type: "progress",
      version: "1.0",
      title: "Build Pipeline",
      overall: 65,
      tracks: [
        { id: "lint", label: "Lint", value: 100, max: 100, status: "complete", detail: "No issues found" },
        { id: "compile", label: "Compile", value: 100, max: 100, status: "complete", detail: "Done in 2.3s" },
        { id: "test", label: "Test", value: 45, max: 100, status: "active", detail: "Running suite 3 of 7..." },
        { id: "deploy", label: "Deploy", value: 0, max: 100, status: "pending" },
      ],
    } satisfies ProgressContent,
  },
};

export const FileUpload: Story = {
  args: {
    data: {
      type: "progress",
      version: "1.0",
      title: "File Upload",
      tracks: [
        { id: "f1", label: "report.pdf", value: 100, max: 100, status: "complete", detail: "2.3 MB" },
        { id: "f2", label: "data.csv", value: 75, max: 100, status: "active", detail: "5.1 MB — 3.8 MB uploaded" },
        { id: "f3", label: "image.png", value: 0, max: 100, status: "pending", detail: "1.2 MB" },
      ],
    } satisfies ProgressContent,
  },
};

export const WithError: Story = {
  args: {
    data: {
      type: "progress",
      version: "1.0",
      title: "Migration",
      overall: 40,
      tracks: [
        { id: "schema", label: "Schema Migration", value: 100, max: 100, status: "complete" },
        { id: "data", label: "Data Migration", value: 60, max: 100, status: "error", detail: "Foreign key constraint failed on row 1523" },
        { id: "index", label: "Index Rebuild", value: 0, max: 100, status: "pending" },
      ],
    } satisfies ProgressContent,
  },
};
