import type { Meta, StoryObj } from "@storybook/react";
import { CompareRenderer } from "./App";
import type { CompareContent } from "./schema";

const meta = {
  title: "Views/Compare",
  component: CompareRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof CompareRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BeforeAfter: Story = {
  args: {
    data: {
      type: "compare",
      version: "1.0",
      before: {
        url: "https://picsum.photos/seed/before/800/600",
        alt: "Before image",
      },
      after: {
        url: "https://picsum.photos/seed/after/800/600",
        alt: "After image",
      },
      orientation: "horizontal",
      initialPosition: 50,
      labels: {
        before: "Before",
        after: "After",
      },
    } satisfies CompareContent,
  },
};

export const VerticalSplit: Story = {
  args: {
    data: {
      type: "compare",
      version: "1.0",
      before: {
        url: "https://picsum.photos/seed/top/800/600",
        alt: "Top image",
      },
      after: {
        url: "https://picsum.photos/seed/bottom/800/600",
        alt: "Bottom image",
      },
      orientation: "vertical",
      initialPosition: 50,
      labels: {
        before: "Original",
        after: "Enhanced",
      },
    } satisfies CompareContent,
  },
};

export const WithCaptions: Story = {
  args: {
    data: {
      type: "compare",
      version: "1.0",
      title: "Photo Restoration",
      before: {
        url: "https://picsum.photos/seed/old/800/600",
        alt: "Original damaged photo",
        caption: "Original (circa 1920)",
      },
      after: {
        url: "https://picsum.photos/seed/restored/800/600",
        alt: "Restored photo",
        caption: "AI-restored version",
      },
      labels: {
        before: "Before",
        after: "After",
      },
    } satisfies CompareContent,
  },
};
