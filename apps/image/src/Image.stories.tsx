import type { Meta, StoryObj } from "@storybook/react";
import { ImageRenderer } from "./App";
import type { ImageContent } from "./schema";

const meta = {
  title: "Views/Image",
  component: ImageRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ImageRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AerialPhotography: Story = {
  args: {
    data: {
      type: "image",
      version: "1.0",
      title: "Aerial Photography - Site Survey",
      images: [
        {
          id: "aerial-1",
          url: "https://picsum.photos/1200/800",
          alt: "Aerial photograph of survey site",
          caption: "Site survey taken 2024-01-15, north-facing view",
        },
      ],
      annotations: [
        {
          id: "ann-1",
          imageId: "aerial-1",
          type: "circle",
          x: 400,
          y: 300,
          radius: 50,
          label: "Building A",
          color: "#ff3333",
          description: "Main structure, approximately 200sqm",
        },
        {
          id: "ann-2",
          imageId: "aerial-1",
          type: "rect",
          x: 600,
          y: 200,
          width: 120,
          height: 80,
          label: "Parking Zone",
          color: "#33aaff",
          description: "Designated visitor parking area",
        },
        {
          id: "ann-3",
          imageId: "aerial-1",
          type: "point",
          x: 250,
          y: 450,
          label: "Access Point",
          color: "#33cc33",
          description: "Main pedestrian entrance",
        },
      ],
      controls: {
        zoom: true,
        fullscreen: true,
        thumbnails: false,
      },
    } satisfies ImageContent,
  },
};

export const PhotoGallery: Story = {
  args: {
    data: {
      type: "image",
      version: "1.0",
      title: "Product Photo Gallery",
      images: [
        {
          id: "photo-1",
          url: "https://picsum.photos/seed/p1/800/600",
          alt: "Product front view",
          caption: "Front view - Matte Black finish",
        },
        {
          id: "photo-2",
          url: "https://picsum.photos/seed/p2/800/600",
          alt: "Product side view",
          caption: "Side profile showing slim design",
        },
        {
          id: "photo-3",
          url: "https://picsum.photos/seed/p3/800/600",
          alt: "Product back view",
          caption: "Rear panel with connectivity ports",
        },
        {
          id: "photo-4",
          url: "https://picsum.photos/seed/p4/800/600",
          alt: "Product top view",
          caption: "Top-down view with status indicators",
        },
        {
          id: "photo-5",
          url: "https://picsum.photos/seed/p5/800/600",
          alt: "Product in context",
          caption: "Lifestyle shot - desktop setup",
        },
      ],
      controls: {
        zoom: true,
        fullscreen: true,
        thumbnails: true,
      },
    } satisfies ImageContent,
  },
};

export const Annotated: Story = {
  args: {
    data: {
      type: "image",
      version: "1.0",
      title: "Annotated Diagram",
      images: [
        {
          id: "diagram-1",
          url: "https://picsum.photos/seed/diagram/1000/700",
          alt: "Technical diagram with annotations",
          caption: "Component layout with all annotation types",
        },
      ],
      annotations: [
        {
          id: "a1",
          imageId: "diagram-1",
          type: "circle",
          x: 300,
          y: 250,
          radius: 40,
          label: "Sensor Module",
          color: "#e74c3c",
          description: "Primary temperature sensor, rated -40C to 125C",
        },
        {
          id: "a2",
          imageId: "diagram-1",
          type: "rect",
          x: 500,
          y: 150,
          width: 160,
          height: 100,
          label: "Control Board",
          color: "#3498db",
          description: "MCU board with integrated WiFi",
        },
        {
          id: "a3",
          imageId: "diagram-1",
          type: "point",
          x: 200,
          y: 400,
          label: "Power Input",
          color: "#2ecc71",
          description: "12V DC barrel jack connector",
        },
        {
          id: "a4",
          imageId: "diagram-1",
          type: "text",
          x: 600,
          y: 450,
          label: "Rev 3.2 - Updated layout",
          color: "#9b59b6",
          description: "Revision note added during design review",
        },
      ],
      controls: {
        zoom: true,
        fullscreen: true,
        thumbnails: false,
      },
    } satisfies ImageContent,
  },
};
