/**
 * Streaming and incremental update tests.
 *
 * Tests the postMessage-based data delivery and update paths:
 * - Replace: full data replacement
 * - Merge: partial data merge
 * - Multiple sequential updates
 * - Cross-protocol: ext-apps data delivery followed by postMessage updates
 */
import { test, expect } from "@playwright/test";
import { CURATED_FIXTURES } from "../fixtures/curated";

const fixtures = CURATED_FIXTURES as Record<string, object>;

test.describe("streaming: sequential updates", () => {
  test("counter: multiple replace updates render last value", async ({
    page,
  }) => {
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
    await page.waitForTimeout(500);

    // Send 3 rapid replace updates
    for (const value of [10000, 20000, 30000]) {
      await page.evaluate((val) => {
        const iframe = document.querySelector("iframe")!;
        iframe.contentWindow!.postMessage(
          {
            type: "update-structured-content",
            action: "replace",
            content: {
              type: "counter",
              version: "1.0",
              value: val,
              label: "Streaming Counter",
            },
          },
          "*",
        );
      }, value);
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(500);

    // Last value should be visible
    const frame = page.frameLocator("iframe");
    const bodyText = await frame.locator("body").textContent();
    expect(bodyText).toContain("30,000");
  });

  test("datatable: replace update swaps all rows", async ({ page }) => {
    const fixture = fixtures["datatable"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    await page.goto(
      `/harness.html?view=datatable&protocol=postmessage&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    // Verify initial data has "Alice Johnson"
    const frame = page.frameLocator("iframe");
    let bodyText = await frame.locator("body").textContent();
    expect(bodyText).toContain("Alice Johnson");

    // Send replacement data with different rows
    await page.evaluate(() => {
      const iframe = document.querySelector("iframe")!;
      iframe.contentWindow!.postMessage(
        {
          type: "update-structured-content",
          action: "replace",
          content: {
            type: "datatable",
            version: "1.0",
            title: "Updated Users",
            columns: [
              { key: "name", label: "Name", type: "text" },
              { key: "role", label: "Role", type: "text" },
            ],
            rows: [
              { id: "10", name: "Xavier New", role: "Engineer" },
              { id: "11", name: "Yvonne Fresh", role: "Designer" },
            ],
          },
        },
        "*",
      );
    });

    await page.waitForTimeout(1_000);

    bodyText = await frame.locator("body").textContent();
    expect(bodyText).toContain("Xavier New");
    expect(bodyText).not.toContain("Alice Johnson");
  });
});

test.describe("streaming: merge updates", () => {
  test("counter: merge preserves unspecified fields", async ({ page }) => {
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
    await page.waitForTimeout(500);

    // Verify initial label is present
    const frame = page.frameLocator("iframe");
    let bodyText = await frame.locator("body").textContent();
    expect(bodyText).toContain("Monthly Revenue");

    // Send merge update — only change value, keep label
    await page.evaluate(() => {
      const iframe = document.querySelector("iframe")!;
      iframe.contentWindow!.postMessage(
        {
          type: "update-structured-content",
          action: "merge",
          content: {
            type: "counter",
            version: "1.0",
            value: 55555,
          },
        },
        "*",
      );
    });

    await page.waitForTimeout(1_000);

    bodyText = await frame.locator("body").textContent();
    // New value should be present
    expect(bodyText).toContain("55,555");
    // Original label should be preserved (merge, not replace)
    expect(bodyText).toContain("Monthly Revenue");
  });
});

test.describe("streaming: ext-apps then postMessage update", () => {
  test("counter: ext-apps delivery then postMessage update", async ({
    page,
  }) => {
    const fixture = fixtures["counter"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    // Start with ext-apps protocol
    await page.goto(
      `/harness.html?view=counter&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    // Verify initial ext-apps data rendered
    const frame = page.frameLocator("iframe");
    let bodyText = await frame.locator("body").textContent();
    expect(bodyText).toContain("48,250");

    // Now send a postMessage update (dashboard-style) to the same iframe
    await page.evaluate(() => {
      const iframe = document.querySelector("iframe")!;
      iframe.contentWindow!.postMessage(
        {
          type: "update-structured-content",
          action: "replace",
          content: {
            type: "counter",
            version: "1.0",
            value: 12345,
            label: "Updated via postMessage",
          },
        },
        "*",
      );
    });

    await page.waitForTimeout(1_000);

    bodyText = await frame.locator("body").textContent();
    expect(bodyText).toContain("12,345");
  });
});
