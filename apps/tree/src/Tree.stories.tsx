import type { Meta, StoryObj } from "@storybook/react";
import { TreeRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { TreeContent } from "./schema";

const meta = {
  title: "Views/Tree",
  component: TreeRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof TreeRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: FileSystem                                               */
/* ------------------------------------------------------------------ */

export const FileSystem: Story = {
  args: {
    data: {
      type: "tree",
      version: "1.0",
      title: "Project Explorer",
      selection: "single",
      expandDepth: 1,
      roots: [
        {
          id: "src",
          label: "src",
          icon: "\uD83D\uDCC1",
          children: [
            {
              id: "src-components",
              label: "components",
              icon: "\uD83D\uDCC1",
              children: [
                { id: "src-components-button", label: "Button.tsx", icon: "\uD83D\uDCC4" },
                { id: "src-components-input", label: "Input.tsx", icon: "\uD83D\uDCC4" },
                { id: "src-components-modal", label: "Modal.tsx", icon: "\uD83D\uDCC4" },
                { id: "src-components-table", label: "Table.tsx", icon: "\uD83D\uDCC4" },
              ],
            },
            {
              id: "src-utils",
              label: "utils",
              icon: "\uD83D\uDCC1",
              children: [
                { id: "src-utils-format", label: "format.ts", icon: "\uD83D\uDCC4" },
                { id: "src-utils-validate", label: "validate.ts", icon: "\uD83D\uDCC4" },
                { id: "src-utils-api", label: "api.ts", icon: "\uD83D\uDCC4" },
              ],
            },
            {
              id: "src-hooks",
              label: "hooks",
              icon: "\uD83D\uDCC1",
              children: [
                { id: "src-hooks-useAuth", label: "useAuth.ts", icon: "\uD83D\uDCC4" },
                { id: "src-hooks-useQuery", label: "useQuery.ts", icon: "\uD83D\uDCC4" },
              ],
            },
            { id: "src-app", label: "App.tsx", icon: "\uD83D\uDCC4" },
            { id: "src-main", label: "main.tsx", icon: "\uD83D\uDCC4" },
          ],
        },
        {
          id: "public",
          label: "public",
          icon: "\uD83D\uDCC1",
          children: [
            { id: "public-index", label: "index.html", icon: "\uD83C\uDF10" },
            { id: "public-favicon", label: "favicon.ico", icon: "\uD83C\uDFA8" },
          ],
        },
        { id: "package-json", label: "package.json", icon: "\uD83D\uDCE6" },
        { id: "tsconfig", label: "tsconfig.json", icon: "\u2699\uFE0F" },
        { id: "readme", label: "README.md", icon: "\uD83D\uDCD6" },
      ],
    } satisfies TreeContent,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: OrgChart                                                 */
/* ------------------------------------------------------------------ */

export const OrgChart: Story = {
  args: {
    data: {
      type: "tree",
      version: "1.0",
      title: "Organization Chart",
      selection: "single",
      expandDepth: 2,
      roots: [
        {
          id: "ceo",
          label: "Jane Smith",
          icon: "\uD83D\uDC64",
          badge: { label: "CEO", color: "#8b5cf6" },
          children: [
            {
              id: "vp-eng",
              label: "Bob Chen",
              icon: "\uD83D\uDC64",
              badge: { label: "Engineering", color: "#3b82f6" },
              children: [
                {
                  id: "team-frontend",
                  label: "Frontend Team",
                  icon: "\uD83D\uDC65",
                  badge: { label: "8 members", color: "#22c55e" },
                  children: [
                    { id: "fe-1", label: "Alice Wang", icon: "\uD83D\uDC64" },
                    { id: "fe-2", label: "Carlos Diaz", icon: "\uD83D\uDC64" },
                    { id: "fe-3", label: "Diana Lee", icon: "\uD83D\uDC64" },
                  ],
                },
                {
                  id: "team-backend",
                  label: "Backend Team",
                  icon: "\uD83D\uDC65",
                  badge: { label: "6 members", color: "#22c55e" },
                  children: [
                    { id: "be-1", label: "Erik Johnson", icon: "\uD83D\uDC64" },
                    { id: "be-2", label: "Fiona Brown", icon: "\uD83D\uDC64" },
                  ],
                },
                {
                  id: "team-infra",
                  label: "Infrastructure Team",
                  icon: "\uD83D\uDC65",
                  badge: { label: "4 members", color: "#22c55e" },
                },
              ],
            },
            {
              id: "vp-product",
              label: "Sarah Kim",
              icon: "\uD83D\uDC64",
              badge: { label: "Product", color: "#f59e0b" },
              children: [
                {
                  id: "team-design",
                  label: "Design Team",
                  icon: "\uD83D\uDC65",
                  badge: { label: "5 members", color: "#22c55e" },
                },
                {
                  id: "team-pm",
                  label: "Product Management",
                  icon: "\uD83D\uDC65",
                  badge: { label: "3 members", color: "#22c55e" },
                },
              ],
            },
            {
              id: "vp-sales",
              label: "Mike Davis",
              icon: "\uD83D\uDC64",
              badge: { label: "Sales", color: "#ef4444" },
              children: [
                {
                  id: "team-enterprise",
                  label: "Enterprise Sales",
                  icon: "\uD83D\uDC65",
                  badge: { label: "10 members", color: "#22c55e" },
                },
                {
                  id: "team-smb",
                  label: "SMB Sales",
                  icon: "\uD83D\uDC65",
                  badge: { label: "7 members", color: "#22c55e" },
                },
              ],
            },
          ],
        },
      ],
    } satisfies TreeContent,
    onCallTool: mockCallTool,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: Taxonomy                                                 */
/* ------------------------------------------------------------------ */

export const Taxonomy: Story = {
  args: {
    data: {
      type: "tree",
      version: "1.0",
      title: "Product Categories",
      selection: "multi",
      searchable: true,
      expandDepth: 1,
      roots: [
        {
          id: "electronics",
          label: "Electronics",
          icon: "\uD83D\uDD0C",
          children: [
            {
              id: "phones",
              label: "Phones",
              icon: "\uD83D\uDCF1",
              badge: { label: "128 items", color: "#3b82f6" },
            },
            {
              id: "laptops",
              label: "Laptops",
              icon: "\uD83D\uDCBB",
              badge: { label: "85 items", color: "#3b82f6" },
            },
            {
              id: "tablets",
              label: "Tablets",
              icon: "\uD83D\uDCF2",
              badge: { label: "42 items", color: "#3b82f6" },
            },
            {
              id: "accessories",
              label: "Accessories",
              icon: "\uD83C\uDFA7",
              badge: { label: "310 items", color: "#3b82f6" },
            },
          ],
        },
        {
          id: "clothing",
          label: "Clothing",
          icon: "\uD83D\uDC55",
          children: [
            {
              id: "mens",
              label: "Men's",
              badge: { label: "245 items", color: "#8b5cf6" },
            },
            {
              id: "womens",
              label: "Women's",
              badge: { label: "312 items", color: "#8b5cf6" },
            },
            {
              id: "kids",
              label: "Kids",
              badge: { label: "156 items", color: "#8b5cf6" },
            },
          ],
        },
        {
          id: "home",
          label: "Home & Garden",
          icon: "\uD83C\uDFE0",
          children: [
            {
              id: "furniture",
              label: "Furniture",
              badge: { label: "89 items", color: "#22c55e" },
            },
            {
              id: "kitchen",
              label: "Kitchen",
              badge: { label: "201 items", color: "#22c55e" },
            },
            {
              id: "garden",
              label: "Garden",
              badge: { label: "67 items", color: "#22c55e" },
            },
          ],
        },
        {
          id: "sports",
          label: "Sports & Outdoors",
          icon: "\u26BD",
          children: [
            {
              id: "fitness",
              label: "Fitness",
              badge: { label: "134 items", color: "#f59e0b" },
            },
            {
              id: "camping",
              label: "Camping",
              badge: { label: "78 items", color: "#f59e0b" },
            },
          ],
        },
      ],
    } satisfies TreeContent,
    onCallTool: mockCallTool,
  },
};
