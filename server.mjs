import { readFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VIEWS = [
  // Phase 1-2 (original 27)
  "chart", "chat", "code", "compare", "confirm", "counter", "dashboard",
  "datatable", "detail", "form", "gallery", "image", "json", "log", "map",
  "markdown", "pdf", "poll", "progress", "quiz", "ranked", "split",
  "status", "tabs", "timeline", "tree", "video",
  // Phase 3 (7 new)
  "alert", "diff", "embed", "filter", "kanban", "settings", "stepper",
  // Phase 4 (17 new)
  "audio", "boxplot", "carousel", "crosstab", "gauge", "gis-legend",
  "heatmap", "layers", "minimap", "pivot", "profile", "scatter",
  "spectrogram", "sunburst", "terminal", "timeseries", "treemap",
  // Phase 6 Compound (15 new)
  "annotation", "calendar", "flowchart", "funnel", "gantt", "geostory",
  "globe", "graph", "investigation", "neural", "notebook", "sankey",
  "slides", "swimlane", "threed",
];

// Pre-load all HTML into memory at startup
const viewHtml = {};
// Pre-split HTML at <div id="root"></div> for SSR injection
const viewHtmlParts = {};
for (const view of VIEWS) {
  const filePath = resolve(__dirname, "apps", view, "dist", "mcp-app.html");
  try {
    viewHtml[view] = readFileSync(filePath, "utf-8");
    console.log(`Loaded: ${view} (${(viewHtml[view].length / 1024).toFixed(0)} KB)`);
    // Split at root div for SSR: before + after
    const marker = '<div id="root"></div>';
    const idx = viewHtml[view].indexOf(marker);
    if (idx !== -1) {
      viewHtmlParts[view] = {
        before: viewHtml[view].slice(0, idx + '<div id="root">'.length),
        after: viewHtml[view].slice(idx + marker.length),
      };
    }
  } catch (e) {
    console.warn(`Warning: Could not load ${view}: ${e.message}`);
  }
}

// Universal SSR module — single bundle for all views (replaces 65 per-view bundles)
let ssrModule = null;
const ssrAvailable = new Set();
const ssrModulePath = resolve(__dirname, "packages", "ssr", "dist", "ssr-entry.js");
if (existsSync(ssrModulePath)) {
  try {
    ssrModule = await import(ssrModulePath);
    for (const v of ssrModule.views) ssrAvailable.add(v);
    console.log(`SSR universal module loaded: ${ssrModule.views.length} views`);
  } catch (e) {
    console.warn(`SSR warning: Could not load universal module: ${e.message}`);
  }
}

/** Read full request body and parse as JSON */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const MAX = 2 * 1024 * 1024; // 2 MB limit
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const PORT = parseInt(process.env.PORT || "8000", 10);

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
    res.end(JSON.stringify({
      status: "ok",
      views: Object.keys(viewHtml),
      ssr: [...ssrAvailable],
    }));
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
        ssr: ssrAvailable.has(v),
      })),
    }));
    return;
  }

  // View routes: /<view>/v1 (GET) and /<view>/v1/ssr (POST)
  const match = path.match(/^\/([a-z][a-z0-9-]*)\/v1(\/ssr)?$/);
  if (match) {
    const view = match[1];
    const isSsr = match[2] === "/ssr";

    // POST /<view>/v1/ssr — server-side render with data
    if (isSsr && req.method === "POST") {
      const parts = viewHtmlParts[view];
      if (!ssrAvailable.has(view) || !parts) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `SSR not available for ${view}` }));
        return;
      }
      readJsonBody(req).then(async (body) => {
        const data = body.data;
        if (!data) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing 'data' field in body" }));
          return;
        }
        try {
          const rendered = ssrModule.render(view, data);
          // Embed SSR data for client hydration + pre-rendered DOM
          const ssrScript = `<script>window.__SSR_DATA__=${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
          const html = parts.before + rendered + parts.after.replace("</body>", ssrScript + "</body>");
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
          });
          res.end(html);
        } catch (e) {
          console.error(`SSR render error for ${view}:`, e);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "SSR render failed" }));
        }
      }).catch((e) => {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      });
      return;
    }

    // GET /<view>/v1 — serve static SPA HTML
    if (!isSsr && viewHtml[view]) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
      res.end(viewHtml[view]);
      return;
    }
  }

  // Static app helper: serve files from a directory at a URL prefix
  const MIME = {
    ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
    ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
    ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
    ".ttf": "font/ttf", ".map": "application/json", ".txt": "text/plain",
  };

  function serveStatic(prefix, dir) {
    // Redirect /prefix to /prefix/ so relative paths resolve correctly
    if (path === prefix) {
      res.writeHead(301, { Location: prefix + "/" });
      res.end();
      return true;
    }
    if (path.startsWith(prefix + "/")) {
      const subPath = path === prefix + "/"
        ? "/index.html"
        : path.replace(prefix, "");
      const filePath = resolve(__dirname, dir, subPath.slice(1));
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath);
          const ext = extname(filePath);
          res.writeHead(200, {
            "Content-Type": MIME[ext] || "application/octet-stream",
            "Cache-Control": "public, max-age=3600",
          });
          res.end(content);
          return true;
        } catch { /* fall through */ }
      }
    }
    return false;
  }

  // Playground: serve SPA from apps/playground/dist
  if (serveStatic("/playground", "apps/playground/dist")) return;

  // Storybook: serve static build from storybook-static
  if (serveStatic("/storybook", "storybook-static")) return;

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`chuk-mcp-ui-views listening on port ${PORT}`);
  console.log(`Views: ${Object.keys(viewHtml).join(", ")}`);
  if (ssrAvailable.size > 0) {
    console.log(`SSR available: ${ssrAvailable.size} views (lazy-loaded on first request)`);
  }
});
