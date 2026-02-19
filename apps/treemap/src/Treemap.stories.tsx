import type { Meta, StoryObj } from "@storybook/react";
import { TreemapRenderer } from "./App";
import type { TreemapContent } from "./schema";

const meta = {
  title: "Views/Treemap",
  component: TreemapRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof TreemapRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: FileSystem                                               */
/* ------------------------------------------------------------------ */

export const FileSystem: Story = {
  args: {
    data: {
      type: "treemap",
      version: "1.0",
      title: "Disk Usage by Directory",
      showLabels: true,
      interactive: true,
      root: {
        id: "root",
        label: "/",
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
                  { id: "src-comp-button", label: "Button.tsx", value: 24 },
                  { id: "src-comp-input", label: "Input.tsx", value: 18 },
                  { id: "src-comp-modal", label: "Modal.tsx", value: 42 },
                  { id: "src-comp-table", label: "Table.tsx", value: 56 },
                  { id: "src-comp-form", label: "Form.tsx", value: 38 },
                ],
              },
              {
                id: "src-utils",
                label: "utils",
                children: [
                  { id: "src-util-format", label: "format.ts", value: 12 },
                  { id: "src-util-validate", label: "validate.ts", value: 28 },
                  { id: "src-util-api", label: "api.ts", value: 34 },
                ],
              },
              {
                id: "src-hooks",
                label: "hooks",
                children: [
                  { id: "src-hook-auth", label: "useAuth.ts", value: 15 },
                  { id: "src-hook-query", label: "useQuery.ts", value: 22 },
                ],
              },
              { id: "src-app", label: "App.tsx", value: 8 },
              { id: "src-main", label: "main.tsx", value: 3 },
            ],
          },
          {
            id: "public",
            label: "public",
            color: "#22c55e",
            children: [
              { id: "pub-index", label: "index.html", value: 2 },
              { id: "pub-assets", label: "assets", value: 120 },
              { id: "pub-favicon", label: "favicon.ico", value: 1 },
            ],
          },
          {
            id: "node_modules",
            label: "node_modules",
            color: "#ef4444",
            value: 450,
            metadata: { note: "External dependencies" },
          },
          {
            id: "dist",
            label: "dist",
            color: "#f59e0b",
            value: 200,
          },
        ],
      },
    } satisfies TreemapContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: MarketCap                                                */
/* ------------------------------------------------------------------ */

