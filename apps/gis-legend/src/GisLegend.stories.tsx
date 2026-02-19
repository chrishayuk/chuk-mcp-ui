import type { Meta, StoryObj } from "@storybook/react";
import { GisLegendRenderer } from "./App";
import type { GisLegendContent } from "./schema";

const meta = {
  title: "Views/GisLegend",
  component: GisLegendRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof GisLegendRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandCover: Story = {
  args: {
    data: {
      type: "gis-legend",
      version: "1.0",
      title: "Land Cover Classification",
      sections: [
        {
          title: "Vegetation",
          items: [
            { type: "polygon", label: "Forest", fillColor: "#228B22", strokeColor: "#145214" },
            { type: "polygon", label: "Grassland", fillColor: "#90EE90" },
            { type: "polygon", label: "Wetland", fillColor: "#4682B4", strokeColor: "#2F5F8F" },
            { type: "polygon", label: "Cropland", fillColor: "#DAA520" },
          ],
        },
        {
          title: "Built Environment",
          items: [
            { type: "polygon", label: "Urban Area", fillColor: "#808080", strokeColor: "#555" },
            { type: "polygon", label: "Industrial", fillColor: "#A0522D" },
            { type: "line", label: "Road", strokeColor: "#333", strokeWidth: 2 },
            { type: "line", label: "Railway", strokeColor: "#111", strokeWidth: 3 },
          ],
        },
        {
          title: "Water",
          items: [
            { type: "polygon", label: "Lake", fillColor: "#1E90FF" },
            { type: "line", label: "River", strokeColor: "#1E90FF", strokeWidth: 2 },
          ],
        },
      ],
    } satisfies GisLegendContent,
  },
};

export const Seismic: Story = {
  args: {
    data: {
      type: "gis-legend",
      version: "1.0",
      title: "Seismic Activity",
      sections: [
        {
          title: "Earthquake Magnitude",
          items: [
            { type: "point", label: "M < 3.0", color: "#22c55e", size: 6 },
            { type: "point", label: "M 3.0 - 5.0", color: "#eab308", size: 8 },
            { type: "point", label: "M 5.0 - 7.0", color: "#f97316", size: 10 },
            { type: "point", label: "M > 7.0", color: "#dc2626", size: 14 },
          ],
        },
        {
          title: "Intensity",
          items: [
            { type: "gradient", label: "Shake Intensity", gradientStops: [
              { value: "0%", color: "#22c55e" },
              { value: "50%", color: "#eab308" },
              { value: "100%", color: "#dc2626" },
            ] },
          ],
        },
        {
          title: "Infrastructure",
          items: [
            { type: "line", label: "Fault Line", strokeColor: "#dc2626", strokeWidth: 2 },
            { type: "icon", label: "Seismic Station", icon: "\u25B2", color: "#6366f1" },
            { type: "polygon", label: "Exclusion Zone", fillColor: "rgba(220,38,38,0.2)", strokeColor: "#dc2626" },
          ],
        },
      ],
    } satisfies GisLegendContent,
  },
};

export const Horizontal: Story = {
  args: {
    data: {
      type: "gis-legend",
      version: "1.0",
      title: "Map Symbols",
      orientation: "horizontal",
      sections: [
        {
          items: [
            { type: "point", label: "City", color: "#1d4ed8", size: 10 },
            { type: "point", label: "Town", color: "#3b82f6", size: 7 },
            { type: "point", label: "Village", color: "#93c5fd", size: 5 },
            { type: "line", label: "Highway", strokeColor: "#dc2626", strokeWidth: 3 },
            { type: "line", label: "Secondary Road", strokeColor: "#f97316", strokeWidth: 2 },
            { type: "polygon", label: "Park", fillColor: "#22c55e" },
            { type: "icon", label: "Airport", icon: "\u2708", color: "#6366f1" },
          ],
        },
      ],
    } satisfies GisLegendContent,
  },
};
