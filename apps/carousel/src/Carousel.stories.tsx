import type { Meta, StoryObj } from "@storybook/react";
import { CarouselRenderer } from "./App";
import type { CarouselContent } from "./schema";

const meta = {
  title: "Views/Carousel",
  component: CarouselRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof CarouselRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageGallery: Story = {
  args: {
    data: {
      type: "carousel",
      version: "1.0",
      title: "Product Gallery",
      items: [
        {
          id: "img-1",
          image: { url: "https://picsum.photos/seed/carousel1/800/400", alt: "Mountain landscape" },
          title: "Mountain Vista",
          description: "A breathtaking view of snow-capped mountains at sunrise.",
        },
        {
          id: "img-2",
          image: { url: "https://picsum.photos/seed/carousel2/800/400", alt: "Ocean sunset" },
          title: "Ocean Sunset",
          description: "Golden light reflecting off calm ocean waters.",
        },
        {
          id: "img-3",
          image: { url: "https://picsum.photos/seed/carousel3/800/400", alt: "Forest path" },
          title: "Forest Path",
          description: "A winding trail through an ancient redwood forest.",
        },
      ],
      showDots: true,
      showArrows: true,
      loop: true,
      transition: "slide",
    } satisfies CarouselContent,
  },
};

export const FadeTransition: Story = {
  args: {
    data: {
      type: "carousel",
      version: "1.0",
      title: "Featured Articles",
      items: [
        {
          id: "article-1",
          image: { url: "https://picsum.photos/seed/fade1/800/400", alt: "Technology" },
          title: "The Future of AI",
          description: "Exploring how artificial intelligence is reshaping industries worldwide.",
          action: { label: "Read More", tool: "open_article", arguments: { slug: "future-of-ai" } },
        },
        {
          id: "article-2",
          image: { url: "https://picsum.photos/seed/fade2/800/400", alt: "Science" },
          title: "Space Exploration",
          description: "New discoveries from the James Webb Space Telescope.",
          action: { label: "Read More", tool: "open_article", arguments: { slug: "space-exploration" } },
        },
        {
          id: "article-3",
          image: { url: "https://picsum.photos/seed/fade3/800/400", alt: "Nature" },
          title: "Climate Solutions",
          description: "Innovative approaches to addressing climate change.",
          action: { label: "Read More", tool: "open_article", arguments: { slug: "climate-solutions" } },
        },
      ],
      transition: "fade",
      showDots: true,
      showArrows: true,
      loop: true,
    } satisfies CarouselContent,
  },
};

export const AutoPlay: Story = {
  args: {
    data: {
      type: "carousel",
      version: "1.0",
      title: "Auto-Playing Slides",
      items: [
        {
          id: "auto-1",
          image: { url: "https://picsum.photos/seed/auto1/800/400", alt: "Slide 1" },
          title: "Welcome",
          description: "This carousel auto-advances every 3 seconds. Hover to pause.",
        },
        {
          id: "auto-2",
          image: { url: "https://picsum.photos/seed/auto2/800/400", alt: "Slide 2" },
          title: "Features",
          description: "Smooth transitions with configurable intervals.",
        },
        {
          id: "auto-3",
          image: { url: "https://picsum.photos/seed/auto3/800/400", alt: "Slide 3" },
          title: "Get Started",
          description: "Easy to integrate into any MCP application.",
          action: { label: "Learn More", tool: "open_docs", arguments: { page: "getting-started" } },
        },
      ],
      autoPlay: true,
      autoPlayInterval: 3000,
      showDots: true,
      showArrows: true,
      loop: true,
      transition: "slide",
    } satisfies CarouselContent,
  },
};

export const ContentOnly: Story = {
  args: {
    data: {
      type: "carousel",
      version: "1.0",
      title: "Onboarding Steps",
      items: [
        {
          id: "step-1",
          title: "Step 1: Create Account",
          description: "Sign up with your email address to get started with our platform.",
          action: { label: "Sign Up", tool: "create_account", arguments: { flow: "onboarding" } },
        },
        {
          id: "step-2",
          title: "Step 2: Configure Settings",
          description: "Customize your workspace preferences and notification settings.",
          action: { label: "Configure", tool: "open_settings", arguments: { tab: "general" } },
        },
        {
          id: "step-3",
          title: "Step 3: Invite Team",
          description: "Collaborate with your team by sending them invitation links.",
          action: { label: "Invite", tool: "invite_team", arguments: { source: "onboarding" } },
        },
      ],
      showDots: true,
      showArrows: true,
      loop: false,
      transition: "slide",
    } satisfies CarouselContent,
  },
};

export const MinimalNoControls: Story = {
  args: {
    data: {
      type: "carousel",
      version: "1.0",
      items: [
        {
          id: "solo-1",
          image: { url: "https://picsum.photos/seed/minimal1/800/400", alt: "Hero image" },
          title: "Hero Banner",
          description: "A single slide with no navigation controls.",
        },
      ],
      showDots: false,
      showArrows: false,
    } satisfies CarouselContent,
  },
};