export const MarketCap: Story = {
  args: {
    data: {
      type: "treemap",
      version: "1.0",
      title: "S&P 500 Market Cap by Sector",
      showLabels: true,
      interactive: true,
      root: {
        id: "sp500",
        label: "S&P 500",
        children: [
          {
            id: "tech",
            label: "Technology",
            color: "#3b82f6",
            children: [
              { id: "aapl", label: "Apple", value: 3000, metadata: { ticker: "AAPL" } },
              { id: "msft", label: "Microsoft", value: 2800, metadata: { ticker: "MSFT" } },
              { id: "nvda", label: "NVIDIA", value: 1800, metadata: { ticker: "NVDA" } },
              { id: "goog", label: "Alphabet", value: 1600, metadata: { ticker: "GOOG" } },
              { id: "meta", label: "Meta", value: 1200, metadata: { ticker: "META" } },
              { id: "avgo", label: "Broadcom", value: 800, metadata: { ticker: "AVGO" } },
            ],
          },
          {
            id: "healthcare",
            label: "Healthcare",
            color: "#22c55e",
            children: [
              { id: "unh", label: "UnitedHealth", value: 500, metadata: { ticker: "UNH" } },
              { id: "jnj", label: "Johnson & Johnson", value: 380, metadata: { ticker: "JNJ" } },
              { id: "lly", label: "Eli Lilly", value: 650, metadata: { ticker: "LLY" } },
              { id: "abbv", label: "AbbVie", value: 300, metadata: { ticker: "ABBV" } },
            ],
          },
          {
            id: "finance",
            label: "Financials",
            color: "#f59e0b",
            children: [
              { id: "brk", label: "Berkshire", value: 800, metadata: { ticker: "BRK.B" } },
              { id: "jpm", label: "JPMorgan", value: 550, metadata: { ticker: "JPM" } },
              { id: "v", label: "Visa", value: 500, metadata: { ticker: "V" } },
              { id: "ma", label: "Mastercard", value: 400, metadata: { ticker: "MA" } },
            ],
          },
          {
            id: "energy",
            label: "Energy",
            color: "#ef4444",
            children: [
              { id: "xom", label: "ExxonMobil", value: 450, metadata: { ticker: "XOM" } },
              { id: "cvx", label: "Chevron", value: 300, metadata: { ticker: "CVX" } },
            ],
          },
          {
            id: "consumer",
            label: "Consumer",
            color: "#8b5cf6",
            children: [
              { id: "amzn", label: "Amazon", value: 1900, metadata: { ticker: "AMZN" } },
              { id: "tsla", label: "Tesla", value: 800, metadata: { ticker: "TSLA" } },
              { id: "wmt", label: "Walmart", value: 450, metadata: { ticker: "WMT" } },
              { id: "ko", label: "Coca-Cola", value: 260, metadata: { ticker: "KO" } },
            ],
          },
        ],
      },
    } satisfies TreemapContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: FlatTreemap                                              */
/* ------------------------------------------------------------------ */

export const FlatTreemap: Story = {
  args: {
    data: {
      type: "treemap",
      version: "1.0",
      title: "Programming Language Popularity",
      showLabels: true,
      interactive: false,
      root: {
        id: "languages",
        label: "Languages",
        children: [
          { id: "python", label: "Python", value: 28, color: "#3572A5" },
          { id: "javascript", label: "JavaScript", value: 22, color: "#f1e05a" },
          { id: "java", label: "Java", value: 15, color: "#b07219" },
          { id: "typescript", label: "TypeScript", value: 12, color: "#3178c6" },
          { id: "csharp", label: "C#", value: 8, color: "#178600" },
          { id: "cpp", label: "C++", value: 7, color: "#f34b7d" },
          { id: "go", label: "Go", value: 5, color: "#00ADD8" },
          { id: "rust", label: "Rust", value: 3, color: "#dea584" },
        ],
      },
    } satisfies TreemapContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 4: DeepNesting                                              */
/* ------------------------------------------------------------------ */

export const DeepNesting: Story = {
  args: {
    data: {
      type: "treemap",
      version: "1.0",
      title: "Organizational Budget Breakdown",
      showLabels: true,
      interactive: true,
      root: {
        id: "company",
        label: "Acme Corp",
        children: [
          {
            id: "engineering",
            label: "Engineering",
            color: "#3b82f6",
            children: [
              {
                id: "eng-frontend",
                label: "Frontend",
                children: [
                  {
                    id: "eng-fe-web",
                    label: "Web Platform",
                    children: [
                      { id: "eng-fe-web-react", label: "React App", value: 400 },
                      { id: "eng-fe-web-infra", label: "Build Tools", value: 150 },
                      { id: "eng-fe-web-design", label: "Design System", value: 200 },
                    ],
                  },
                  {
                    id: "eng-fe-mobile",
                    label: "Mobile",
                    children: [
                      { id: "eng-fe-ios", label: "iOS", value: 350 },
                      { id: "eng-fe-android", label: "Android", value: 320 },
                    ],
                  },
                ],
              },
              {
                id: "eng-backend",
                label: "Backend",
                children: [
                  { id: "eng-be-api", label: "API Services", value: 500 },
                  { id: "eng-be-data", label: "Data Pipeline", value: 380 },
                  { id: "eng-be-infra", label: "Infrastructure", value: 600 },
                ],
              },
              {
                id: "eng-ml",
                label: "Machine Learning",
                children: [
                  { id: "eng-ml-train", label: "Training", value: 450 },
                  { id: "eng-ml-serving", label: "Model Serving", value: 250 },
                ],
              },
            ],
          },
          {
            id: "sales",
            label: "Sales",
            color: "#22c55e",
            children: [
              { id: "sales-enterprise", label: "Enterprise", value: 800 },
              { id: "sales-smb", label: "SMB", value: 400 },
              { id: "sales-marketing", label: "Marketing", value: 600 },
            ],
          },
          {
            id: "operations",
            label: "Operations",
            color: "#f59e0b",
            children: [
              { id: "ops-hr", label: "HR", value: 300 },
              { id: "ops-finance", label: "Finance", value: 250 },
              { id: "ops-legal", label: "Legal", value: 200 },
              { id: "ops-facilities", label: "Facilities", value: 350 },
            ],
          },
        ],
      },
    } satisfies TreemapContent,
  },
};
