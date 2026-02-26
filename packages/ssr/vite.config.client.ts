/**
 * Vite build config for the compose client hydration bundle.
 *
 * Produces a single ES module (`dist-client/compose-client.js`) that
 * hydrates SSR-composed pages in the browser. React is bundled in
 * (not externalized) since this runs in the browser.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@chuk/view-shared": resolve(root, "packages/shared/src"),
      "@chuk/view-ui": resolve(root, "packages/ui/src"),
      "@apps": resolve(root, "apps"),
    },
  },
  build: {
    outDir: "dist-client",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/compose-client.tsx",
      output: {
        entryFileNames: "compose-client.js",
        format: "es",
      },
    },
    minify: "esbuild",
    target: "es2020",
  },
});
