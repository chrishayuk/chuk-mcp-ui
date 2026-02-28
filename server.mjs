import { readFileSync, existsSync, realpathSync, promises as fsp } from "node:fs";
import { createServer } from "node:http";
import { resolve, dirname, extname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";

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
  // Phase 6 Advanced (4 new — font added)
  "font", "shader", "transcript", "wizard",
];

// Pre-load all HTML into memory at startup
const viewHtml = {};
// Pre-compute ETags for view HTML (Low #17)
const viewEtag = {};
// Pre-split HTML at <div id="root"></div> for SSR injection
const viewHtmlParts = {};
for (const view of VIEWS) {
  const filePath = resolve(__dirname, "apps", view, "dist", "mcp-app.html");
  try {
    viewHtml[view] = readFileSync(filePath, "utf-8");
    viewEtag[view] = `"${createHash("md5").update(viewHtml[view]).digest("hex")}"`;
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

/** Read full request body and parse as JSON (with timeout) */
function readJsonBody(req, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const MAX = 2 * 1024 * 1024; // 2 MB limit
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        req.destroy();
        reject(new Error("Request timeout"));
      }
    }, timeoutMs);
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX) {
        done = true;
        clearTimeout(timer);
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      done = true;
      clearTimeout(timer);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (err) => {
      done = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

/** Check that request has JSON content type */
function requireJson(req, res) {
  const ct = (req.headers["content-type"] || "").split(";")[0].trim();
  if (ct !== "application/json") {
    res.writeHead(415, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Content-Type must be application/json" }));
    return false;
  }
  return true;
}

/**
 * Safely encode data into a <script> tag without XSS risk.
 * Escapes all characters that could break out of a script context.
 * Critical #1 fix.
 */
function safeJsonForScript(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// ── Rate Limiting (High #7) ────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100; // 100 POST requests per minute per IP
const rateLimitMap = new Map();

// Clean up stale entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(ip);
  }
}, 120_000);

function checkRateLimit(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    res.writeHead(429, { "Content-Type": "application/json", "Retry-After": "60" });
    res.end(JSON.stringify({ error: "Rate limit exceeded" }));
    return false;
  }
  return true;
}

// ── CORS Trusted Origins (Critical #3) ─────────────────────────────
const TRUSTED_ORIGINS = new Set([
  "https://mcp-views.chukai.io",
  "https://chuk-mcp-ui-views.fly.dev",
  "http://localhost:8000",
  "http://localhost:5173",
]);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && TRUSTED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const MAX_SECTIONS = 200;

const PORT = parseInt(process.env.PORT || "8000", 10);

