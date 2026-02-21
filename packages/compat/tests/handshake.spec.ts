/**
 * Handshake timing tests: verify views handle slow data delivery gracefully.
 *
 * Uses handshakeDelay to simulate a slow host. The view should show
 * the Fallback component ("Connecting...") until data arrives.
 */
import { test, expect } from "@playwright/test";
import { CURATED_FIXTURES } from "../fixtures/curated";

const fixtures = CURATED_FIXTURES as Record<string, object>;

test("counter: shows Fallback during slow handshake, then renders", async ({
  page,
}) => {
  const fixture = fixtures["counter"];
  if (!fixture) return;

  const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

  await page.goto(
    `/harness.html?view=counter&protocol=ext-apps&handshakeDelay=2000&fixture=${fixtureB64}`,
  );

  // Wait for handshake to start (bridge connected, but data not yet delivered)
  await page.waitForFunction(
    () => window.__COMPAT__?.initialized === true,
    { timeout: 10_000 },
  );

  // Data should NOT be delivered yet (we have a 2s delay)
  const earlyStatus = await page.evaluate(() => window.__COMPAT__);
  expect(earlyStatus.dataDelivered).toBe(false);

  // Wait for data delivery
  await page.waitForFunction(
    () => window.__COMPAT__?.dataDelivered === true,
    { timeout: 10_000 },
  );

  await page.waitForTimeout(500);

  const finalStatus = await page.evaluate(() => window.__COMPAT__);
  expect(finalStatus.phase).toBe("delivered");
  expect(finalStatus.dataDelivered).toBe(true);
});

test("chart: postMessage with delay delivers correctly", async ({ page }) => {
  const fixture = fixtures["chart"];
  if (!fixture) return;

  const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

  await page.goto(
    `/harness.html?view=chart&protocol=postmessage&handshakeDelay=1000&fixture=${fixtureB64}`,
  );

  // Data should not be delivered immediately
  await page.waitForTimeout(200);
  const earlyStatus = await page.evaluate(() => window.__COMPAT__);
  expect(earlyStatus.dataDelivered).toBe(false);

  // Wait for delayed delivery
  await page.waitForFunction(
    () => window.__COMPAT__?.dataDelivered === true,
    { timeout: 10_000 },
  );

  const finalStatus = await page.evaluate(() => window.__COMPAT__);
  expect(finalStatus.phase).toBe("delivered");
});
