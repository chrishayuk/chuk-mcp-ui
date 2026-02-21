import type { Meta, StoryObj } from "@storybook/react";
import { GraphRenderer } from "./App";
import type { GraphContent } from "./schema";

const meta = {
  title: "Views/Graph",
  component: GraphRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof GraphRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: SocialNetwork                                             */
/* ------------------------------------------------------------------ */

export const SocialNetwork: Story = {
  args: {
    data: {
      type: "graph",
      version: "1.0",
      title: "Social Network",
      directed: false,
      nodes: [
        { id: "alice", label: "Alice", group: "engineering", size: 24 },
        { id: "bob", label: "Bob", group: "engineering", size: 20 },
        { id: "carol", label: "Carol", group: "engineering", size: 18 },
        { id: "dave", label: "Dave", group: "design", size: 22 },
        { id: "eve", label: "Eve", group: "design", size: 18 },
        { id: "frank", label: "Frank", group: "product", size: 20 },
        { id: "grace", label: "Grace", group: "product", size: 16 },
        { id: "heidi", label: "Heidi", group: "marketing", size: 20 },
        { id: "ivan", label: "Ivan", group: "marketing", size: 16 },
      ],
      edges: [
        { source: "alice", target: "bob", weight: 2 },
        { source: "alice", target: "carol" },
        { source: "alice", target: "dave" },
        { source: "bob", target: "carol", weight: 1.5 },
        { source: "bob", target: "frank" },
        { source: "carol", target: "eve" },
        { source: "dave", target: "eve", weight: 2 },
        { source: "dave", target: "frank" },
        { source: "frank", target: "grace" },
        { source: "frank", target: "heidi" },
        { source: "grace", target: "heidi" },
        { source: "heidi", target: "ivan", weight: 1.5 },
        { source: "ivan", target: "alice" },
      ],
    } satisfies GraphContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: DependencyGraph                                           */
/* ------------------------------------------------------------------ */

export const DependencyGraph: Story = {
  args: {
    data: {
      type: "graph",
      version: "1.0",
      title: "Package Dependencies",
      directed: true,
      nodes: [
        { id: "app", label: "app", color: "#ef4444", size: 26 },
        { id: "react", label: "react", color: "#61dafb", size: 22 },
        { id: "react-dom", label: "react-dom", color: "#61dafb", size: 20 },
        { id: "vite", label: "vite", color: "#646cff", size: 22 },
        { id: "typescript", label: "typescript", color: "#3178c6", size: 20 },
        { id: "tailwindcss", label: "tailwindcss", color: "#06b6d4", size: 20 },
        { id: "framer-motion", label: "framer-motion", color: "#ff0055", size: 18 },
        { id: "zod", label: "zod", color: "#3068b7", size: 16 },
        { id: "radix-ui", label: "@radix-ui", color: "#111111", size: 18 },
        { id: "postcss", label: "postcss", color: "#dd3a0a", size: 16 },
        { id: "esbuild", label: "esbuild", color: "#ffcf00", size: 16 },
      ],
      edges: [
        { source: "app", target: "react" },
        { source: "app", target: "react-dom" },
        { source: "app", target: "vite" },
        { source: "app", target: "typescript" },
        { source: "app", target: "tailwindcss" },
        { source: "app", target: "framer-motion" },
        { source: "app", target: "zod" },
        { source: "react-dom", target: "react" },
        { source: "framer-motion", target: "react" },
        { source: "radix-ui", target: "react" },
        { source: "app", target: "radix-ui" },
        { source: "vite", target: "esbuild" },
        { source: "tailwindcss", target: "postcss" },
      ],
    } satisfies GraphContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: KnowledgeGraph                                            */
/* ------------------------------------------------------------------ */

export const KnowledgeGraph: Story = {
  args: {
    data: {
      type: "graph",
      version: "1.0",
      title: "Programming Languages Knowledge Graph",
      directed: true,
      nodes: [
        { id: "js", label: "JavaScript", group: "web", size: 26 },
        { id: "ts", label: "TypeScript", group: "web", size: 24 },
        { id: "py", label: "Python", group: "general", size: 26 },
        { id: "java", label: "Java", group: "enterprise", size: 22 },
        { id: "c", label: "C", group: "systems", size: 22 },
        { id: "cpp", label: "C++", group: "systems", size: 22 },
        { id: "rust", label: "Rust", group: "systems", size: 20 },
        { id: "go", label: "Go", group: "general", size: 20 },
        { id: "kotlin", label: "Kotlin", group: "enterprise", size: 18 },
        { id: "swift", label: "Swift", group: "apple", size: 18 },
        { id: "objc", label: "Obj-C", group: "apple", size: 16 },
        { id: "csharp", label: "C#", group: "enterprise", size: 20 },
      ],
      edges: [
        { source: "ts", target: "js", label: "superset of" },
        { source: "cpp", target: "c", label: "extends" },
        { source: "rust", target: "cpp", label: "influenced by" },
        { source: "go", target: "c", label: "influenced by" },
        { source: "kotlin", target: "java", label: "interop with" },
        { source: "swift", target: "objc", label: "replaces" },
        { source: "csharp", target: "java", label: "inspired by" },
        { source: "py", target: "c", label: "implemented in" },
        { source: "js", target: "java", label: "syntax from" },
        { source: "rust", target: "c", label: "replaces" },
        { source: "go", target: "py", label: "competes with" },
        { source: "kotlin", target: "swift", label: "similar to" },
      ],
    } satisfies GraphContent,
  },
};