const server = createServer((req, res) => {
  // Request tracing (Low #18)
  const reqId = randomUUID().slice(0, 8);
  const startTime = Date.now();

  // Security headers (High #6)
  setCorsHeaders(req, res);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

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
      compose: !!(ssrModule && ssrModule.compose),
    }));
    return;
  }

  // Root: content-negotiate — JSON API info vs catalogue HTML
  if (path === "/") {
    const accept = (req.headers["accept"] || "").toLowerCase();
    // Serve JSON service info when client explicitly asks for JSON
    if (accept.includes("application/json") && !accept.includes("text/html")) {
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
    // Otherwise serve catalogue HTML (playground built with base="/playground/")
    const cataloguePath = resolve(__dirname, "apps", "playground", "dist", "index.html");
    if (existsSync(cataloguePath)) {
      try {
        const html = readFileSync(cataloguePath, "utf-8");
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        });
        res.end(html);
        return;
      } catch (e) {
        console.warn(`[${reqId}] Failed to serve catalogue:`, e.message);
      }
    }
    // Fallback to JSON if catalogue not built
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

  // Compose endpoints: POST /compose/ssr and POST /compose/infer
  if (path === "/compose/ssr" && req.method === "POST") {
    if (!checkRateLimit(req, res)) return;
    if (!ssrModule || !ssrModule.compose) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "SSR compose engine not available" }));
      return;
    }
    if (!requireJson(req, res)) return;
    readJsonBody(req).then((body) => {
      if (!body.sections || !Array.isArray(body.sections) || body.sections.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Request must have at least one section" }));
        return;
      }
      if (body.sections.length > MAX_SECTIONS) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Max ${MAX_SECTIONS} sections allowed` }));
        return;
      }
      try {
        const result = ssrModule.compose(body);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (e) {
        console.error(`[${reqId}] Compose SSR error:`, e);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Compose render failed" }));
      }
    }).catch((e) => {
      const msg = e instanceof Error ? e.message : "Bad request";
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: msg }));
    });
    return;
  }

  if (path === "/compose/infer" && req.method === "POST") {
    if (!checkRateLimit(req, res)) return;
    if (!ssrModule || !ssrModule.infer) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "SSR infer engine not available" }));
      return;
    }
    if (!requireJson(req, res)) return;
    readJsonBody(req).then((body) => {
      if (!body.data || !Array.isArray(body.data)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Request must have a 'data' array" }));
        return;
      }
      if (body.data.length > MAX_SECTIONS) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Max ${MAX_SECTIONS} data items allowed` }));
        return;
      }
      try {
        const results = ssrModule.infer(body.data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ results }));
      } catch (e) {
        console.error(`[${reqId}] Compose infer error:`, e);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Inference failed" }));
      }
    }).catch((e) => {
      const msg = e instanceof Error ? e.message : "Bad request";
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: msg }));
    });
    return;
  }

  // Compose client bundle: GET /compose/client.js
  if (path === "/compose/client.js" && req.method === "GET") {
    const clientPath = resolve(__dirname, "packages", "ssr", "dist-client", "compose-client.js");
    if (existsSync(clientPath)) {
      try {
        const content = readFileSync(clientPath);
        const etag = `"${createHash("md5").update(content).digest("hex")}"`;
        if (req.headers["if-none-match"] === etag) {
          res.writeHead(304);
          res.end();
          return;
        }
        res.writeHead(200, {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "ETag": etag,
        });
        res.end(content);
      } catch (e) {
        console.error(`[${reqId}] Failed to read compose client bundle:`, e);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal error" }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      // Medium #12: generic error in production
      const msg = process.env.NODE_ENV === "production"
        ? "Resource not available"
        : "Compose client bundle not built. Run: pnpm --filter @chuk/ssr build:client";
      res.end(JSON.stringify({ error: msg }));
    }
    return;
  }

  // View routes: /<view>/v1 (GET) and /<view>/v1/ssr (POST)
  const match = path.match(/^\/([a-z][a-z0-9-]*)\/v1(\/ssr)?$/);
  if (match) {
    const view = match[1];
    const isSsr = match[2] === "/ssr";

    // POST /<view>/v1/ssr — server-side render with data
    if (isSsr && req.method === "POST") {
      if (!checkRateLimit(req, res)) return;
      const parts = viewHtmlParts[view];
      if (!ssrAvailable.has(view) || !parts) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `SSR not available for ${view}` }));
        return;
      }
      if (!requireJson(req, res)) return;
      readJsonBody(req).then(async (body) => {
        const data = body.data;
        if (!data) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing 'data' field in body" }));
          return;
        }
        try {
          const rendered = ssrModule.render(view, data);
          // Embed SSR data for client hydration + pre-rendered DOM (Critical #1: safe escaping)
          let ssrScript = "";
          try {
            ssrScript = `<script>window.__SSR_DATA__=${safeJsonForScript(data)}</script>`;
          } catch {
            // Skip hydration data if serialization fails (e.g., circular references)
            console.warn(`[${reqId}] SSR: Could not serialize data for ${view} hydration`);
          }
          const html = parts.before + rendered + parts.after.replace("</body>", ssrScript + "</body>");
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
          });
          res.end(html);
        } catch (e) {
          console.error(`[${reqId}] SSR render error for ${view}:`, e);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "SSR render failed" }));
        }
      }).catch((e) => {
        const msg = e instanceof Error ? e.message : "Bad request";
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: msg }));
      });
      return;
    }

    // GET /<view>/v1 — serve static SPA HTML (Low #17: ETag support)
    if (!isSsr && viewHtml[view]) {
      const etag = viewEtag[view];
      if (etag && req.headers["if-none-match"] === etag) {
        res.writeHead(304);
        res.end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...(etag ? { "ETag": etag } : {}),
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

  async function serveStaticAsync(prefix, dir) {
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
      const baseDir = resolve(__dirname, dir);
      const filePath = resolve(baseDir, subPath.slice(1));

      // Path traversal fix (High #8): use relative path check + realpath for symlink safety
      const rel = relative(baseDir, filePath);
      if (rel.startsWith("..") || isAbsolute(rel)) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden" }));
        return true;
      }

      if (existsSync(filePath)) {
        try {
          // Verify resolved symlinks stay within baseDir
          const realFile = realpathSync(filePath);
          const realBase = realpathSync(baseDir);
          if (!realFile.startsWith(realBase + "/") && realFile !== realBase) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Forbidden" }));
            return true;
          }

          // Medium #13: async file read
          const content = await fsp.readFile(filePath);
          const ext = extname(filePath);
          res.writeHead(200, {
            "Content-Type": MIME[ext] || "application/octet-stream",
            "Cache-Control": "public, max-age=3600",
          });
          res.end(content);
          return true;
        } catch (e) {
          console.warn(`[${reqId}] Failed to read ${filePath}:`, e.message);
        }
      }
    }
    return false;
  }

  // Use async handler for static routes
  (async () => {
    // Playground: serve SPA from apps/playground/dist
    if (await serveStaticAsync("/playground", "apps/playground/dist")) return;

    // Storybook: serve static build from storybook-static
    if (await serveStaticAsync("/storybook", "storybook-static")) return;

    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));

    console.log(`[${reqId}] ${req.method} ${path} 404 ${Date.now() - startTime}ms`);
  })().catch((e) => {
    console.error(`[${reqId}] Unhandled error:`, e);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal error" }));
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`chuk-mcp-ui-views listening on port ${PORT}`);
  console.log(`Views: ${Object.keys(viewHtml).join(", ")}`);
  if (ssrAvailable.size > 0) {
    console.log(`SSR available: ${ssrAvailable.size} views (lazy-loaded on first request)`);
  }
});
