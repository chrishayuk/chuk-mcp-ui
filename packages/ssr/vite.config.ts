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
  ssr: {
    // Bundle everything EXCEPT react/react-dom — those come from Node.js runtime
    noExternal: true,
    external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    ssr: true,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/ssr-entry.tsx",
      external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  },
});
