/**
 * Smoke tests: verify every view loads via both protocols without errors.
 *
 * For each of the 66 views:
 * 1. ext-apps protocol: AppBridge handshake → sendToolResult → check no errors
 * 2. postMessage fallback: postMessage → check no errors
 */
import { test, expect } from "@playwright/test";
import { VIEW_MANIFEST } from "../src/view-manifest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const minimalPath = resolve(import.meta.dirname, "..", "fixtures", "minimal.json");
const fixtures = JSON.parse(readFileSync(minimalPath, "utf-8")) as Record<string, object>;

// Timeout for data delivery (ext-apps handshake + tool result)
const DELIVERY_TIMEOUT = 15_000;
// Time to let the view render after data delivery
const RENDER_SETTLE_MS = 1_500;

// Console messages that are safe to ignore
const IGNORED_ERRORS = [
  "Failed to load resource",
  "[vite]",
  "favicon.ico",
  "Autofocus processing was blocked",
  // ext-apps SDK PostMessageTransport logs validation errors for non-JSON-RPC
  // messages (e.g., our custom mcp-app:tool-result format). This is expected.
  "Invalid input",
  "MessageEvent",
  // useApp connection timeout when no host is present (postMessage fallback path)
  "Connection closed",
  "Connection error",
  "App connection error",
  // React strict mode double-mount
  "already been disposed",
];

function isIgnoredError(msg: string): boolean {
  return IGNORED_ERRORS.some((pattern) => msg.includes(pattern));
}

for (const view of VIEW_MANIFEST) {
  const fixture = fixtures[view.name];
  if (!fixture) continue;

  const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

  test.describe(view.name, () => {
    test("ext-apps: renders without errors", async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error" && !isIgnoredError(msg.text())) {
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (err) => {
        if (!isIgnoredError(err.message)) {
          consoleErrors.push(err.message);
        }
      });

      await page.goto(
        `/harness.html?view=${view.name}&protocol=ext-apps&fixture=${fixtureB64}`,
      );

      // Wait for data delivery
      await page.waitForFunction(
        () => window.__COMPAT__?.dataDelivered === true,
        { timeout: DELIVERY_TIMEOUT },
      );

      // Let the view render
      await page.waitForTimeout(RENDER_SETTLE_MS);

      // Check harness status
      const status = await page.evaluate(() => window.__COMPAT__);
      expect(status.phase).toBe("delivered");

      // Check for console errors (from both harness and iframe)
      expect(consoleErrors).toEqual([]);
    });

    test("postMessage: renders without errors", async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error" && !isIgnoredError(msg.text())) {
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (err) => {
        if (!isIgnoredError(err.message)) {
          consoleErrors.push(err.message);
        }
      });

      await page.goto(
        `/harness.html?view=${view.name}&protocol=postmessage&fixture=${fixtureB64}`,
      );

      await page.waitForFunction(
        () => window.__COMPAT__?.dataDelivered === true,
        { timeout: DELIVERY_TIMEOUT },
      );

      await page.waitForTimeout(RENDER_SETTLE_MS);

      const status = await page.evaluate(() => window.__COMPAT__);
      expect(status.phase).toBe("delivered");
      expect(consoleErrors).toEqual([]);
    });
  });
}
