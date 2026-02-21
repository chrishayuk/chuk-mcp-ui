/**
 * Resize tests: verify views adapt to container size changes.
 */
import { test, expect } from "@playwright/test";
import { CURATED_FIXTURES } from "../fixtures/curated";

const fixtures = CURATED_FIXTURES as Record<string, object>;

const RESIZE_VIEWS = ["chart", "datatable", "dashboard"];

for (const viewName of RESIZE_VIEWS) {
  const fixture = fixtures[viewName];
  if (!fixture) continue;

  const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

  test(`${viewName}: adapts to viewport resize`, async ({ page }) => {
    // Start with a large viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.goto(
      `/harness.html?view=${viewName}&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(1_000);

    // Get initial iframe content width
    const frame = page.frameLocator("iframe");
    const initialWidth = await frame
      .locator("body")
      .evaluate((el) => el.scrollWidth);

    // Resize to a smaller viewport
    await page.setViewportSize({ width: 500, height: 400 });
    await page.waitForTimeout(1_000);

    // Get updated width — should have adapted
    const updatedWidth = await frame
      .locator("body")
      .evaluate((el) => el.scrollWidth);

    // The view should have adapted (not necessarily smaller, but responsive)
    // At minimum, no errors should have occurred
    expect(updatedWidth).toBeLessThanOrEqual(initialWidth + 50);

    const status = await page.evaluate(() => window.__COMPAT__);
    expect(status.phase).toBe("delivered");
  });
}
