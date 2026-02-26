import type { Meta, StoryObj } from "@storybook/react";
import { DataTableRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { DataTableContent } from "./schema";

const meta = {
  title: "Views/DataTable",
  component: DataTableRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof DataTableRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const columns: DataTableContent["columns"] = [
  { key: "name", label: "Name", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "badge",
    badgeColors: {
      Active: "#22c55e",
      Inactive: "#ef4444",
      Pending: "#f59e0b",
    },
  },
  { key: "score", label: "Score", type: "number", align: "right" },
  { key: "active", label: "Active", type: "boolean", align: "center" },
];

const defaultRows: DataTableContent["rows"] = [
  { id: "1", name: "Alice Johnson", status: "Active", score: 92, active: true },
  { id: "2", name: "Bob Smith", status: "Inactive", score: 67, active: false },
  { id: "3", name: "Carol White", status: "Pending", score: 85, active: true },
  { id: "4", name: "David Brown", status: "Active", score: 74, active: true },
  { id: "5", name: "Eve Davis", status: "Inactive", score: 58, active: false },
];

const defaultActions: DataTableContent["actions"] = [
  {
    label: "Edit",
    tool: "edit_user",
    arguments: { id: "{{id}}", name: "{{name}}" },
  },
  {
    label: "Delete",
    tool: "delete_user",
    arguments: { id: "{{id}}" },
    confirm: "Are you sure you want to delete this user?",
  },
];

export const Default: Story = {
  args: {
    data: {
      type: "datatable",
      version: "1.0",
      title: "Users",
      columns,
      rows: defaultRows,
      sortable: true,
      filterable: true,
      exportable: true,
      actions: defaultActions,
    },
    onCallTool: mockCallTool,
  },
};

export const Empty: Story = {
  args: {
    data: {
      type: "datatable",
      version: "1.0",
      title: "Users",
      columns,
      rows: [],
      sortable: true,
      filterable: true,
      exportable: true,
    },
    onCallTool: mockCallTool,
  },
};

const manyRows: DataTableContent["rows"] = Array.from({ length: 20 }, (_, i) => {
  const statuses = ["Active", "Inactive", "Pending"];
  const firstNames = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack"];
  const lastNames = ["Johnson", "Smith", "White", "Brown", "Davis", "Wilson", "Taylor", "Clark", "Hall", "Lewis"];
  return {
    id: String(i + 1),
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    status: statuses[i % statuses.length],
    score: Math.round(50 + Math.sin(i) * 30 + 20),
    active: i % 3 !== 1,
  };
});

export const ManyRows: Story = {
  args: {
    data: {
      type: "datatable",
      version: "1.0",
      title: "Users",
      columns,
      rows: manyRows,
      sortable: true,
      filterable: true,
      exportable: true,
      actions: defaultActions,
    },
    onCallTool: mockCallTool,
  },
};
