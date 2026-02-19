import type { Meta, StoryObj } from "@storybook/react";
import { GalleryRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { GalleryContent } from "./schema";

const meta = {
  title: "Views/Gallery",
  component: GalleryRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof GalleryRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProductCatalog: Story = {
  args: {
    data: {
      type: "gallery",
      version: "1.0",
      title: "Product Catalog",
      filterable: true,
      sortable: true,
      sortFields: ["Price", "Category"],
      items: [
        {
          id: "prod-1",
          title: "Wireless Headphones",
          subtitle: "Premium Audio",
          description: "Noise-cancelling over-ear headphones with 30-hour battery life and premium drivers.",
          image: { url: "https://picsum.photos/seed/headphones/400/225", alt: "Wireless Headphones" },
          badges: [{ label: "New" }, { label: "Sale", variant: "secondary" }],
          metadata: { Price: "$249.99", Category: "Audio" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-1" } }],
        },
        {
          id: "prod-2",
          title: "Mechanical Keyboard",
          subtitle: "Cherry MX Blue",
          description: "Full-size mechanical keyboard with RGB backlighting and programmable macros.",
          image: { url: "https://picsum.photos/seed/keyboard/400/225", alt: "Mechanical Keyboard" },
          badges: [{ label: "New" }],
          metadata: { Price: "$149.99", Category: "Peripherals" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-2" } }],
        },
        {
          id: "prod-3",
          title: "Ultrawide Monitor",
          subtitle: '34" QHD Display',
          description: "34-inch curved ultrawide monitor with 144Hz refresh rate and HDR support.",
          image: { url: "https://picsum.photos/seed/monitor/400/225", alt: "Ultrawide Monitor" },
          badges: [{ label: "Sale", variant: "secondary" }],
          metadata: { Price: "$599.99", Category: "Displays" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-3" } }],
        },
        {
          id: "prod-4",
          title: "USB-C Hub",
          subtitle: "7-in-1 Adapter",
          description: "Compact hub with HDMI, USB-A, SD card reader, and 100W power delivery.",
          image: { url: "https://picsum.photos/seed/usbhub/400/225", alt: "USB-C Hub" },
          metadata: { Price: "$49.99", Category: "Accessories" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-4" } }],
        },
        {
          id: "prod-5",
          title: "Ergonomic Mouse",
          subtitle: "Vertical Design",
          description: "Wireless vertical mouse designed to reduce wrist strain during long work sessions.",
          image: { url: "https://picsum.photos/seed/mouse/400/225", alt: "Ergonomic Mouse" },
          badges: [{ label: "New" }],
          metadata: { Price: "$79.99", Category: "Peripherals" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-5" } }],
        },
        {
          id: "prod-6",
          title: "Webcam Pro",
          subtitle: "4K Streaming",
          description: "Professional 4K webcam with auto-focus, noise-cancelling mic, and privacy shutter.",
          image: { url: "https://picsum.photos/seed/webcam/400/225", alt: "Webcam Pro" },
          metadata: { Price: "$129.99", Category: "Audio" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-6" } }],
        },
        {
          id: "prod-7",
          title: "Standing Desk",
          subtitle: "Electric Adjustable",
          description: "Motorized sit-stand desk with memory presets and cable management tray.",
          image: { url: "https://picsum.photos/seed/desk/400/225", alt: "Standing Desk" },
          badges: [{ label: "Sale", variant: "secondary" }],
          metadata: { Price: "$449.99", Category: "Furniture" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-7" } }],
        },
        {
          id: "prod-8",
          title: "Laptop Stand",
          subtitle: "Aluminium",
          description: "Adjustable aluminium laptop stand with ventilation and cable routing.",
          image: { url: "https://picsum.photos/seed/stand/400/225", alt: "Laptop Stand" },
          metadata: { Price: "$39.99", Category: "Accessories" },
          actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-8" } }],
        },
      ],
    } satisfies GalleryContent,
    onCallTool: mockCallTool,
  },
};

export const TeamDirectory: Story = {
  args: {
    data: {
      type: "gallery",
      version: "1.0",
      title: "Team Directory",
      filterable: true,
      columns: 3,
      items: [
        {
          id: "person-1",
          title: "Alice Chen",
          subtitle: "Engineering Lead",
          description: "Leads the platform team focusing on scalability and developer experience.",
          image: { url: "https://i.pravatar.cc/400?u=alice", alt: "Alice Chen" },
          badges: [{ label: "Engineering", variant: "secondary" }],
          actions: [{ label: "View Profile", tool: "view_profile", arguments: { userId: "person-1" } }],
        },
        {
          id: "person-2",
          title: "Bob Martinez",
          subtitle: "Product Designer",
          description: "Designs user interfaces and leads design system initiatives.",
          image: { url: "https://i.pravatar.cc/400?u=bob", alt: "Bob Martinez" },
          badges: [{ label: "Design", variant: "secondary" }],
          actions: [{ label: "View Profile", tool: "view_profile", arguments: { userId: "person-2" } }],
        },
        {
          id: "person-3",
          title: "Carol Williams",
          subtitle: "Backend Engineer",
          description: "Specialises in distributed systems and API design.",
          image: { url: "https://i.pravatar.cc/400?u=carol", alt: "Carol Williams" },
          badges: [{ label: "Engineering", variant: "secondary" }],
          actions: [{ label: "View Profile", tool: "view_profile", arguments: { userId: "person-3" } }],
        },
        {
          id: "person-4",
          title: "David Kim",
          subtitle: "Product Manager",
          description: "Drives roadmap and stakeholder alignment for the core product.",
          image: { url: "https://i.pravatar.cc/400?u=david", alt: "David Kim" },
          badges: [{ label: "Product", variant: "secondary" }],
          actions: [{ label: "View Profile", tool: "view_profile", arguments: { userId: "person-4" } }],
        },
        {
          id: "person-5",
          title: "Eva Johnson",
          subtitle: "Frontend Engineer",
          description: "Builds accessible, performant web experiences with React and TypeScript.",
          image: { url: "https://i.pravatar.cc/400?u=eva", alt: "Eva Johnson" },
          badges: [{ label: "Engineering", variant: "secondary" }],
          actions: [{ label: "View Profile", tool: "view_profile", arguments: { userId: "person-5" } }],
        },
        {
          id: "person-6",
          title: "Frank Okafor",
          subtitle: "DevOps Engineer",
          description: "Manages CI/CD pipelines, infrastructure, and cloud architecture.",
          image: { url: "https://i.pravatar.cc/400?u=frank", alt: "Frank Okafor" },
          badges: [{ label: "Engineering", variant: "secondary" }],
          actions: [{ label: "View Profile", tool: "view_profile", arguments: { userId: "person-6" } }],
        },
      ],
    } satisfies GalleryContent,
    onCallTool: mockCallTool,
  },
};

export const SearchResults: Story = {
  args: {
    data: {
      type: "gallery",
      version: "1.0",
      title: "Search Results",
      filterable: true,
      sortable: true,
      sortFields: ["Relevance", "Date", "Author"],
      columns: 2,
      items: [
        {
          id: "result-1",
          title: "Getting Started with MCP Apps",
          subtitle: "Documentation",
          description: "A comprehensive guide to building your first MCP application with structured content and tool integration.",
          badges: [{ label: "Guide", variant: "outline" }],
          metadata: { Author: "Alice Chen", Date: "2025-01-15", Relevance: "High" },
        },
        {
          id: "result-2",
          title: "View Component Architecture",
          subtitle: "Technical Reference",
          description: "Deep dive into the view-shared hooks, theming system, and component composition patterns.",
          badges: [{ label: "Reference", variant: "outline" }],
          metadata: { Author: "Bob Martinez", Date: "2025-02-01", Relevance: "Medium" },
        },
        {
          id: "result-3",
          title: "Schema Validation Best Practices",
          subtitle: "Blog Post",
          description: "How to use Zod and JSON Schema together for runtime and build-time validation of MCP content.",
          badges: [{ label: "Blog", variant: "outline" }],
          metadata: { Author: "Carol Williams", Date: "2025-01-28", Relevance: "High" },
        },
        {
          id: "result-4",
          title: "Deploying Views to Production",
          subtitle: "Operations Guide",
          description: "Step-by-step guide covering build pipelines, single-file output, and CSP configuration.",
          badges: [{ label: "Guide", variant: "outline" }],
          metadata: { Author: "David Kim", Date: "2025-02-10", Relevance: "Low" },
        },
      ],
    } satisfies GalleryContent,
    onCallTool: mockCallTool,
  },
};
