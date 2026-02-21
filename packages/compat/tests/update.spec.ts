/**
 * Update tests: verify views handle update-structured-content messages.
 *
 * Tests the postMessage-based incremental update path that dashboards
 * use to push data changes to embedded view iframes.
 */
import { test, expect } from "@playwright/test";
import { CURATED_FIXTURES } from "../fixtures/curated";

const fixtures = CURATED_FIXTURES as Record<string, object>;

test("counter: handles replace update", async ({ page }) => {
  const fixture = fixtures["counter"];
  if (!fixture) return;

  const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

  await page.goto(
    `/harness.html?view=counter&protocol=postmessage&fixture=${fixtureB64}`,
  );

  await page.waitForFunction(
    () => window.__COMPAT__?.dataDelivered === true,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(1_000);

  // Send an update with new data
  await page.evaluate(() => {
    const iframe = document.querySelector("iframe")!;
    iframe.contentWindow!.postMessage(
      {
        type: "update-structured-content",
        action: "replace",
        content: {
          type: "counter",
          version: "1.0",
          value: 99999,
          label: "Updated Counter",
        },
      },
      "*",
    );
  });

  await page.waitForTimeout(1_000);

  // Verify the view updated — look for the new value in the iframe
  // Counter formats numbers with locale separators (e.g. 99,999)
  const frame = page.frameLocator("iframe");
  const bodyText = await frame.locator("body").textContent();
  expect(bodyText).toContain("99,999");
});

test("counter: handles merge update", async ({ page }) => {
  const fixture = fixtures["counter"];
  if (!fixture) return;

  const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

  await page.goto(
    `/harness.html?view=counter&protocol=postmessage&fixture=${fixtureB64}`,
  );

  await page.waitForFunction(
    () => window.__COMPAT__?.dataDelivered === true,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(1_000);

  // Send a merge update — only update the value, keep other fields
  await page.evaluate(() => {
    const iframe = document.querySelector("iframe")!;
    iframe.contentWindow!.postMessage(
      {
        type: "update-structured-content",
        action: "merge",
        content: {
          type: "counter",
          version: "1.0",
          value: 77777,
        },
      },
      "*",
    );
  });

  await page.waitForTimeout(1_000);

  const frame = page.frameLocator("iframe");
  const bodyText = await frame.locator("body").textContent();
  expect(bodyText).toContain("77,777");
});
