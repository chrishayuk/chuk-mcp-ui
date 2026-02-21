import type { Meta, StoryObj } from "@storybook/react";
import { SlidesRenderer } from "./App";
import type { SlidesContent } from "./schema";

const meta = {
  title: "Views/Slides",
  component: SlidesRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "700px" }}><Story /></div>],
} satisfies Meta<typeof SlidesRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TechPresentation: Story = {
  args: {
    data: {
      type: "slides",
      version: "1.0",
      title: "Introduction to WebAssembly",
      transition: "slide",
      slides: [
        {
          title: "What is WebAssembly?",
          content: "WebAssembly (Wasm) is a binary instruction format for a stack-based virtual machine.\n\nIt is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications.",
          layout: "center",
        },
        {
          title: "Key Benefits",
          content: "<b>Near-native performance</b> -- compiled binary format runs at near-native speed.\n\n<b>Language agnostic</b> -- compile from C, C++, Rust, Go, and many more.\n\n<b>Secure sandbox</b> -- runs in a memory-safe, sandboxed execution environment.\n\n<b>Web standard</b> -- supported by all major browsers since 2017.",
          layout: "default",
        },
        {
          title: "Use Cases",
          content: "Gaming and multimedia applications\n\nImage and video processing\n\nScientific simulations\n\nCryptography and blockchain\n\nServer-side computing with WASI",
          layout: "default",
        },
        {
          title: "Wasm vs JavaScript",
          content: "WebAssembly complements JavaScript rather than replacing it.\n\nUse Wasm for compute-intensive tasks, and JS for DOM manipulation and UI logic.\n\nBoth can interoperate seamlessly through the WebAssembly JavaScript API.",
          layout: "split",
          image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='%236366f1'%3E%3Crect width='600' height='400' rx='0' opacity='0.1'/%3E%3Ctext x='300' y='190' text-anchor='middle' fill='%236366f1' font-size='20' font-family='sans-serif'%3EWasm + JS%3C/text%3E%3Ctext x='300' y='220' text-anchor='middle' fill='%236366f1' font-size='14' font-family='sans-serif'%3EBetter Together%3C/text%3E%3C/svg%3E",
        },
        {
          title: "Thank You",
          content: "Questions?\n\nResources: webassembly.org | MDN Web Docs | wasmtime.dev",
          layout: "center",
          background: "#1e293b",
        },
      ],
    } satisfies SlidesContent,
  },
};

export const ProjectUpdate: Story = {
  args: {
    data: {
      type: "slides",
      version: "1.0",
      title: "Q1 2026 Project Update",
      transition: "fade",
      slides: [
        {
          title: "Project Status: On Track",
          content: "Overall progress: 73% complete\n\nSprint velocity: 42 points/sprint (target: 40)\n\nTeam health: Strong\n\nBudget utilization: 68% of allocated funds",
          layout: "default",
        },
        {
          title: "Key Metrics",
          content: "<b>Performance</b>\nAPI response time: 45ms (p95)\nUptime: 99.97%\nError rate: 0.02%\n\n<b>Growth</b>\nActive users: 12,450 (+18% MoM)\nDaily signups: 340 avg\nRetention (30d): 82%",
          layout: "default",
        },
        {
          title: "Completed Milestones",
          content: "Authentication system redesign\nReal-time notification pipeline\nDashboard analytics v2\nMobile responsive overhaul\nAPI rate limiting implementation",
          layout: "default",
        },
        {
          title: "Next Steps",
          content: "Sprint 8: GraphQL API layer and caching\nSprint 9: Advanced search with Elasticsearch\nSprint 10: Internationalization (i18n)\n\nUpcoming review: March 15, 2026",
          layout: "center",
        },
      ],
    } satisfies SlidesContent,
  },
};

export const ImageSlides: Story = {
  args: {
    data: {
      type: "slides",
      version: "1.0",
      title: "Visual Showcase",
      transition: "slide",
      slides: [
        {
          title: "Mountain Expedition",
          content: "Join us on an unforgettable journey through the highest peaks.",
          layout: "image",
          image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%231e3a5f'/%3E%3Cstop offset='1' stop-color='%2387ceeb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23sky)'/%3E%3Cpolygon points='0,800 300,300 600,600 900,250 1200,500 1200,800' fill='%234a7c59' opacity='0.8'/%3E%3Cpolygon points='100,800 500,350 800,800' fill='%23365c3f' opacity='0.6'/%3E%3Ccircle cx='900' cy='150' r='60' fill='%23ffd700' opacity='0.8'/%3E%3C/svg%3E",
        },
        {
          title: "Our Architecture",
          content: "The platform is built on a microservices architecture with event-driven communication.\n\nEach service is independently deployable and horizontally scalable.\n\nWe use Kubernetes for orchestration and Istio for service mesh.",
          layout: "split",
          image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='%230ea5e9'%3E%3Crect width='600' height='400' opacity='0.08'/%3E%3Crect x='50' y='50' width='120' height='60' rx='8' fill='%230ea5e9' opacity='0.3'/%3E%3Ctext x='110' y='85' text-anchor='middle' fill='%230ea5e9' font-size='11' font-family='sans-serif'%3EGateway%3C/text%3E%3Crect x='240' y='20' width='120' height='60' rx='8' fill='%238b5cf6' opacity='0.3'/%3E%3Ctext x='300' y='55' text-anchor='middle' fill='%238b5cf6' font-size='11' font-family='sans-serif'%3EAuth Svc%3C/text%3E%3Crect x='240' y='100' width='120' height='60' rx='8' fill='%2310b981' opacity='0.3'/%3E%3Ctext x='300' y='135' text-anchor='middle' fill='%2310b981' font-size='11' font-family='sans-serif'%3EData Svc%3C/text%3E%3Crect x='430' y='60' width='120' height='60' rx='8' fill='%23f59e0b' opacity='0.3'/%3E%3Ctext x='490' y='95' text-anchor='middle' fill='%23f59e0b' font-size='11' font-family='sans-serif'%3EDatabase%3C/text%3E%3Cline x1='170' y1='80' x2='240' y2='50' stroke='%2364748b' stroke-width='1.5'/%3E%3Cline x1='170' y1='80' x2='240' y2='130' stroke='%2364748b' stroke-width='1.5'/%3E%3Cline x1='360' y1='50' x2='430' y2='90' stroke='%2364748b' stroke-width='1.5'/%3E%3Cline x1='360' y1='130' x2='430' y2='90' stroke='%2364748b' stroke-width='1.5'/%3E%3C/svg%3E",
        },
        {
          title: "Get in Touch",
          content: "Email: team@example.com\nWebsite: example.com\n\nThank you for your attention!",
          layout: "center",
          background: "#0f172a",
        },
      ],
    } satisfies SlidesContent,
  },
};
