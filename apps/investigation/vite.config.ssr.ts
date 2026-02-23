import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssr: {
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
