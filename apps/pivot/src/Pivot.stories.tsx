import type { Meta, StoryObj } from "@storybook/react";
import { PivotRenderer } from "./App";
import type { PivotContent } from "./schema";

const meta = {
  title: "Views/Pivot",
  component: PivotRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "700px" }}><Story /></div>],
} satisfies Meta<typeof PivotRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  SalesReport: Region x Quarter with sum revenue                    */
/* ------------------------------------------------------------------ */

export const SalesReport: Story = {
  args: {
    data: {
      type: "pivot",
      version: "1.0",
      title: "Revenue by Region and Quarter",
      data: [
        { region: "North", quarter: "Q1", revenue: 12000, deals: 5 },
        { region: "North", quarter: "Q2", revenue: 15000, deals: 7 },
        { region: "North", quarter: "Q3", revenue: 18000, deals: 9 },
        { region: "North", quarter: "Q4", revenue: 20000, deals: 11 },
        { region: "South", quarter: "Q1", revenue: 9000, deals: 4 },
        { region: "South", quarter: "Q2", revenue: 11000, deals: 6 },
        { region: "South", quarter: "Q3", revenue: 9500, deals: 3 },
        { region: "South", quarter: "Q4", revenue: 13000, deals: 8 },
        { region: "East", quarter: "Q1", revenue: 20000, deals: 10 },
        { region: "East", quarter: "Q2", revenue: 22000, deals: 12 },
        { region: "East", quarter: "Q3", revenue: 25000, deals: 14 },
        { region: "East", quarter: "Q4", revenue: 28000, deals: 16 },
        { region: "West", quarter: "Q1", revenue: 7500, deals: 3 },
        { region: "West", quarter: "Q2", revenue: 8000, deals: 4 },
        { region: "West", quarter: "Q3", revenue: 11000, deals: 6 },
        { region: "West", quarter: "Q4", revenue: 9500, deals: 5 },
      ],
      rows: ["region"],
      columns: ["quarter"],
      values: [
        { field: "revenue", aggregate: "sum", label: "Revenue", format: "currency" },
      ],
      sortable: true,
      showTotals: true,
    } satisfies PivotContent,
  },
};

/* ------------------------------------------------------------------ */
/*  EmployeeMetrics: Department x Role with count and avg salary      */
/* ------------------------------------------------------------------ */

export const EmployeeMetrics: Story = {
  args: {
    data: {
      type: "pivot",
      version: "1.0",
      title: "Employee Metrics by Department and Role",
      data: [
        { department: "Engineering", role: "Senior", salary: 150000 },
        { department: "Engineering", role: "Senior", salary: 145000 },
        { department: "Engineering", role: "Junior", salary: 85000 },
        { department: "Engineering", role: "Junior", salary: 80000 },
        { department: "Engineering", role: "Junior", salary: 90000 },
        { department: "Marketing", role: "Senior", salary: 120000 },
        { department: "Marketing", role: "Junior", salary: 65000 },
        { department: "Marketing", role: "Junior", salary: 70000 },
        { department: "Sales", role: "Senior", salary: 130000 },
        { department: "Sales", role: "Senior", salary: 125000 },
        { department: "Sales", role: "Senior", salary: 135000 },
        { department: "Sales", role: "Junior", salary: 60000 },
        { department: "Sales", role: "Junior", salary: 62000 },
      ],
      rows: ["department"],
      columns: ["role"],
      values: [
        { field: "salary", aggregate: "count", label: "Headcount" },
        { field: "salary", aggregate: "avg", label: "Avg Salary", format: "currency" },
      ],
      sortable: true,
      showTotals: true,
    } satisfies PivotContent,
  },
};

/* ------------------------------------------------------------------ */
/*  MinimalPivot: Simple 2x2 pivot                                    */
/* ------------------------------------------------------------------ */

export const MinimalPivot: Story = {
  args: {
    data: {
      type: "pivot",
      version: "1.0",
      data: [
        { category: "A", group: "X", value: 10 },
        { category: "A", group: "Y", value: 20 },
        { category: "B", group: "X", value: 30 },
        { category: "B", group: "Y", value: 40 },
      ],
      rows: ["category"],
      columns: ["group"],
      values: [
        { field: "value", aggregate: "sum" },
      ],
    } satisfies PivotContent,
  },
};

/* ------------------------------------------------------------------ */
/*  WithTotals: showTotals enabled                                    */
/* ------------------------------------------------------------------ */

export const WithTotals: Story = {
  args: {
    data: {
      type: "pivot",
      version: "1.0",
      title: "Product Sales with Totals",
      data: [
        { product: "Widget", channel: "Online", units: 150, revenue: 4500 },
        { product: "Widget", channel: "Retail", units: 80, revenue: 2800 },
        { product: "Gadget", channel: "Online", units: 200, revenue: 10000 },
        { product: "Gadget", channel: "Retail", units: 120, revenue: 6600 },
        { product: "Gizmo", channel: "Online", units: 50, revenue: 7500 },
        { product: "Gizmo", channel: "Retail", units: 30, revenue: 4800 },
      ],
      rows: ["product"],
      columns: ["channel"],
      values: [
        { field: "units", aggregate: "sum", label: "Units" },
        { field: "revenue", aggregate: "sum", label: "Revenue", format: "currency" },
      ],
      showTotals: true,
    } satisfies PivotContent,
  },
};
