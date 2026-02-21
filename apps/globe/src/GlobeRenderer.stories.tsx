import type { Meta, StoryObj } from "@storybook/react";
import { GlobeRenderer } from "./App";
import type { GlobeContent } from "./schema";

const meta = {
  title: "Views/Globe",
  component: GlobeRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof GlobeRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorldCities: Story = {
  args: {
    data: {
      type: "globe",
      version: "1.0",
      title: "Major World Cities",
      points: [
        { id: "nyc", lat: 40.7128, lon: -74.006, label: "New York", color: "#ef4444" },
        { id: "lon", lat: 51.5074, lon: -0.1278, label: "London", color: "#3b82f6" },
        { id: "tok", lat: 35.6762, lon: 139.6503, label: "Tokyo", color: "#f59e0b" },
        { id: "syd", lat: -33.8688, lon: 151.2093, label: "Sydney", color: "#22c55e" },
        { id: "par", lat: 48.8566, lon: 2.3522, label: "Paris", color: "#8b5cf6" },
        { id: "rio", lat: -22.9068, lon: -43.1729, label: "Rio de Janeiro", color: "#ec4899" },
        { id: "dub", lat: 25.2048, lon: 55.2708, label: "Dubai", color: "#f97316" },
        { id: "sin", lat: 1.3521, lon: 103.8198, label: "Singapore", color: "#14b8a6" },
      ],
      rotation: { lat: 20, lon: -30 },
    } satisfies GlobeContent,
  },
};

export const FlightRoutes: Story = {
  args: {
    data: {
      type: "globe",
      version: "1.0",
      title: "International Flight Routes",
      points: [
        { id: "jfk", lat: 40.6413, lon: -73.7781, label: "JFK", color: "#ef4444", size: 6 },
        { id: "lhr", lat: 51.47, lon: -0.4543, label: "LHR", color: "#3b82f6", size: 6 },
        { id: "nrt", lat: 35.7647, lon: 140.3864, label: "NRT", color: "#f59e0b", size: 6 },
        { id: "dxb", lat: 25.2532, lon: 55.3657, label: "DXB", color: "#f97316", size: 6 },
        { id: "sfo", lat: 37.6213, lon: -122.379, label: "SFO", color: "#22c55e", size: 6 },
        { id: "sin", lat: 1.3644, lon: 103.9915, label: "SIN", color: "#14b8a6", size: 6 },
      ],
      arcs: [
        { from: "jfk", to: "lhr", color: "#60a5fa", label: "Transatlantic" },
        { from: "lhr", to: "dxb", color: "#f97316" },
        { from: "dxb", to: "sin", color: "#a78bfa" },
        { from: "sin", to: "nrt", color: "#fbbf24" },
        { from: "sfo", to: "nrt", color: "#34d399", label: "Transpacific" },
        { from: "jfk", to: "sfo", color: "#f472b6" },
      ],
      rotation: { lat: 25, lon: -20 },
    } satisfies GlobeContent,
  },
};

export const ConferenceLocations: Story = {
  args: {
    data: {
      type: "globe",
      version: "1.0",
      title: "Tech Conference Venues 2025",
      points: [
        { id: "sf", lat: 37.7749, lon: -122.4194, label: "San Francisco", color: "#ef4444", size: 7 },
        { id: "ber", lat: 52.52, lon: 13.405, label: "Berlin", color: "#3b82f6", size: 7 },
        { id: "ban", lat: 12.9716, lon: 77.5946, label: "Bangalore", color: "#f59e0b", size: 7 },
        { id: "ams", lat: 52.3676, lon: 4.9041, label: "Amsterdam", color: "#22c55e", size: 7 },
        { id: "sea", lat: 47.6062, lon: -122.3321, label: "Seattle", color: "#8b5cf6", size: 7 },
      ],
      rotation: { lat: 35, lon: 10 },
    } satisfies GlobeContent,
  },
};
