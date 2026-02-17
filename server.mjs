import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VIEWS = [
  "chart", "dashboard", "datatable", "form", "map",
  "split", "tabs", "video", "pdf", "markdown",
];

// Pre-load all HTML into memory at startup
const viewHtml = {};
for (const view of VIEWS) {
  const filePath = resolve(__dirname, "apps", view, "dist", "mcp-app.html");
  try {
    viewHtml[view] = readFileSync(filePath, "utf-8");
    console.log(`Loaded: ${view} (${(viewHtml[view].length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.warn(`Warning: Could not load ${view}: ${e.message}`);
  }
}

const PORT = parseInt(process.env.PORT || "8000", 10);

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // Health check
  if (path === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", views: Object.keys(viewHtml) }));
    return;
  }

  // Service info
  if (path === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      service: "chuk-mcp-ui-views",
      version: "1.0.0",
      views: VIEWS.map((v) => ({
        name: v,
        url: `/${v}/v1`,
        loaded: !!viewHtml[v],
      })),
    }));
    return;
  }

  // View routes: /<view>/v1
  const match = path.match(/^\/([a-z]+)\/v1$/);
  if (match && viewHtml[match[1]]) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    });
    res.end(viewHtml[match[1]]);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`chuk-mcp-ui-views listening on port ${PORT}`);
  console.log(`Views: ${Object.keys(viewHtml).join(", ")}`);
});
