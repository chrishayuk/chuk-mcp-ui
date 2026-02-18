import type { Preview } from "@storybook/react";
import "@chuk/view-ui/styles";
import { themeDecorator } from "./theme-decorator";

const preview: Preview = {
  decorators: [themeDecorator],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Switch light/dark theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    layout: "centered",
  },
};

export default preview;
