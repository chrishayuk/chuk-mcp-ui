import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

export default defineConfig({
  resolve: {
    alias: {
      "@chuk/view-shared": resolve(root, "packages/shared/src"),
      "@chuk/view-ui": resolve(root, "packages/ui/src"),
      "@apps": resolve(root, "apps"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
