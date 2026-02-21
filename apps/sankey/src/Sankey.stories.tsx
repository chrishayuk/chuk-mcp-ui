import type { Meta, StoryObj } from "@storybook/react";
import { SankeyRenderer } from "./App";
import type { SankeyContent } from "./schema";

const meta = {
  title: "Views/Sankey",
  component: SankeyRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof SankeyRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: EnergyFlow                                                */
/* ------------------------------------------------------------------ */

export const EnergyFlow: Story = {
  args: {
    data: {
      type: "sankey",
      version: "1.0",
      title: "Energy Flow",
      nodes: [
        { id: "solar", label: "Solar", color: "#f59e0b" },
        { id: "wind", label: "Wind", color: "#06b6d4" },
        { id: "gas", label: "Natural Gas", color: "#ef4444" },
        { id: "electricity", label: "Electricity", color: "#3b82f6" },
        { id: "heat", label: "Heat", color: "#f97316" },
        { id: "residential", label: "Residential", color: "#22c55e" },
        { id: "commercial", label: "Commercial", color: "#8b5cf6" },
        { id: "industrial", label: "Industrial", color: "#6366f1" },
      ],
      links: [
        { source: "solar", target: "electricity", value: 120 },
        { source: "solar", target: "heat", value: 30 },
        { source: "wind", target: "electricity", value: 80 },
        { source: "gas", target: "electricity", value: 150 },
        { source: "gas", target: "heat", value: 100 },
        { source: "electricity", target: "residential", value: 140 },
        { source: "electricity", target: "commercial", value: 120 },
        { source: "electricity", target: "industrial", value: 90 },
        { source: "heat", target: "residential", value: 60 },
        { source: "heat", target: "commercial", value: 40 },
        { source: "heat", target: "industrial", value: 30 },
      ],
    } satisfies SankeyContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: WebsiteTraffic                                            */
/* ------------------------------------------------------------------ */

export const WebsiteTraffic: Story = {
  args: {
    data: {
      type: "sankey",
      version: "1.0",
      title: "Website Traffic Flow",
      nodes: [
        { id: "search", label: "Search", color: "#3b82f6" },
        { id: "social", label: "Social", color: "#ec4899" },
        { id: "direct", label: "Direct", color: "#22c55e" },
        { id: "home", label: "Home Page", color: "#f59e0b" },
        { id: "products", label: "Products", color: "#8b5cf6" },
        { id: "blog", label: "Blog", color: "#06b6d4" },
        { id: "purchase", label: "Purchase", color: "#10b981" },
        { id: "signup", label: "Sign Up", color: "#6366f1" },
        { id: "bounce", label: "Bounce", color: "#ef4444" },
      ],
      links: [
        { source: "search", target: "home", value: 200 },
        { source: "search", target: "products", value: 150 },
        { source: "search", target: "blog", value: 50 },
        { source: "social", target: "home", value: 80 },
        { source: "social", target: "blog", value: 120 },
        { source: "social", target: "products", value: 30 },
        { source: "direct", target: "home", value: 100 },
        { source: "direct", target: "products", value: 60 },
        { source: "home", target: "purchase", value: 80 },
        { source: "home", target: "signup", value: 60 },
        { source: "home", target: "bounce", value: 240 },
        { source: "products", target: "purchase", value: 120 },
        { source: "products", target: "signup", value: 40 },
        { source: "products", target: "bounce", value: 80 },
        { source: "blog", target: "signup", value: 70 },
        { source: "blog", target: "bounce", value: 100 },
      ],
    } satisfies SankeyContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: BudgetAllocation                                          */
/* ------------------------------------------------------------------ */

export const BudgetAllocation: Story = {
  args: {
    data: {
      type: "sankey",
      version: "1.0",
      title: "Budget Allocation",
      nodes: [
        { id: "sales", label: "Sales Revenue", color: "#22c55e" },
        { id: "service", label: "Service Revenue", color: "#3b82f6" },
        { id: "engineering", label: "Engineering", color: "#8b5cf6" },
        { id: "marketing", label: "Marketing", color: "#ec4899" },
        { id: "operations", label: "Operations", color: "#f59e0b" },
        { id: "salaries", label: "Salaries", color: "#ef4444" },
        { id: "tools", label: "Tools & Software", color: "#06b6d4" },
        { id: "travel", label: "Travel", color: "#f97316" },
      ],
      links: [
        { source: "sales", target: "engineering", value: 300 },
        { source: "sales", target: "marketing", value: 200 },
        { source: "sales", target: "operations", value: 100 },
        { source: "service", target: "engineering", value: 150 },
        { source: "service", target: "marketing", value: 50 },
        { source: "service", target: "operations", value: 100 },
        { source: "engineering", target: "salaries", value: 350 },
        { source: "engineering", target: "tools", value: 80 },
        { source: "engineering", target: "travel", value: 20 },
        { source: "marketing", target: "salaries", value: 120 },
        { source: "marketing", target: "tools", value: 100 },
        { source: "marketing", target: "travel", value: 30 },
        { source: "operations", target: "salaries", value: 130 },
        { source: "operations", target: "tools", value: 40 },
        { source: "operations", target: "travel", value: 30 },
      ],
    } satisfies SankeyContent,
  },
};
