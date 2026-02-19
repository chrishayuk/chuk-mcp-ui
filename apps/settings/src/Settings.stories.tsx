import type { Meta, StoryObj } from "@storybook/react";
import { SettingsRenderer } from "./App";
import type { SettingsContent } from "./schema";

const meta = {
  title: "Views/Settings",
  component: SettingsRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof SettingsRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DisplaySettings: Story = {
  args: {
    data: {
      type: "settings",
      version: "1.0",
      title: "Display Settings",
      saveTool: "save_display_settings",
      sections: [
        {
          id: "appearance",
          title: "Appearance",
          description: "Customise how the application looks",
          collapsible: true,
          fields: [
            {
              id: "theme",
              label: "Theme",
              description: "Choose your preferred colour scheme",
              type: "select",
              value: "system",
              options: [
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ],
            },
            {
              id: "font-size",
              label: "Font Size",
              description: "Adjust the base font size in pixels",
              type: "slider",
              value: 14,
              min: 10,
              max: 24,
              step: 1,
            },
            {
              id: "dark-mode",
              label: "Force Dark Mode",
              description: "Override system preference with dark mode",
              type: "toggle",
              value: false,
            },
          ],
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "Control when and how you receive notifications",
          collapsible: true,
          fields: [
            {
              id: "email-notifications",
              label: "Email Notifications",
              description: "Receive updates via email",
              type: "toggle",
              value: true,
            },
            {
              id: "sound",
              label: "Sound Alerts",
              description: "Play a sound when notifications arrive",
              type: "toggle",
              value: false,
            },
            {
              id: "frequency",
              label: "Digest Frequency",
              description: "How often to send notification digests",
              type: "select",
              value: "daily",
              options: [
                { value: "realtime", label: "Real-time" },
                { value: "hourly", label: "Hourly" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ],
            },
          ],
        },
      ],
    } satisfies SettingsContent,
  },
};

export const MapSettings: Story = {
  args: {
    data: {
      type: "settings",
      version: "1.0",
      title: "Map Configuration",
      saveTool: "save_map_settings",
      sections: [
        {
          id: "map",
          title: "Map Display",
          description: "Configure map projection and visual options",
          fields: [
            {
              id: "projection",
              label: "Projection",
              description: "Map projection type",
              type: "radio",
              value: "mercator",
              options: [
                { value: "mercator", label: "Mercator" },
                { value: "globe", label: "Globe" },
                { value: "equalArea", label: "Equal Area" },
              ],
            },
            {
              id: "units",
              label: "Units",
              description: "Measurement unit system",
              type: "select",
              value: "metric",
              options: [
                { value: "metric", label: "Metric" },
                { value: "imperial", label: "Imperial" },
                { value: "nautical", label: "Nautical" },
              ],
            },
            {
              id: "show-grid",
              label: "Show Grid",
              description: "Display latitude/longitude grid lines",
              type: "toggle",
              value: true,
            },
            {
              id: "opacity",
              label: "Tile Opacity",
              description: "Opacity of the base map tiles",
              type: "slider",
              value: 80,
              min: 0,
              max: 100,
              step: 5,
            },
            {
              id: "base-color",
              label: "Base Colour",
              description: "Tint colour for the base map layer",
              type: "color",
              value: "#3b82f6",
            },
          ],
        },
      ],
    } satisfies SettingsContent,
  },
};

export const AutoSave: Story = {
  args: {
    data: {
      type: "settings",
      version: "1.0",
      title: "Quick Preferences",
      saveTool: "save_preferences",
      autoSave: true,
      sections: [
        {
          id: "prefs",
          title: "Preferences",
          description: "Changes are saved automatically",
          fields: [
            {
              id: "language",
              label: "Language",
              description: "Interface language",
              type: "select",
              value: "en",
              options: [
                { value: "en", label: "English" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
                { value: "es", label: "Spanish" },
              ],
            },
            {
              id: "compact-mode",
              label: "Compact Mode",
              description: "Use denser layout with smaller spacing",
              type: "toggle",
              value: false,
            },
            {
              id: "sidebar-width",
              label: "Sidebar Width",
              description: "Width of the navigation sidebar in pixels",
              type: "slider",
              value: 240,
              min: 180,
              max: 400,
              step: 10,
            },
          ],
        },
      ],
    } satisfies SettingsContent,
  },
};
