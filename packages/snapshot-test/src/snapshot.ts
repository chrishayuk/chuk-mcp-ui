import { chromium } from "playwright";
import { resolve } from "node:path";

export interface SnapshotOptions {
  /** View name (e.g. "counter", "map", "datatable") */
  view: string;
  /** structuredContent data to inject into the view */
  data: Record<string, unknown>;
  /** Output file path for the screenshot */
  output: string;
  /** Viewport width in CSS pixels (default 1280) */
  width?: number;
  /** Viewport height in CSS pixels (default 720) */
  height?: number;
  /** Color theme (default "light") */
  theme?: "light" | "dark";
  /** Base URL of the view server (default "https://mcp-views.chukai.io") */
  baseUrl?: string;
  /** Maximum time in ms to wait for the view to render (default 10000) */
  timeout?: number;
  /** Device pixel ratio for HiDPI screenshots (default 2) */
  deviceScaleFactor?: number;
}

/**
 * Render a chuk view with the given data in headless Chromium and capture a
 * screenshot. The view is loaded from the server at `baseUrl` and data is
 * injected via the URL hash using the same encoding the playground uses:
 *
 *   /<view>/v1#<encodeURIComponent(JSON.stringify(data))>
 *
 * The `useView` hook in each view picks up the hash data synchronously during
 * its initial `useState` call, so no postMessage race conditions are possible.
 */
export async function snapshot(options: SnapshotOptions): Promise<void> {
  const {
    view,
    data,
    output,
    width = 1280,
    height = 720,
    theme = "light",
    baseUrl = "https://mcp-views.chukai.io",
    timeout = 10_000,
    deviceScaleFactor = 2,
  } = options;

  const outputPath = resolve(output);

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor,
      colorScheme: theme === "dark" ? "dark" : "light",
    });

    const page = await context.newPage();

    // Build the URL with hash-encoded data (matches PreviewPane pattern)
    const hash = encodeURIComponent(JSON.stringify(data));
    const url = `${baseUrl.replace(/\/+$/, "")}/${view}/v1#${hash}`;

    // Navigate and wait for initial load
    await page.goto(url, { waitUntil: "load", timeout });

    // Wait for the view to render content inside #root.
    // Views that support it set [data-view-ready]; otherwise we check that the
    // root container has at least one child element rendered by React.
    await page.waitForFunction(
      () => {
        if (document.querySelector("[data-view-ready]")) return true;
        const root = document.getElementById("root");
        return root !== null && root.children.length > 0;
      },
      { timeout }
    );

    // Short settling delay for CSS transitions & animations
    await page.waitForTimeout(500);

    // Apply dark theme overrides if requested
    if (theme === "dark") {
      await page.addStyleTag({
        content: `
          html {
            color-scheme: dark;
            background: #1a1a2e;
            color: #e0e0e0;
          }
        `,
      });
      // Give the injected styles a moment to apply
      await page.waitForTimeout(100);
    }

    // Capture screenshot (viewport only, not full-page scroll)
    await page.screenshot({ path: outputPath, fullPage: false });

    await context.close();
  } finally {
    await browser.close();
  }
}
