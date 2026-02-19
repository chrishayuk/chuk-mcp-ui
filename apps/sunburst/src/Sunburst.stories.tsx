import type { Meta, StoryObj } from "@storybook/react";
import { SunburstRenderer } from "./App";
import type { SunburstContent } from "./schema";

const meta = {
  title: "Views/Sunburst",
  component: SunburstRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof SunburstRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: FileSystem                                                */
/* ------------------------------------------------------------------ */

export const FileSystem: Story = {
  args: {
    data: {
      type: "sunburst",
      version: "1.0",
      title: "Project Directory",
      showLabels: true,
      interactive: true,
      root: {
        id: "root",
        label: "project",
        children: [
          {
            id: "src",
            label: "src",
            color: "#3b82f6",
            children: [
              {
                id: "src-components",
                label: "components",
                children: [
                  { id: "src-components-button", label: "Button.tsx", value: 120 },
                  { id: "src-components-input", label: "Input.tsx", value: 85 },
                  { id: "src-components-modal", label: "Modal.tsx", value: 200 },
                  { id: "src-components-table", label: "Table.tsx", value: 310 },
                ],
              },
              {
                id: "src-utils",
                label: "utils",
                children: [
                  { id: "src-utils-format", label: "format.ts", value: 45 },
                  { id: "src-utils-validate", label: "validate.ts", value: 60 },
                  { id: "src-utils-api", label: "api.ts", value: 150 },
                ],
              },
              {
                id: "src-hooks",
                label: "hooks",
                children: [
                  { id: "src-hooks-useAuth", label: "useAuth.ts", value: 80 },
                  { id: "src-hooks-useQuery", label: "useQuery.ts", value: 95 },
                ],
              },
              { id: "src-app", label: "App.tsx", value: 50 },
              { id: "src-main", label: "main.tsx", value: 15 },
            ],
          },
          {
            id: "public",
            label: "public",
            color: "#22c55e",
            children: [
              { id: "public-index", label: "index.html", value: 30 },
              { id: "public-favicon", label: "favicon.ico", value: 5 },
              { id: "public-assets", label: "assets", value: 250 },
            ],
          },
          {
            id: "config",
            label: "config",
            color: "#f59e0b",
            children: [
              { id: "config-package", label: "package.json", value: 20 },
              { id: "config-tsconfig", label: "tsconfig.json", value: 10 },
              { id: "config-vite", label: "vite.config.ts", value: 15 },
            ],
          },
        ],
      },
    } satisfies SunburstContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: BudgetBreakdown                                           */
/* ------------------------------------------------------------------ */

export const BudgetBreakdown: Story = {
  args: {
    data: {
      type: "sunburst",
      version: "1.0",
      title: "Annual Budget Breakdown",
      showLabels: true,
      interactive: true,
      root: {
        id: "budget",
        label: "Total Budget",
        children: [
          {
            id: "engineering",
            label: "Engineering",
            color: "#3b82f6",
            children: [
              {
                id: "eng-salaries",
                label: "Salaries",
                children: [
                  { id: "eng-sal-senior", label: "Senior Engineers", value: 800000 },
                  { id: "eng-sal-mid", label: "Mid-level", value: 500000 },
                  { id: "eng-sal-junior", label: "Junior Engineers", value: 200000 },
                ],
              },
              { id: "eng-tools", label: "Tools & Licenses", value: 50000 },
              { id: "eng-infra", label: "Infrastructure", value: 120000 },
            ],
          },
          {
            id: "marketing",
            label: "Marketing",
            color: "#ef4444",
            children: [
              { id: "mkt-digital", label: "Digital Ads", value: 300000 },
              { id: "mkt-events", label: "Events", value: 150000 },
              { id: "mkt-content", label: "Content", value: 80000 },
            ],
          },
          {
            id: "operations",
            label: "Operations",
            color: "#22c55e",
            children: [
              { id: "ops-office", label: "Office Space", value: 200000 },
              { id: "ops-supplies", label: "Supplies", value: 30000 },
              { id: "ops-travel", label: "Travel", value: 60000 },
            ],
          },
          {
            id: "hr",
            label: "HR",
            color: "#8b5cf6",
            children: [
              { id: "hr-recruiting", label: "Recruiting", value: 100000 },
              { id: "hr-benefits", label: "Benefits", value: 250000 },
              { id: "hr-training", label: "Training", value: 40000 },
            ],
          },
        ],
      },
    } satisfies SunburstContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: MinimalSunburst                                           */
/* ------------------------------------------------------------------ */

export const MinimalSunburst: Story = {
  args: {
    data: {
      type: "sunburst",
      version: "1.0",
      root: {
        id: "root",
        label: "Root",
        children: [
          {
            id: "a",
            label: "Section A",
            color: "#3b82f6",
            children: [
              { id: "a1", label: "A-1", value: 30 },
              { id: "a2", label: "A-2", value: 20 },
            ],
          },
          {
            id: "b",
            label: "Section B",
            color: "#ef4444",
            children: [
              { id: "b1", label: "B-1", value: 25 },
              { id: "b2", label: "B-2", value: 25 },
            ],
          },
        ],
      },
    } satisfies SunburstContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 4: DeepHierarchy                                             */
/* ------------------------------------------------------------------ */

export const DeepHierarchy: Story = {
  args: {
    data: {
      type: "sunburst",
      version: "1.0",
      title: "Taxonomy",
      showLabels: true,
      interactive: true,
      root: {
        id: "life",
        label: "Life",
        children: [
          {
            id: "animals",
            label: "Animals",
            color: "#3b82f6",
            children: [
              {
                id: "mammals",
                label: "Mammals",
                children: [
                  {
                    id: "primates",
                    label: "Primates",
                    children: [
                      { id: "humans", label: "Humans", value: 8000 },
                      { id: "apes", label: "Great Apes", value: 500 },
                      { id: "monkeys", label: "Monkeys", value: 2000 },
                    ],
                  },
                  {
                    id: "carnivores",
                    label: "Carnivores",
                    children: [
                      { id: "cats", label: "Cats", value: 600 },
                      { id: "dogs", label: "Dogs", value: 900 },
                      { id: "bears", label: "Bears", value: 300 },
                    ],
                  },
                  { id: "rodents", label: "Rodents", value: 4000 },
                ],
              },
              {
                id: "birds",
                label: "Birds",
                children: [
                  { id: "raptors", label: "Raptors", value: 500 },
                  { id: "songbirds", label: "Songbirds", value: 5000 },
                  { id: "waterbirds", label: "Waterbirds", value: 1500 },
                ],
              },
              {
                id: "reptiles",
                label: "Reptiles",
                children: [
                  { id: "lizards", label: "Lizards", value: 6000 },
                  { id: "snakes", label: "Snakes", value: 3500 },
                  { id: "turtles", label: "Turtles", value: 350 },
                ],
              },
            ],
          },
          {
            id: "plants",
            label: "Plants",
            color: "#22c55e",
            children: [
              {
                id: "flowering",
                label: "Flowering",
                children: [
                  { id: "roses", label: "Roses", value: 300 },
                  { id: "orchids", label: "Orchids", value: 25000 },
                  { id: "grasses", label: "Grasses", value: 12000 },
                ],
              },
              {
                id: "conifers",
                label: "Conifers",
                children: [
                  { id: "pines", label: "Pines", value: 120 },
                  { id: "spruces", label: "Spruces", value: 35 },
                ],
              },
              { id: "ferns", label: "Ferns", value: 10500 },
            ],
          },
          {
            id: "fungi",
            label: "Fungi",
            color: "#f59e0b",
            children: [
              { id: "mushrooms", label: "Mushrooms", value: 14000 },
              { id: "yeasts", label: "Yeasts", value: 1500 },
              { id: "molds", label: "Molds", value: 8000 },
            ],
          },
        ],
      },
    } satisfies SunburstContent,
  },
};
