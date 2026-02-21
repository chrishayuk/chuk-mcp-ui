import { defineConfig, type Plugin } from "vite";
import path from "node:path";
import fs from "node:fs";

/**
 * Vite plugin that serves built view HTML files at /views/{name}.
 * Each view's dist/mcp-app.html is a self-contained single-file bundle.
 */
function viewStaticServer(): Plugin {
  const appsDir = path.resolve(__dirname, "..", "..", "apps");

  return {
    name: "view-static-server",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/views/")) return next();

        const viewName = req.url.slice("/views/".length).split("?")[0];
        if (!viewName) return next();

        const htmlPath = path.join(appsDir, viewName, "dist", "mcp-app.html");
        if (!fs.existsSync(htmlPath)) {
          res.statusCode = 404;
          res.end(`View "${viewName}" not found (expected ${htmlPath})`);
          return;
        }

        res.setHeader("Content-Type", "text/html");
        fs.createReadStream(htmlPath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  root: "src",
  server: {
    port: 5199,
  },
  plugins: [viewStaticServer()],
});
