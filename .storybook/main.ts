import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";

const root = path.resolve(__dirname, "..");

const config: StorybookConfig = {
  stories: [
    "../packages/ui/src/**/*.stories.@(ts|tsx)",
    "../packages/shared/src/**/*.stories.@(ts|tsx)",
    "../apps/*/src/**/*.stories.@(ts|tsx)",
  ],
  framework: "@storybook/react-vite",
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  docs: { autodocs: "tag" },
  viteFinal: async (config) => {
    const tailwindcss = (await import("@tailwindcss/vite")).default;
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss());

    // Resolve workspace subpath exports for Rollup production builds
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      "@chuk/view-ui/styles": path.join(root, "packages/ui/src/styles/globals.css"),
      "@chuk/view-ui/theme": path.join(root, "packages/ui/src/styles/theme.css"),
      "@chuk/view-ui/animations": path.join(root, "packages/ui/src/animations/index.ts"),
      "@chuk/view-ui": path.join(root, "packages/ui/src/index.ts"),
      "@chuk/view-shared": path.join(root, "packages/shared/src/index.ts"),
    };

    return config;
  },
};

export default config;
