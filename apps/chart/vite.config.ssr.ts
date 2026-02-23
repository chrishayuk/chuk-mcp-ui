import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssr: {
    // Bundle all dependencies into the output so the Docker image
    // doesn't need node_modules installed.
    noExternal: true,
  },
  build: {
    ssr: true,
    outDir: "dist-ssr",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/ssr-entry.tsx",
    },
  },
});
