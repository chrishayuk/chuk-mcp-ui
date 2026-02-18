import type { Meta, StoryObj } from "@storybook/react";
import { VideoPlayer } from "./App";
import type { VideoContent } from "./schema";

const meta = {
  title: "Views/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof VideoPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithUrl: Story = {
  args: {
    data: {
      type: "video",
      version: "1.0",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Sample Video",
    } satisfies VideoContent,
  },
};

export const WithPoster: Story = {
  args: {
    data: {
      type: "video",
      version: "1.0",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Video with Poster",
      muted: true,
      poster: "https://via.placeholder.com/640x360?text=Video+Poster",
    } satisfies VideoContent,
  },
};
