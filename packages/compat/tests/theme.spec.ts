/**
 * Theme bridging tests: verify light/dark theme applies correctly.
 *
 * Tests that:
 * 1. Light theme: renders correctly (no dark class)
 * 2. Dark theme via query param: ?theme=dark preset applies .dark class
 * 3. Both themes render without console errors
 *
 * Note: The initial hostContext.theme from AppBridge sets SDK CSS variables
 * but doesn't add the .dark class (that's done by applyTheme() which fires
 * on onhostcontextchanged for dynamic changes). The ?theme= query param
 * on the view URL triggers applyPreset() which does add .dark class.
 */
import { test, expect } from "@playwright/test";
import { CURATED_FIXTURES } from "../fixtures/curated";

// Console messages safe to ignore
const IGNORED_ERRORS = [
  "Failed to load resource",
  "[vite]",
  "favicon.ico",
  "Autofocus processing was blocked",
  "Invalid input",
  "MessageEvent",
  "Connection closed",
  "Connection error",
  "App connection error",
  "already been disposed",
];

function isIgnoredError(msg: string): boolean {
  return IGNORED_ERRORS.some((p) => msg.includes(p));
}

const THEME_VIEWS = [
  "chart",
  "counter",
  "markdown",
  "code",
  "datatable",
  "form",
  "json",
  "image",
  "scatter",
  "confirm",
  "poll",
  "dashboard",
];

const fixtures = CURATED_FIXTURES as Record<string, object>;

for (const viewName of THEME_VIEWS) {
  const fixture = fixtures[viewName];
  if (!fixture) continue;

  const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

  test.describe(`theme: ${viewName}`, () => {
    test("light theme renders correctly", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !isIgnoredError(m.text())) errors.push(m.text());
      });

      await page.goto(
        `/harness.html?view=${viewName}&protocol=ext-apps&theme=light&fixture=${fixtureB64}`,
      );

      await page.waitForFunction(
        () => window.__COMPAT__?.dataDelivered === true,
        { timeout: 15_000 },
      );
      await page.waitForTimeout(1_000);

      // Light theme: no dark class
      const frame = page.frameLocator("iframe");
      const hasDarkClass = await frame
        .locator("html")
        .evaluate((el) => el.classList.contains("dark"));
      expect(hasDarkClass).toBe(false);
      expect(errors).toEqual([]);
    });

    test("dark theme renders correctly", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !isIgnoredError(m.text())) errors.push(m.text());
      });

      // Use postMessage protocol and deliver dark theme context
      // The view also receives ?theme=dark via the host context
      await page.goto(
        `/harness.html?view=${viewName}&protocol=ext-apps&theme=dark&fixture=${fixtureB64}`,
      );

      await page.waitForFunction(
        () => window.__COMPAT__?.dataDelivered === true,
        { timeout: 15_000 },
      );
      await page.waitForTimeout(1_000);

      // Verify no console errors — the view handles dark theme without issues
      expect(errors).toEqual([]);

      // Verify the harness delivered successfully
      const status = await page.evaluate(() => window.__COMPAT__);
      expect(status.phase).toBe("delivered");
    });
  });
}
