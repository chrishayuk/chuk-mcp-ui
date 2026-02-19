import type { Meta, StoryObj } from "@storybook/react";
import { AudioRenderer } from "./App";
import type { AudioContent } from "./schema";

const meta = {
  title: "Views/AudioPlayer",
  component: AudioRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof AudioRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---- helper: generate pseudo-random waveform data ---- */
function generateWaveform(length: number, seed = 42): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < length; i++) {
    x = (x * 16807 + 7) % 2147483647;
    out.push(0.1 + (x / 2147483647) * 0.9);
  }
  return out;
}

export const PodcastPlayer: Story = {
  args: {
    data: {
      type: "audio",
      version: "1.0",
      url: "https://www.w3schools.com/html/horse.ogg",
      title: "The Daily Podcast — Episode 42",
      waveform: generateWaveform(120),
      duration: 185,
    } satisfies AudioContent,
  },
};

export const WithRegions: Story = {
  args: {
    data: {
      type: "audio",
      version: "1.0",
      url: "https://www.w3schools.com/html/horse.ogg",
      title: "Interview Recording",
      waveform: generateWaveform(100, 99),
      duration: 300,
      regions: [
        { id: "intro", start: 0, end: 30, label: "Intro", color: "#22c55e" },
        { id: "main", start: 30, end: 240, label: "Discussion", color: "#3b82f6" },
        { id: "outro", start: 240, end: 300, label: "Outro", color: "#f59e0b" },
      ],
    } satisfies AudioContent,
  },
};

export const MinimalPlayer: Story = {
  args: {
    data: {
      type: "audio",
      version: "1.0",
      url: "https://www.w3schools.com/html/horse.ogg",
    } satisfies AudioContent,
  },
};

export const AutoplayLoop: Story = {
  args: {
    data: {
      type: "audio",
      version: "1.0",
      url: "https://www.w3schools.com/html/horse.ogg",
      title: "Ambient Loop",
      waveform: generateWaveform(80, 7),
      duration: 60,
      autoplay: true,
      loop: true,
    } satisfies AudioContent,
  },
};
